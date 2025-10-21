
const { getFirestore } = require('../config/firebase');
const geminiClient = require('../utils/geminiClient');
const { v4: uuidv4 } = require('uuid');

class VerificationController {
  static async verifyClaim(req, res) {
    try {
      const { claim, threatId } = req.body;
      
      if (!claim) {
        return res.status(400).json({
          success: false,
          error: 'Claim is required for verification'
        });
      }
      
      console.log(`🔍 Verifying claim with Gemini AI: ${claim.substring(0, 100)}...`);
      
      const db = getFirestore();
      
      // Use Gemini with Google Search grounding for comprehensive verification
      const verificationText = await geminiClient.verifyThreat(claim);
      
      // Parse verification results
      const verification = await VerificationController.parseGeminiVerification(
        verificationText, 
        claim
      );
      
      // Store verification in Firestore
      const verificationData = {
        id: uuidv4(),
        claim,
        threatId: threatId || null,
        ...verification,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      await db.collection('verifications').doc(verificationData.id).set(verificationData);
      
      console.log(`✅ Verification completed: ${verification.verdict} (${verification.confidence}%)`);
      
      res.json({
        success: true,
        verification: verificationData,
        message: 'Claim verification completed'
      });
      
    } catch (error) {
      console.error('🚨 Verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Verification system failure',
        message: error.message
      });
    }
  }

  static async parseGeminiVerification(verificationText, claim) {
    try {
      const supportingEvidence = VerificationController.extractEvidence(verificationText, 'supporting');
      const counterEvidence = VerificationController.extractEvidence(verificationText, 'counter');
      const confidence = VerificationController.calculateConfidenceFromGemini(verificationText);
      const verdict = VerificationController.determineVerdict(confidence, supportingEvidence, counterEvidence);
      const sources = VerificationController.extractSources(verificationText);
      
      return {
        verdict,
        confidence,
        supportingEvidence,
        counterEvidence,
        sources,
        reasoning: VerificationController.generateReasoning(verdict, confidence, supportingEvidence, counterEvidence)
      };
      
    } catch (error) {
      console.warn('⚠️ Verification parsing fallback triggered');
      return VerificationController.generateFallbackVerification(claim);
    }
  }

