const express = require('express');
const elasticSearchService = require('../services/elasticSearchService');
const router = express.Router();

// POST /api/elastic/search - Hybrid search endpoint
router.post('/search', async (req, res) => {
  try {
    const { query, searchType = 'hybrid', limit = 50, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    let result;
    
    switch (searchType) {
      case 'semantic':
        result = await elasticSearchService.semanticSearch(query, limit);
        break;
      case 'keyword':
        result = await elasticSearchService.keywordSearch(query, limit);
        break;
      case 'hybrid':
      default:
        result = await elasticSearchService.hybridSearch(query, { limit, ...options });
        break;
    }

    res.json(result);
    
  } catch (error) {
    console.error('❌ Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// POST /api/elastic/index - Index a single threat
router.post('/index', async (req, res) => {
  try {
    const threat = req.body;
    
    if (!threat.id || !threat.title) {
      return res.status(400).json({
        success: false,
        error: 'Threat must have id and title'
      });
    }

    const result = await elasticSearchService.indexThreat(threat);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Index endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Indexing failed',
      message: error.message
    });
  }
});

// POST /api/elastic/bulk-index - Bulk index threats
router.post('/bulk-index', async (req, res) => {
  try {
    const { threats } = req.body;
    
    if (!Array.isArray(threats) || threats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Threats array is required'
      });
    }

    const result = await elasticSearchService.bulkIndexThreats(threats);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Bulk index endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk indexing failed',
      message: error.message
    });
  }
});

// GET /api/elastic/threat/:id - Get threat by ID
router.get('/threat/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await elasticSearchService.getThreatById(id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Get threat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get threat',
      message: error.message
    });
  }
});

// GET /api/elastic/stats - Get threat statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await elasticSearchService.getStats();
    res.json(result);
    
  } catch (error) {
    console.error('❌ Stats endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

// GET /api/elastic/health - Health check
router.get('/health', async (req, res) => {
  try {
    const result = await elasticSearchService.healthCheck();
    res.json(result);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      healthy: false,
      error: error.message
    });
  }
});

module.exports = router;
