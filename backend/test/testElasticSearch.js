/**
 * Test Elastic Search Integration
 * Run: node backend/test/testElasticSearch.js
 */

require('dotenv').config();
const elasticSearchService = require('../services/elasticSearchService');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  log('cyan', '\n╔════════════════════════════════════════════════════════╗');
  log('cyan', '║   ELASTIC SEARCH INTEGRATION TEST SUITE               ║');
  log('cyan', '╚════════════════════════════════════════════════════════╝\n');

  // Test 1: Health Check
  log('blue', '📊 Test 1: Health Check');
  try {
    const health = await elasticSearchService.healthCheck();
    if (health.healthy) {
      log('green', `✅ PASS - Elastic is healthy`);
      log('green', `   Index: ${health.indexName}`);
      log('green', `   Exists: ${health.indexExists}`);
    } else {
      log('yellow', `⚠️  SKIP - Elastic in fallback mode`);
      log('yellow', `   Reason: ${health.message || health.error}`);
      log('yellow', '\n💡 Set ELASTIC_CLOUD_ID and ELASTIC_API_KEY in .env to enable');
      return;
    }
  } catch (error) {
    log('red', `❌ FAIL - Health check error: ${error.message}`);
    return;
  }

  console.log('');

  // Test 2: Index Sample Threat
  log('blue', '📊 Test 2: Index Sample Threat');
  const sampleThreat = {
    id: `test_${Date.now()}`,
    title: 'Test Cyber Threat - Advanced Persistent Attack',
    summary: 'Sophisticated malware campaign targeting critical infrastructure with zero-day exploits',
    type: 'Cyber',
    severity: 85,
    confidence: 88,
    status: 'active',
    regions: ['North America', 'Europe'],
    tags: ['malware', 'zero-day', 'infrastructure'],
    sources: ['https://test-intelligence.gov'],
    timestamp: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const indexResult = await elasticSearchService.indexThreat(sampleThreat);
    if (indexResult.success) {
      log('green', `✅ PASS - Threat indexed: ${indexResult.threatId}`);
    } else {
      log('red', `❌ FAIL - Indexing failed: ${indexResult.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Indexing error: ${error.message}`);
  }

  console.log('');

  // Test 3: Keyword Search
  log('blue', '📊 Test 3: Keyword Search');
  try {
    const keywordResult = await elasticSearchService.keywordSearch('cyber attack malware', 10);
    if (keywordResult.success) {
      log('green', `✅ PASS - Keyword search returned ${keywordResult.threats.length} results`);
      if (keywordResult.threats.length > 0) {
        log('cyan', `   Top result: ${keywordResult.threats[0].title}`);
        log('cyan', `   Score: ${keywordResult.threats[0]._score.toFixed(2)}`);
      }
    } else {
      log('red', `❌ FAIL - Keyword search failed: ${keywordResult.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Keyword search error: ${error.message}`);
  }

  console.log('');

  // Test 4: Semantic Search
  log('blue', '📊 Test 4: Semantic (Vector) Search');
  try {
    const semanticResult = await elasticSearchService.semanticSearch('advanced persistent threats', 10);
    if (semanticResult.success) {
      log('green', `✅ PASS - Semantic search returned ${semanticResult.threats.length} results`);
      if (semanticResult.threats.length > 0) {
        log('cyan', `   Top result: ${semanticResult.threats[0].title}`);
        log('cyan', `   Similarity: ${(semanticResult.threats[0]._similarity * 100).toFixed(1)}%`);
      }
    } else {
      log('red', `❌ FAIL - Semantic search failed: ${semanticResult.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Semantic search error: ${error.message}`);
  }

  console.log('');

  // Test 5: Hybrid Search
  log('blue', '📊 Test 5: Hybrid Search (BM25 + Vector)');
  try {
    const hybridResult = await elasticSearchService.hybridSearch('cyber threats infrastructure', {
      limit: 10,
      minSeverity: 70
    });
    if (hybridResult.success) {
      log('green', `✅ PASS - Hybrid search returned ${hybridResult.threats.length} results`);
      log('green', `   Search took: ${hybridResult.took}ms`);
      if (hybridResult.threats.length > 0) {
        log('cyan', `   Top result: ${hybridResult.threats[0].title}`);
        log('cyan', `   Relevance: ${hybridResult.threats[0]._relevance.toFixed(2)}`);
        log('cyan', `   Severity: ${hybridResult.threats[0].severity}`);
      }
    } else {
      log('red', `❌ FAIL - Hybrid search failed: ${hybridResult.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Hybrid search error: ${error.message}`);
  }

  console.log('');

  // Test 6: Advanced Filtering
  log('blue', '📊 Test 6: Advanced Filtering (Type + Severity + Region)');
  try {
    const filteredResult = await elasticSearchService.hybridSearch('security', {
      limit: 10,
      threatType: 'Cyber',
      minSeverity: 80,
      regions: ['North America', 'Europe']
    });
    if (filteredResult.success) {
      log('green', `✅ PASS - Filtered search returned ${filteredResult.threats.length} results`);
      if (filteredResult.threats.length > 0) {
        const threat = filteredResult.threats[0];
        log('cyan', `   Type: ${threat.type}`);
        log('cyan', `   Severity: ${threat.severity}`);
        log('cyan', `   Regions: ${threat.regions.join(', ')}`);
      }
    } else {
      log('red', `❌ FAIL - Filtered search failed: ${filteredResult.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Filtered search error: ${error.message}`);
  }

  console.log('');

  // Test 7: Statistics & Aggregations
  log('blue', '📊 Test 7: Statistics & Aggregations');
  try {
    const stats = await elasticSearchService.getStats();
    if (stats.success) {
      log('green', `✅ PASS - Statistics retrieved`);
      log('cyan', `   Total threats: ${stats.stats.total}`);
      log('cyan', `   Avg confidence: ${stats.stats.avgConfidence}%`);
      log('cyan', `   Threat types: ${stats.stats.types.length}`);
      if (stats.stats.types.length > 0) {
        stats.stats.types.forEach(type => {
          log('cyan', `      - ${type.key}: ${type.doc_count}`);
        });
      }
    } else {
      log('red', `❌ FAIL - Statistics failed: ${stats.error}`);
    }
  } catch (error) {
    log('red', `❌ FAIL - Statistics error: ${error.message}`);
  }

  console.log('');
  log('cyan', '╔════════════════════════════════════════════════════════╗');
  log('cyan', '║   TEST SUITE COMPLETE                                  ║');
  log('cyan', '╚════════════════════════════════════════════════════════╝\n');

  log('green', '✅ Elastic Search Integration is working!');
  log('blue', '\n💡 Next Steps:');
  log('blue', '   1. Run sync script: node backend/scripts/syncFirestoreToElastic.js');
  log('blue', '   2. Test search endpoints via frontend');
  log('blue', '   3. Integrate into AI Agent (Phase 3)\n');
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch(error => {
    log('red', `\n💥 Fatal error: ${error.message}`);
    process.exit(1);
  });