  static extractEvidence(text, section = 'all') {
    const evidence = [];
    const lines = text.split('\n');
    let inSection = section === 'all';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();
      
      // Detect sections
      if (section === 'supporting' && lower.includes('supporting')) {
        inSection = true;
        return;
      } else if (section === 'counter' && lower.includes('counter')) {
        inSection = true;
        return;
      } else if (lower.includes('verdict') || lower.includes('confidence')) {
        inSection = false;
        return;
      }
      
      // Extract evidence items
      if (inSection && (trimmed.match(/^[\d\-\•\*]/) || lower.includes('evidence') || lower.includes('shows'))) {
        const cleaned = trimmed.replace(/^[\d\-\•\*\.\s]+/, '').trim();
        if (cleaned.length > 15) {
          evidence.push(cleaned);
        }
      }
    });
    
    return evidence.slice(0, 5);
  }

  static calculateConfidenceFromGemini(text) {
    // Try to extract explicit confidence score
    const confidenceMatch = text.match(/confidence[:\s]+(\d+)/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }
    
    // Fallback to keyword-based calculation
    const supportingKeywords = ['confirmed', 'verified', 'documented', 'established', 'proven'];
    const uncertaintyKeywords = ['alleged', 'unconfirmed', 'disputed', 'questionable', 'unclear'];
    
    let score = 50;
    
    supportingKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) score += 8;
    });
    
    uncertaintyKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) score -= 10;
    });
    
    const credibleSources = (text.match(/\.(gov|edu|org|int)\b/g) || []).length;
    score += credibleSources * 3;
    
    return Math.max(10, Math.min(95, Math.round(score)));
  }

  static calculateConfidence(supportingText, counterText) {
    const supportingKeywords = ['confirmed', 'verified', 'documented', 'established', 'proven'];
    const uncertaintyKeywords = ['alleged', 'unconfirmed', 'disputed', 'questionable', 'unclear'];
    
    let score = 50; // Base confidence
    
    // Check supporting text
    supportingKeywords.forEach(keyword => {
      if (supportingText.toLowerCase().includes(keyword)) score += 8;
    });
    
    // Check for uncertainty indicators
    uncertaintyKeywords.forEach(keyword => {
      if (supportingText.toLowerCase().includes(keyword)) score -= 10;
    });
    
    // Counter-evidence impact
    const counterStrength = counterText.length / supportingText.length;
    score -= Math.min(counterStrength * 20, 30);
    
    // Source quality boost
    const credibleSources = (supportingText.match(/\.(gov|edu|org)\b/g) || []).length;
    score += credibleSources * 3;
    
    return Math.max(10, Math.min(95, Math.round(score)));
  }

  static determineVerdict(confidence, supportingEvidence, counterEvidence) {
    const supportCount = supportingEvidence.length;
    const counterCount = counterEvidence.length;
    
    if (confidence >= 80 && supportCount > counterCount) return 'Highly Credible';
    if (confidence >= 65 && supportCount >= counterCount) return 'Likely True';
    if (confidence >= 50) return 'Partially Verified';
    if (confidence >= 35) return 'Questionable';
    return 'Insufficient Evidence';
  }

  static extractSources(text) {
    const sources = new Set();
    
    // Extract URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern);
    if (urls) urls.forEach(url => sources.add(url));
    
    // Extract domain references
    const domainPattern = /\b[a-zA-Z0-9-]+\.(com|org|gov|edu|int|net)\b/g;
    const domains = text.match(domainPattern);
    if (domains) domains.forEach(domain => sources.add(domain));
    
    // Extract publication names
    const pubPattern = /\b(Reuters|BBC|CNN|AP News|Washington Post|New York Times|Guardian|Financial Times)\b/gi;
    const pubs = text.match(pubPattern);
    if (pubs) pubs.forEach(pub => sources.add(pub));
    
    return Array.from(sources).slice(0, 10);
  }

  static generateReasoning(verdict, confidence, supportingEvidence, counterEvidence) {
    const supportCount = supportingEvidence.length;
    const counterCount = counterEvidence.length;
    
    let reasoning = `Verdict: ${verdict} with ${confidence}% confidence. `;
    
    if (supportCount > counterCount) {
      reasoning += `Analysis found ${supportCount} supporting evidence points against ${counterCount} counter-arguments. `;
    } else if (counterCount > supportCount) {
      reasoning += `Significant counter-evidence identified (${counterCount} points vs ${supportCount} supporting). `;
    } else {
      reasoning += `Balanced evidence with ${supportCount} supporting and ${counterCount} opposing points. `;
    }
    
    if (confidence > 75) {
      reasoning += "High confidence due to credible source verification and consistent evidence patterns.";
    } else if (confidence > 50) {
      reasoning += "Moderate confidence with some uncertainty factors present.";
    } else {
      reasoning += "Low confidence due to limited or conflicting evidence.";
    }
    
    return reasoning;
  }

  static generateFallbackVerification(claim) {
    return {
      verdict: 'Requires Investigation',
      confidence: 50,
      supportingEvidence: ['Initial indicators present'],
      counterEvidence: ['Limited independent verification'],
      sources: ['verification-system.gov'],
      reasoning: 'Automated verification system encountered limitations. Manual review recommended.'
    };
  }

  static async getVerification(req, res) {
    try {
      const { id } = req.params;
      const db = getFirestore();
      
      const doc = await db.collection('verifications').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found'
        });
      }
      
      res.json({
        success: true,
        verification: { id: doc.id, ...doc.data() }
      });
      
    } catch (error) {
      console.error('🚨 Verification fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch verification'
      });
    }
  }

  static async getVerificationsByThreat(req, res) {
    try {
      const { threatId } = req.params;
      const db = getFirestore();
      
      const snapshot = await db.collection('verifications')
        .where('threatId', '==', threatId)
        .orderBy('timestamp', 'desc')
        .get();
      
      const verifications = [];
      snapshot.forEach(doc => {
        verifications.push({ id: doc.id, ...doc.data() });
      });
      
      res.json({
        success: true,
        verifications,
        count: verifications.length
      });
      
    } catch (error) {
      console.error('🚨 Threat verifications fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch threat verifications'
      });
    }
  }
}

module.exports = VerificationController;
