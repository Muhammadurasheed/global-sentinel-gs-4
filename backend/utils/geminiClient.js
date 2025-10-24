const { VertexAI } = require('@google-cloud/vertexai');

class GeminiClient {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!this.projectId) {
      throw new Error('❌ GOOGLE_CLOUD_PROJECT is required! Set up credentials in backend/.env');
    }

    // Use Firebase service account credentials for Vertex AI authentication
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error('❌ FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL are required for Gemini authentication!');
    }

    try {
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location,
        googleAuthOptions: {
          credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, '\n') // Handle escaped newlines
          }
        }
      });
      console.log(`✅ Gemini client initialized with project: ${this.projectId}`);
    } catch (error) {
      console.error('❌ Failed to initialize Vertex AI:', error.message);
      throw error;
    }
  }

  async generateContent(prompt, options = {}) {
    try {
      const {
        model = 'gemini-2.0-flash-exp',
        temperature = 0.3,
        maxOutputTokens = 8192,
        useGrounding = true,
        systemInstruction = 'You are a global threat intelligence analyst. Provide precise, factual analysis with credible sources.'
      } = options;

      const generativeModel = this.vertexAI.getGenerativeModel({
        model: model,
        generationConfig: {
          temperature,
          maxOutputTokens
        },
        systemInstruction,
        tools: useGrounding ? [{
          googleSearchRetrieval: {
            disableAttribution: false
          }
        }] : []
      });

      const result = await generativeModel.generateContent(prompt);
      const response = result.response;
      
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('🚨 Gemini API Error:', error.message);
      throw new Error(`Gemini API failed: ${error.message}. Check your Google Cloud credentials.`);
    }
  }

  async analyzeWithGrounding(query, systemPrompt = null) {
    const instruction = systemPrompt || 'You are a global threat intelligence analyst conducting deep research. Provide comprehensive analysis with credible sources and citations from recent data.';
    
    return await this.generateContent(query, {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.2,
      maxOutputTokens: 8192,
      useGrounding: true,
      systemInstruction: instruction
    });
  }

  async reasoningAnalysis(hypothesis, useCounter = false) {
    const systemPrompt = useCounter 
      ? 'You are a critical analyst. Challenge the given hypothesis with counter-evidence and alternative explanations. Provide logical counter-arguments and contradictory evidence.'
      : 'You are a crisis reasoning specialist. Analyze the hypothesis and provide logical reasoning chains, causal relationships, and evidence-based implications.';

    const userPrompt = `${hypothesis}

Please provide:
1. REASONING CHAIN: Step-by-step logical progression
2. EVIDENCE ASSESSMENT: Supporting or contradicting evidence
3. CONFIDENCE LEVEL: Percentage confidence in the analysis
4. KEY FACTORS: Primary drivers and variables
5. IMPLICATIONS: Potential consequences and outcomes`;

    return await this.generateContent(userPrompt, {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.4,
      maxOutputTokens: 8192,
      useGrounding: false,
      systemInstruction: systemPrompt
    });
  }

  async deepSearch(query, domains = []) {
    const searchPrompt = `${query}

Focus search on recent developments and credible sources. Include:
1. CURRENT SIGNALS: Recent events and indicators
2. HISTORICAL PRECEDENTS: Similar past occurrences
3. EXPERT ANALYSIS: Professional assessments and opinions
4. DATA TRENDS: Statistical patterns and projections
5. SOURCE CITATIONS: Credible references and links

${domains.length > 0 ? `Prioritize sources from: ${domains.join(', ')}` : ''}
Include clickable source citations and references.`;

    return await this.analyzeWithGrounding(searchPrompt, 
      'You are an intelligence researcher conducting deep search analysis. Provide comprehensive research with credible sources and citations.'
    );
  }

  async hybridAnalysis(scenario) {
    try {
      console.log('🧠 Starting hybrid Gemini analysis for:', scenario.substring(0, 50) + '...');
      
      // Run both reasoning and deep search in parallel
      const [reasoningResult, searchResult] = await Promise.all([
        this.reasoningAnalysis(scenario),
        this.deepSearch(`Crisis signals and evidence for: ${scenario}`, [])
      ]);

      return {
        reasoning: reasoningResult,
        research: searchResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🚨 Hybrid Analysis Error:', error);
      throw error;
    }
  }

  async simulationAnalysis(scenario) {
    const prompt = `Conduct a comprehensive crisis simulation analysis for the following scenario:

SCENARIO: ${scenario}

Provide a structured analysis covering:

1. CAUSAL CHAIN (8 sequential steps):
   - How this crisis would unfold step by step
   - Key turning points and escalation triggers

2. MITIGATION STRATEGIES (6 concrete actions):
   - Immediate response measures
   - Short-term containment actions
   - Medium-term stabilization plans
   - Long-term prevention strategies

3. SUPPORTING EVIDENCE (5 points):
   - Historical precedents
   - Current risk indicators
   - Expert assessments

4. COUNTER-ARGUMENTS (5 points):
   - Reasons scenario might not materialize
   - Safeguards in place
   - Alternative outcomes

5. CONFIDENCE ASSESSMENT:
   - Overall confidence percentage (0-100)
   - Key uncertainty factors

6. TIMELINE ESTIMATE:
   - Expected development timeframe

7. IMPACT ASSESSMENT:
   - Geographic scope
   - Population affected
   - Economic implications

Include specific sources, data points, and expert opinions.`;

    return await this.analyzeWithGrounding(prompt,
      'You are a crisis simulation expert. Provide detailed, evidence-based scenario analysis with specific sources and data.'
    );
  }

  async verifyThreat(claim) {
    const prompt = `Verify the following threat claim with supporting and counter evidence:

CLAIM: ${claim}

Provide:
1. SUPPORTING EVIDENCE: Facts, data, and sources that support this claim
2. COUNTER EVIDENCE: Facts, data, and sources that challenge this claim
3. SOURCE CITATIONS: Specific URLs and references (prioritize .gov, .edu, .org, .int)
4. CREDIBILITY ASSESSMENT: Analysis of source reliability
5. CONFIDENCE SCORE: Overall confidence in claim validity (0-100)
6. VERDICT: Clear statement on claim credibility

Be thorough and cite specific, verifiable sources.`;

    return await this.analyzeWithGrounding(prompt,
      'You are a fact-checking specialist. Verify claims with rigorous evidence analysis and credible source citations.'
    );
  }

  // AI Agent Tool Calling Methods
  async chatWithTools(systemPrompt, userMessage, tools, conversationHistory = []) {
    try {
      const model = 'gemini-2.0-flash-exp';
      
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: model,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        },
        systemInstruction: systemPrompt,
        tools: [{
          functionDeclarations: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }))
        }]
      });

      // Build conversation history
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = generativeModel.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const response = result.response;

      // Check for function calls
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        return {
          text: response.text() || '',
          toolCalls: functionCalls.map(fc => ({
            name: fc.name,
            parameters: fc.args
          }))
        };
      }

      return {
        text: response.text(),
        toolCalls: []
      };
    } catch (error) {
      console.error('🚨 Gemini chatWithTools error:', error.message);
      throw new Error(`Gemini AI chat failed: ${error.message}`);
    }
  }

  async chatWithToolResults(systemPrompt, userMessage, tools, conversationHistory, toolCalls, toolResults) {
    try {
      const model = 'gemini-2.0-flash-exp';
      
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: model,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        },
        systemInstruction: systemPrompt,
        tools: [{
          functionDeclarations: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }))
        }]
      });

      // Build history with tool results
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = generativeModel.startChat({ history });
      
      // Send tool results
      const functionResponses = toolCalls.map((call, idx) => ({
        name: call.name,
        response: toolResults[idx]
      }));

      const result = await chat.sendMessage([{
        functionResponses
      }]);

      return {
        text: result.response.text()
      };
    } catch (error) {
      console.error('🚨 Gemini chatWithToolResults error:', error.message);
      throw new Error(`Gemini AI tool result processing failed: ${error.message}`);
    }
  }

  async streamChatWithTools(systemPrompt, userMessage, tools, conversationHistory, streamCallback) {
    // For now, use non-streaming version and call callback
    try {
      const response = await this.chatWithTools(systemPrompt, userMessage, tools, conversationHistory);
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        await streamCallback(null, response.toolCalls);
      }
      
      // Stream text in chunks
      const words = response.text.split(' ');
      for (let i = 0; i < words.length; i += 5) {
        const chunk = words.slice(i, i + 5).join(' ') + ' ';
        await streamCallback(chunk, null);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('🚨 Gemini streaming error:', error.message);
      throw error;
    }
  }

}

module.exports = new GeminiClient();
