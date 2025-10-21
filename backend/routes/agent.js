const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

/**
 * @route   POST /api/agent/chat
 * @desc    Chat with AI agent (supports streaming and function calling)
 * @access  Public
 */
router.post('/chat', (req, res) => agentController.chat(req, res));

/**
 * @route   POST /api/agent/clear-history
 * @desc    Clear conversation history for a session
 * @access  Public
 */
router.post('/clear-history', (req, res) => agentController.clearHistory(req, res));

/**
 * @route   GET /api/agent/health
 * @desc    Health check for agent service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'AI Agent', 
    status: 'operational',
    capabilities: [
      'search_threats',
      'simulate_crisis', 
      'verify_threat',
      'get_threat_statistics',
      'analyze_threat_trends'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
