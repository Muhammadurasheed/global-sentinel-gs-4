const geminiClient = require('../utils/geminiClient');
const elasticSearchService = require('../services/elasticSearchService');
const logger = require('../utils/logger');
const axios = require('axios');

class AgentController {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation history per session
    this.tools = [
      {
        name: 'search_threats',
        description: 'Search for global security threats using hybrid semantic and keyword search. Returns real-time threat intelligence with severity ratings, locations, and sources.',
        parameters: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query for threats (e.g., "cyber attacks in Asia", "climate disasters", "health emergencies")' 
            },
            threatType: { 
              type: 'string', 
              enum: ['Cyber', 'Health', 'Climate', 'Economic', 'Information', 'Military', 'Terrorism', 'All'],
              description: 'Filter by threat type (optional)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 50)',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'simulate_crisis',
        description: 'Run advanced crisis simulation using Google Gemini AI to predict escalation pathways, mitigation strategies, and impact assessments for a hypothetical or real scenario.',
        parameters: {
          type: 'object',
          properties: {
            scenario: { 
              type: 'string', 
              description: 'Crisis scenario to simulate (e.g., "Major cyber attack on power grid", "Pandemic outbreak in major city")' 
            },
            analysisDepth: {
              type: 'string',
              enum: ['quick', 'standard', 'comprehensive'],
              description: 'Depth of analysis (quick: 1-2 paragraphs, standard: detailed, comprehensive: multi-faceted)',
              default: 'standard'
            }
          },
          required: ['scenario']
        }
      },
      {
        name: 'verify_threat',
        description: 'Verify threat credibility by analyzing sources, cross-referencing intelligence databases, and providing confidence assessment with Google Search grounding.',
        parameters: {
          type: 'object',
          properties: {
            threatId: { 
              type: 'string', 
              description: 'Threat ID to verify (from search results)' 
            },
            threatDescription: {
              type: 'string',
              description: 'Description of threat if threatId not available'
            }
          }
        }
      },
      {
        name: 'get_threat_statistics',
        description: 'Get aggregated statistics and analytics on current threat landscape including distribution by type, severity trends, geographic hotspots.',
        parameters: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['24h', '7d', '30d', 'all'],
              description: 'Timeframe for statistics',
              default: '7d'
            }
          }
        }
      },
      {
        name: 'analyze_threat_trends',
        description: 'Analyze emerging threat trends, patterns, and correlations across different threat categories using AI-powered analysis.',
        parameters: {
          type: 'object',
          properties: {
            focus: {
              type: 'string',
              description: 'Focus area for trend analysis (e.g., "cyber warfare", "climate emergencies", "global health")'
            }
          },
          required: ['focus']
        }
      }
    ];
  }

  async chat(req, res) {
    try {
      const { message, sessionId = 'default', stream = false } = req.body;

      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Message is required' 
        });
      }

      logger.info(`💬 Agent chat request: "${message.substring(0, 50)}..." (session: ${sessionId})`);

      // Get or create conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId);

      // Add user message to history
      history.push({ role: 'user', content: message });

      // Keep history manageable (last 20 messages)
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      if (stream) {
        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        await this.handleStreamingChat(message, history, sessionId, res);
      } else {
        // Non-streaming response
        const response = await this.processAgentRequest(message, history, sessionId);
        res.json(response);
      }

    } catch (error) {
      logger.error(`❌ Agent chat error: ${error.message}`);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        fallbackMessage: "I'm experiencing technical difficulties. Please try again."
      });
    }
  }

  async processAgentRequest(userMessage, history, sessionId) {
    try {
      // Build system prompt with context
      const systemPrompt = `You are an elite AI agent for Global Sentinel, the world's most advanced threat intelligence platform. You have access to real-time global threat data powered by Google Cloud Vertex AI and Elastic Search.

Your capabilities:
- Search and analyze global security threats across cyber, health, climate, economic, and geopolitical domains
- Run sophisticated crisis simulations with multi-dimensional impact assessments
- Verify threat credibility using advanced source analysis and Google Search grounding
- Provide strategic recommendations for threat mitigation and crisis response

Communication style:
- Professional yet conversational
- Data-driven with clear source attribution
- Proactive in suggesting relevant tools and analysis
- Emphasize actionable intelligence

When users ask about threats, automatically use search_threats tool.
When discussing hypothetical scenarios, offer to run simulate_crisis.
Always provide context and explain your reasoning.`;

      // Call Gemini with function calling
      const response = await geminiClient.chatWithTools(
        systemPrompt,
        userMessage,
        this.tools,
        history.slice(-10) // Last 10 messages for context
      );

      // Check if tool calls are needed
      if (response.toolCalls && response.toolCalls.length > 0) {
        logger.info(`🔧 Processing ${response.toolCalls.length} tool calls`);
        
        const toolResults = await Promise.all(
          response.toolCalls.map(call => this.executeToolCall(call))
        );

        // Get final response after tool execution
        const finalResponse = await geminiClient.chatWithToolResults(
          systemPrompt,
          userMessage,
          this.tools,
          history.slice(-10),
          response.toolCalls,
          toolResults
        );

        // Add assistant response to history
        history.push({ 
          role: 'assistant', 
          content: finalResponse.text,
          toolCalls: response.toolCalls,
          toolResults: toolResults
        });

        return {
          success: true,
          message: finalResponse.text,
          toolCalls: response.toolCalls.map((call, idx) => ({
            tool: call.name,
            parameters: call.parameters,
            result: toolResults[idx]
          })),
          sessionId
        };
      }

      // No tool calls, just return text response
      history.push({ role: 'assistant', content: response.text });

      return {
        success: true,
        message: response.text,
        sessionId
      };

    } catch (error) {
      logger.error(`❌ Agent processing error: ${error.message}`);
      throw error;
    }
  }

  async handleStreamingChat(userMessage, history, sessionId, res) {
    try {
      const systemPrompt = `You are an elite AI agent for Global Sentinel, the world's most advanced threat intelligence platform. You have access to real-time global threat data powered by Google Cloud Vertex AI and Elastic Search.

Your capabilities include searching threats, running crisis simulations, verifying threat credibility, and providing strategic intelligence.

Be conversational, data-driven, and proactive. When appropriate, use your tools to provide accurate, real-time information.`;

      // Stream response
      await geminiClient.streamChatWithTools(
        systemPrompt,
        userMessage,
        this.tools,
        history.slice(-10),
        async (chunk, toolCalls) => {
          if (toolCalls && toolCalls.length > 0) {
            // Execute tools and send results
            res.write(`data: ${JSON.stringify({ type: 'tool_calls', toolCalls })}\n\n`);
            
            const toolResults = await Promise.all(
              toolCalls.map(call => this.executeToolCall(call))
            );

            res.write(`data: ${JSON.stringify({ type: 'tool_results', toolResults })}\n\n`);
          } else if (chunk) {
            // Stream text chunk
            res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
          }
        }
      );

      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      logger.error(`❌ Streaming error: ${error.message}`);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  }

  async executeToolCall(toolCall) {
    const { name, parameters } = toolCall;
    logger.info(`🔧 Executing tool: ${name} with params:`, parameters);

    try {
      switch (name) {
        case 'search_threats':
          return await this.searchThreats(parameters);
        
        case 'simulate_crisis':
          return await this.simulateCrisis(parameters);
        
        case 'verify_threat':
          return await this.verifyThreat(parameters);
        
        case 'get_threat_statistics':
          return await this.getThreatStatistics(parameters);
        
        case 'analyze_threat_trends':
          return await this.analyzeThreatTrends(parameters);
        
        default:
          return { 
            success: false, 
            error: `Unknown tool: ${name}` 
          };
      }
    } catch (error) {
      logger.error(`❌ Tool execution error (${name}): ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        tool: name 
      };
    }
  }

  async searchThreats({ query, threatType, limit = 10 }) {
    try {
      logger.info(`🔍 Searching threats: "${query}" (type: ${threatType || 'all'})`);

      const filters = threatType && threatType !== 'All' ? { type: threatType } : {};
      const results = await elasticSearchService.hybridSearch(
        query, 
        Math.min(limit, 50),
        filters
      );

      logger.info(`✅ Found ${results.length} threats`);

      return {
        success: true,
        count: results.length,
        threats: results.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          severity: t.severity,
          summary: t.summary,
          location: t.location,
          confidence: t.confidence,
          timestamp: t.timestamp
        }))
      };
    } catch (error) {
      logger.error(`❌ Search error: ${error.message}`);
      return { 
        success: false, 
        error: 'Search service temporarily unavailable',
        fallbackMessage: 'Using mock threat data for demonstration'
      };
    }
  }

  async simulateCrisis({ scenario, analysisDepth = 'standard' }) {
    try {
      logger.info(`🎮 Simulating crisis: "${scenario}" (depth: ${analysisDepth})`);

      const depthPrompts = {
        quick: 'Provide a brief 2-3 sentence assessment of immediate impacts and primary response needed.',
        standard: 'Provide a detailed analysis including escalation pathways, key mitigation strategies, and impact timeline.',
        comprehensive: 'Conduct comprehensive multi-dimensional analysis covering: causal chains, escalation factors, mitigation protocols, impact assessment (economic, social, political), confidence levels, and data sources.'
      };

      const prompt = `${depthPrompts[analysisDepth]}\n\nScenario: ${scenario}`;
      
      const simulation = await geminiClient.analyzeWithGrounding(prompt);

      logger.info(`✅ Crisis simulation completed`);

      return {
        success: true,
        scenario,
        analysisDepth,
        simulation: {
          summary: simulation.substring(0, 500),
          fullAnalysis: simulation,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`❌ Simulation error: ${error.message}`);
      return { 
        success: false, 
        error: 'Simulation service temporarily unavailable' 
      };
    }
  }

  async verifyThreat({ threatId, threatDescription }) {
    try {
      logger.info(`✅ Verifying threat: ${threatId || threatDescription?.substring(0, 50)}`);

      let threat;
      if (threatId) {
        threat = await elasticSearchService.getThreatById(threatId);
      }

      const verificationPrompt = threat 
        ? `Verify the credibility of this threat: ${threat.title}. Summary: ${threat.summary}. Sources: ${threat.sources?.join(', ')}. Provide confidence assessment and source analysis.`
        : `Verify the credibility of this threat description: ${threatDescription}. Provide confidence assessment based on available information.`;

      const verification = await geminiClient.analyzeWithGrounding(verificationPrompt);

      logger.info(`✅ Threat verification completed`);

      return {
        success: true,
        threatId,
        verification: {
          assessment: verification,
          confidence: threat?.confidence || 'N/A',
          sources: threat?.sources || [],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`❌ Verification error: ${error.message}`);
      return { 
        success: false, 
        error: 'Verification service temporarily unavailable' 
      };
    }
  }

  async getThreatStatistics({ timeframe = '7d' }) {
    try {
      logger.info(`📊 Getting threat statistics (${timeframe})`);

      const stats = await elasticSearchService.getStats();

      logger.info(`✅ Statistics retrieved`);

      return {
        success: true,
        timeframe,
        statistics: {
          total: stats.total,
          byType: stats.byType,
          bySeverity: stats.bySeverity,
          byRegion: stats.byRegion,
          averageConfidence: stats.avgConfidence,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`❌ Statistics error: ${error.message}`);
      return { 
        success: false, 
        error: 'Statistics service temporarily unavailable' 
      };
    }
  }

  async analyzeThreatTrends({ focus }) {
    try {
      logger.info(`📈 Analyzing threat trends: ${focus}`);

      const prompt = `Analyze current and emerging threat trends related to: ${focus}. Include: pattern recognition, correlation analysis, risk assessment, and predictive insights based on latest intelligence data.`;
      
      const analysis = await geminiClient.analyzeWithGrounding(prompt);

      logger.info(`✅ Trend analysis completed`);

      return {
        success: true,
        focus,
        analysis: {
          summary: analysis.substring(0, 500),
          fullAnalysis: analysis,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`❌ Trend analysis error: ${error.message}`);
      return { 
        success: false, 
        error: 'Trend analysis service temporarily unavailable' 
      };
    }
  }

  clearHistory(req, res) {
    try {
      const { sessionId = 'default' } = req.body;
      this.conversationHistory.delete(sessionId);
      
      logger.info(`🗑️ Cleared conversation history for session: ${sessionId}`);
      
      res.json({ 
        success: true, 
        message: 'Conversation history cleared' 
      });
    } catch (error) {
      logger.error(`❌ Clear history error: ${error.message}`);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new AgentController();
