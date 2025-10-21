/**
 * Sync Firestore threats to Elastic Search
 * Run this script to bulk-index existing Firestore threats into Elastic
 * 
 * Usage: node backend/scripts/syncFirestoreToElastic.js
 */

require('dotenv').config();
const { getFirestore, isDemoMode } = require('../config/firebase');
const elasticSearchService = require('../services/elasticSearchService');

async function syncThreats() {
  console.log('🔄 Starting Firestore → Elastic sync...\n');

  try {
    // Check Elastic health
    const healthCheck = await elasticSearchService.healthCheck();
    
    if (!healthCheck.healthy) {
      console.error('❌ Elastic Search is not healthy:', healthCheck);
      console.log('\n💡 Make sure ELASTIC_CLOUD_ID and ELASTIC_API_KEY are set in .env');
      process.exit(1);
    }

    console.log('✅ Elastic Search is healthy');
    console.log(`   Index: ${healthCheck.indexName}`);
    console.log(`   Exists: ${healthCheck.indexExists}\n`);

    if (isDemoMode()) {
      console.log('⚠️ Running in demo mode - no Firestore data to sync');
      process.exit(0);
    }

    // Fetch all threats from Firestore
    const db = getFirestore();
    console.log('📦 Fetching threats from Firestore...');
    
    const snapshot = await db.collection('threats').get();
    
    if (snapshot.empty) {
      console.log('📭 No threats found in Firestore');
      process.exit(0);
    }

    const threats = [];
    snapshot.forEach(doc => {
      threats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${threats.length} threats in Firestore\n`);

    // Bulk index to Elastic
    console.log('🔍 Starting bulk indexing to Elastic...');
    const result = await elasticSearchService.bulkIndexThreats(threats);

    if (result.success) {
      console.log('\n✅ Sync completed successfully!');
      console.log(`   Indexed: ${result.indexed}`);
      console.log(`   Failed: ${result.failed || 0}`);
      
      // Get stats
      const stats = await elasticSearchService.getStats();
      if (stats.success) {
        console.log('\n📊 Elastic Search Stats:');
        console.log(`   Total threats: ${stats.stats.total}`);
        console.log(`   Avg confidence: ${stats.stats.avgConfidence}%`);
      }
    } else {
      console.error('\n❌ Sync failed:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Sync error:', error);
    process.exit(1);
  }
}

// Run sync
syncThreats()
  .then(() => {
    console.log('\n🎉 Sync process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
