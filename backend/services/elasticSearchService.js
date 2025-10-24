const { Client } = require('@elastic/elasticsearch');
const geminiClient = require('../utils/geminiClient');

class ElasticSearchService {
  constructor() {
    this.cloudId = process.env.ELASTIC_CLOUD_ID;
    this.apiKey = process.env.ELASTIC_API_KEY;
    this.indexName = 'global-sentinel-threats';
    
    if (!this.cloudId || !this.apiKey) {
      throw new Error('❌ Elastic Cloud credentials required! Set ELASTIC_CLOUD_ID and ELASTIC_API_KEY in backend/.env');
    }

    try {
      this.client = new Client({
        cloud: {
          id: this.cloudId
        },
        auth: {
          apiKey: this.apiKey
        }
      });
      
      console.log('✅ Elastic Search client initialized');
      
      // Initialize index on startup
      this.initializeIndex().catch(err => {
        console.error('❌ Failed to initialize Elastic index:', err.message);
        throw err;
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Elastic client:', error.message);
      throw error;
    }
  }

  async initializeIndex() {
    try {
      console.log(`🔍 Checking if index exists: ${this.indexName}`);
      const indexExists = await this.client.indices.exists({ index: this.indexName });
      
      if (!indexExists) {
        console.log(`🔧 Creating Elastic index: ${this.indexName}`);
        
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              analysis: {
                analyzer: {
                  threat_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
                }
              }
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { 
                  type: 'text',
                  analyzer: 'threat_analyzer',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                summary: { 
                  type: 'text',
                  analyzer: 'threat_analyzer'
                },
                type: { type: 'keyword' },
                severity: { type: 'integer' },
                confidence: { type: 'integer' },
                status: { type: 'keyword' },
                regions: { type: 'keyword' },
                tags: { type: 'keyword' },
                sources: { type: 'keyword' },
                location: { type: 'keyword' },
                signal_type: { type: 'keyword' },
                timestamp: { type: 'date' },
                updatedAt: { type: 'date' },
                indexed_at: { type: 'date' },
                // Vector field for semantic search
                threat_vector: {
                  type: 'dense_vector',
                  dims: 768, // Gemini embedding dimension
                  index: true,
                  similarity: 'cosine'
                },
                // Additional metadata
                votes: {
                  properties: {
                    credible: { type: 'integer' },
                    not_credible: { type: 'integer' }
                  }
                }
              }
            }
          }
        });
        
        console.log(`✅ Index ${this.indexName} created successfully`);
      } else {
        console.log(`✅ Index ${this.indexName} already exists`);
      }
    } catch (error) {
      console.error('❌ Index initialization failed:', error.message);
      throw error;
    }
  }

  async getEmbedding(text) {
    try {
      // Use Gemini's text embedding model
      // Note: This is a simplified version. In production, you'd use:
      // const { TextEmbeddingModel } = require('@google-cloud/vertexai');
      
      // For now, we'll generate a mock embedding vector
      // In production, replace this with actual Gemini embedding API
      const embeddingSize = 768;
      const embedding = Array.from({ length: embeddingSize }, () => Math.random() * 2 - 1);
      
      // Normalize the vector
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map(val => val / magnitude);
      
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  async indexThreat(threat) {
    try {
      console.log(`🔍 Indexing threat: ${threat.title}`);
      
      // Generate embedding for the threat
      const threatText = `${threat.title} ${threat.summary}`;
      const embedding = await this.getEmbedding(threatText);
      
      const document = {
        ...threat,
        threat_vector: embedding,
        indexed_at: new Date().toISOString()
      };

      await this.client.index({
        index: this.indexName,
        id: threat.id,
        document,
        refresh: 'wait_for' // Ensure searchable immediately
      });

      console.log(`✅ Threat indexed successfully: ${threat.id}`);
      
      return { success: true, threatId: threat.id };
      
    } catch (error) {
      console.error('❌ Threat indexing failed:', error);
      return { success: false, error: error.message };
    }
  }

  async bulkIndexThreats(threats) {
    try {
      console.log(`🔍 Bulk indexing ${threats.length} threats...`);
      
      const operations = [];
      
      for (const threat of threats) {
        const threatText = `${threat.title} ${threat.summary}`;
        const embedding = await this.getEmbedding(threatText);
        
        operations.push(
          { index: { _index: this.indexName, _id: threat.id } },
          { ...threat, threat_vector: embedding, indexed_at: new Date().toISOString() }
        );
      }

      const bulkResponse = await this.client.bulk({
        operations,
        refresh: 'wait_for'
      });

      if (bulkResponse.errors) {
        console.error('⚠️ Some threats failed to index');
      }

      const successCount = bulkResponse.items.filter(item => !item.index.error).length;
      console.log(`✅ Bulk indexed ${successCount}/${threats.length} threats`);
      
      return { 
        success: true, 
        indexed: successCount,
        failed: threats.length - successCount 
      };
      
    } catch (error) {
      console.error('❌ Bulk indexing failed:', error);
      return { success: false, error: error.message };
    }
  }

  async hybridSearch(query, options = {}) {
    try {
      const {
        limit = 50,
        threatType = null,
        minSeverity = 0,
        regions = [],
        includeInactive = false
      } = options;

      console.log(`🔍 Hybrid search for: "${query}"`);
      
      // Generate query embedding for vector search
      const queryEmbedding = await this.getEmbedding(query);

      // Build filter conditions
      const filters = [];
      
      if (!includeInactive) {
        filters.push({ term: { status: 'active' } });
      }
      
      if (threatType) {
        filters.push({ term: { type: threatType } });
      }
      
      if (minSeverity > 0) {
        filters.push({ range: { severity: { gte: minSeverity } } });
      }
      
      if (regions.length > 0) {
        filters.push({ terms: { regions: regions } });
      }

      // Hybrid search query combining:
      // 1. BM25 keyword search (traditional relevance)
      // 2. Vector similarity search (semantic understanding)
      const searchQuery = {
        bool: {
          should: [
            // Keyword search with BM25
            {
              multi_match: {
                query: query,
                fields: ['title^3', 'summary^2', 'type', 'tags'],
                type: 'best_fields',
                boost: 1.0
              }
            },
            // Vector semantic search
            {
              script_score: {
                query: { match_all: {} },
                script: {
                  source: "cosineSimilarity(params.query_vector, 'threat_vector') + 1.0",
                  params: {
                    query_vector: queryEmbedding
                  }
                },
                boost: 2.0 // Boost semantic search higher
              }
            }
          ],
          minimum_should_match: 1,
          filter: filters.length > 0 ? filters : undefined
        }
      };

      const result = await this.client.search({
        index: this.indexName,
        size: limit,
        query: searchQuery,
        sort: [
          '_score',
          { severity: 'desc' },
          { timestamp: 'desc' }
        ]
      });

      const threats = result.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score,
        _relevance: hit._score
      }));

      console.log(`✅ Hybrid search returned ${threats.length} threats`);

      return {
        success: true,
        threats,
        total: result.hits.total.value,
        took: result.took,
        searchType: 'hybrid'
      };

    } catch (error) {
      console.error('❌ Hybrid search failed:', error);
      return {
        success: false,
        error: error.message,
        threats: [],
        total: 0
      };
    }
  }

  async semanticSearch(query, limit = 50) {
    try {
      console.log(`🧠 Semantic search for: "${query}"`);
      
      const queryEmbedding = await this.getEmbedding(query);

      const result = await this.client.search({
        index: this.indexName,
        size: limit,
        query: {
          script_score: {
            query: {
              bool: {
                filter: [{ term: { status: 'active' } }]
              }
            },
            script: {
              source: "cosineSimilarity(params.query_vector, 'threat_vector') + 1.0",
              params: {
                query_vector: queryEmbedding
              }
            }
          }
        }
      });

      const threats = result.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score,
        _similarity: hit._score - 1.0 // Normalize back to 0-1
      }));

      console.log(`✅ Semantic search returned ${threats.length} threats`);

      return {
        success: true,
        threats,
        total: result.hits.total.value,
        searchType: 'semantic'
      };

    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return {
        success: false,
        error: error.message,
        threats: [],
        total: 0
      };
    }
  }

  async keywordSearch(query, limit = 50) {
    try{
      console.log(`📝 Keyword search for: "${query}"`);

      const result = await this.client.search({
        index: this.indexName,
        size: limit,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: ['title^3', 'summary^2', 'type', 'tags'],
                  type: 'best_fields'
                }
              }
            ],
            filter: [
              { term: { status: 'active' } }
            ]
          }
        },
        sort: [
          '_score',
          { severity: 'desc' }
        ]
      });

      const threats = result.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score
      }));

      console.log(`✅ Keyword search returned ${threats.length} threats`);

      return {
        success: true,
        threats,
        total: result.hits.total.value,
        searchType: 'keyword'
      };

    } catch (error) {
      console.error('❌ Keyword search failed:', error);
      return {
        success: false,
        error: error.message,
        threats: [],
        total: 0
      };
    }
  }

  async getThreatById(threatId) {
    try {
      const result = await this.client.get({
        index: this.indexName,
        id: threatId
      });

      return {
        success: true,
        threat: result._source
      };

    } catch (error) {
      if (error.meta?.statusCode === 404) {
        return { success: false, error: 'Threat not found' };
      }
      console.error('❌ Get threat failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getStats() {
    try {
      const result = await this.client.search({
        index: this.indexName,
        size: 0,
        query: { match_all: {} },
        aggs: {
          total_threats: {
            value_count: { field: 'id.keyword' }
          },
          by_type: {
            terms: { field: 'type', size: 20 }
          },
          by_severity: {
            range: {
              field: 'severity',
              ranges: [
                { to: 40, key: 'low' },
                { from: 40, to: 70, key: 'medium' },
                { from: 70, key: 'high' }
              ]
            }
          },
          by_region: {
            terms: { field: 'regions', size: 50 }
          },
          avg_confidence: {
            avg: { field: 'confidence' }
          }
        }
      });

      return {
        success: true,
        stats: {
          total: result.hits.total.value,
          types: result.aggregations.by_type.buckets,
          severity: result.aggregations.by_severity.buckets,
          regions: result.aggregations.by_region.buckets,
          avgConfidence: Math.round(result.aggregations.avg_confidence.value)
        }
      };

    } catch (error) {
      console.error('❌ Get stats failed:', error);
      return { success: false, error: error.message };
    }
  }

  async healthCheck() {
    if (this.fallbackMode) {
      return { 
        healthy: false, 
        fallbackMode: true,
        message: 'Elastic credentials not configured' 
      };
    }

    try {
      await this.client.ping();
      
      const indexExists = await this.client.indices.exists({ index: this.indexName });
      
      return {
        healthy: true,
        connected: true,
        indexExists: indexExists,
        indexName: this.indexName
      };

    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = new ElasticSearchService();
