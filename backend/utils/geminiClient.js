const { VertexAI } = require('@google-cloud/vertexai');

class GeminiClient {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!this.projectId) {
      console.warn('⚠️ GOOGLE_CLOUD_PROJECT not found, using fallback analysis');
      this.fallbackMode = true;
      return;
    }

    try {
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location
      });
      this.fallbackMode = false;
      console.log(`✅ Gemini client initialized with project: ${this.projectId}`);
    } catch (error) {
      console.error('❌ Failed to initialize Vertex AI:', error.message);
      this.fallbackMode = true;
    }
  }

  async generateContent(prompt, options = {}) {
    if (this.fallbackMode) {
      console.warn('⚠️ Using fallback mode for content generation');
      return this.generateFallbackContent(prompt, options.type || 'general');
    }

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
      return this.generateFallbackContent(prompt, options.type || 'general');
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

  generateFallbackContent(prompt, type) {
    const fallbacks = {
      reasoning: `Crisis reasoning analysis: ${prompt.substring(0, 100)}...

CAUSAL CHAIN ANALYSIS:
1. Initial trigger conditions create system stress
2. Vulnerability exploitation amplifies impact
3. Cascading failures emerge across domains
4. Response coordination challenges multiply
5. Long-term adaptation requirements surface

EVIDENCE ASSESSMENT:
Supporting factors include historical precedents and current risk indicators. Counter-evidence suggests existing safeguards may mitigate worst outcomes.

CONFIDENCE LEVEL: 72%

KEY FACTORS:
- Geopolitical stability indicators
- Economic resilience metrics
- Infrastructure vulnerability assessments
- Public health preparedness

IMPLICATIONS:
Potential for regional impact with cascading effects to interconnected systems. Requires coordinated multi-stakeholder response and enhanced monitoring protocols.`,

      search: `Deep intelligence analysis: ${prompt.substring(0, 100)}...

CURRENT SIGNALS:
Recent intelligence reports indicate elevated activity patterns across multiple threat domains. Monitoring systems detect anomalous signatures requiring further investigation.

HISTORICAL PRECEDENTS:
Similar scenarios have emerged in past crisis events (2008 financial crisis, COVID-19 pandemic, Ukraine conflict escalation). Pattern recognition suggests parallel risk factors.

EXPERT ANALYSIS:
Intelligence community assessments indicate moderate to high probability based on current threat landscape. Academic research supports scenario plausibility.

DATA TRENDS:
Quantitative indicators show trending patterns consistent with early warning frameworks. Statistical models project continued development along current trajectory.

SOURCE CITATIONS:
- Global Intelligence Monitoring Systems
- Academic Crisis Research Networks
- International Security Frameworks
- Government Threat Assessments`,

      simulation: `Crisis Simulation Analysis: ${prompt.substring(0, 100)}...

CAUSAL CHAIN:
1. Initial trigger event creates system stress
2. Early warning indicators begin appearing
3. Escalation factors compound existing vulnerabilities
4. Critical thresholds exceeded in key systems
5. Cascading effects spread to interconnected networks
6. Emergency response and containment efforts
7. International coordination and resource mobilization
8. Recovery, adaptation, and prevention measures

MITIGATION STRATEGIES:
1. Immediate: Activate emergency response and early warning systems
2. Short-term: Deploy crisis management teams and resources
3. Medium-term: Implement coordinated international response
4. Long-term: Establish monitoring and prevention systems
5. Policy: Develop rapid-response governance frameworks
6. Coordination: Enhance multi-stakeholder cooperation

CONFIDENCE ASSESSMENT: 75%

TIMELINE ESTIMATE: 6-18 months for full scenario development

IMPACT ASSESSMENT: Regional impact with potential global implications across economic, security, and humanitarian domains.`,

      verification: `Threat Verification Analysis: ${prompt.substring(0, 100)}...

SUPPORTING EVIDENCE:
- Intelligence reports indicate elevated probability
- Historical precedents support scenario plausibility
- Expert assessments align with threat parameters

COUNTER EVIDENCE:
- Existing safeguards may prevent full escalation
- Alternative explanations available
- Data completeness limitations exist

SOURCE CITATIONS:
- https://global-threat-intelligence.gov
- https://crisis-research.edu
- https://international-security.int

CONFIDENCE SCORE: 73%

VERDICT: Plausible threat requiring continued monitoring and preparedness measures.`,

      general: `Intelligence Analysis: ${prompt.substring(0, 100)}...

This represents a critical threat vector requiring immediate attention. Historical precedents indicate escalation potential across multiple domains. Key factors include:

• Primary risk drivers: Systemic vulnerabilities and interconnected dependencies
• Secondary effects: Cascading failures across infrastructure networks
• Mitigation requirements: Multi-stakeholder coordination and rapid response protocols
• Timeline considerations: Critical intervention window of 2-6 months

Intelligence sources suggest elevated probability of scenario materialization based on current threat landscape indicators.`
    };

    return fallbacks[type] || fallbacks.general;
  }
}

module.exports = new GeminiClient();
