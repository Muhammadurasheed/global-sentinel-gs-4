const express = require('express');
const elasticSearchService = require('../services/elasticSearchService');
const router = express.Router();

/**
 * POST /api/elastic/advanced/suggestions
 * Get search suggestions (autocomplete)
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { prefix, limit = 5 } = req.body;
    
    if (!prefix) {
      return res.status(400).json({
        success: false,
        error: 'Prefix parameter is required'
      });
    }

    const result = await elasticSearchService.getSuggestions(prefix, limit);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Suggestions endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      message: error.message
    });
  }
});

/**
 * GET /api/elastic/advanced/similar/:threatId
 * Find similar threats using More Like This
 */
router.get('/similar/:threatId', async (req, res) => {
  try {
    const { threatId } = req.params;
    const { limit = 10 } = req.query;
    
    const result = await elasticSearchService.findSimilarThreats(threatId, parseInt(limit));
    res.json(result);
    
  } catch (error) {
    console.error('❌ Similar threats endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find similar threats',
      message: error.message
    });
  }
});

/**
 * POST /api/elastic/advanced/correlate
 * Advanced threat correlation across multiple dimensions
 */
router.post('/correlate', async (req, res) => {
  try {
    const { threats, correlationType = 'semantic' } = req.body;
    
    if (!Array.isArray(threats) || threats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Threats array is required'
      });
    }

    // Find patterns and correlations
    const correlations = await Promise.all(
      threats.map(threat => 
        elasticSearchService.findSimilarThreats(threat.id, 5)
      )
    );

    // Build correlation graph
    const correlationGraph = {
      nodes: threats,
      edges: [],
      clusters: []
    };

    correlations.forEach((result, idx) => {
      if (result.success) {
        result.threats.forEach(similar => {
          correlationGraph.edges.push({
            source: threats[idx].id,
            target: similar.id,
            weight: similar._similarity,
            type: correlationType
          });
        });
      }
    });

    res.json({
      success: true,
      correlations: correlationGraph
    });
    
  } catch (error) {
    console.error('❌ Correlation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Correlation analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/elastic/advanced/analytics
 * Get comprehensive analytics dashboard data
 */
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const stats = await elasticSearchService.getStats();
    
    if (!stats.success) {
      return res.status(500).json(stats);
    }

    // Enhance with computed metrics
    const analytics = {
      ...stats,
      computed: {
        threatVelocity: calculateThreatVelocity(stats.stats.recentTrends),
        criticalityIndex: calculateCriticalityIndex(stats.stats),
        regionalHotspots: identifyHotspots(stats.stats.regions),
        emergingPatterns: identifyEmergingPatterns(stats.stats)
      }
    };

    res.json(analytics);
    
  } catch (error) {
    console.error('❌ Analytics endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics generation failed',
      message: error.message
    });
  }
});

/**
 * Helper: Calculate threat velocity (threats per day trend)
 */
function calculateThreatVelocity(recentTrends) {
  if (!recentTrends || recentTrends.length < 2) {
    return { trend: 'stable', value: 0 };
  }

  const recent = recentTrends.slice(-7); // Last 7 days
  const avg = recent.reduce((sum, day) => sum + day.doc_count, 0) / recent.length;
  const lastDay = recent[recent.length - 1].doc_count;
  const change = ((lastDay - avg) / avg) * 100;

  return {
    trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
    value: Math.round(change),
    avgPerDay: Math.round(avg),
    lastDay: lastDay
  };
}

/**
 * Helper: Calculate overall criticality index
 */
function calculateCriticalityIndex(stats) {
  const criticalThreats = stats.severityDistribution?.find(s => s.key === 'critical')?.doc_count || 0;
  const highThreats = stats.severityDistribution?.find(s => s.key === 'high')?.doc_count || 0;
  const total = stats.total || 1;

  const criticalityScore = ((criticalThreats * 1.0) + (highThreats * 0.6)) / total * 100;

  return {
    score: Math.round(criticalityScore),
    level: criticalityScore > 50 ? 'critical' : criticalityScore > 30 ? 'high' : criticalityScore > 15 ? 'medium' : 'low',
    criticalCount: criticalThreats,
    highCount: highThreats
  };
}

/**
 * Helper: Identify regional hotspots
 */
function identifyHotspots(regions) {
  if (!regions || regions.length === 0) return [];

  const sorted = [...regions].sort((a, b) => b.doc_count - a.doc_count);
  const topRegions = sorted.slice(0, 5);
  const avgCount = sorted.reduce((sum, r) => sum + r.doc_count, 0) / sorted.length;

  return topRegions
    .filter(r => r.doc_count > avgCount * 1.2) // 20% above average
    .map(r => ({
      region: r.key,
      threatCount: r.doc_count,
      intensity: Math.round((r.doc_count / avgCount) * 100)
    }));
}

/**
 * Helper: Identify emerging patterns from tags
 */
function identifyEmergingPatterns(stats) {
  if (!stats.topTags || stats.topTags.length === 0) return [];

  const patterns = stats.topTags
    .slice(0, 10)
    .map(tag => ({
      pattern: tag.key,
      frequency: tag.doc_count,
      prevalence: Math.round((tag.doc_count / stats.total) * 100)
    }));

  return patterns;
}

module.exports = router;
