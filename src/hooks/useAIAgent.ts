import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface AgentResponse {
  success: boolean;
  message: string;
  toolCalls?: Array<{
    tool: string;
    parameters: any;
    result: any;
  }>;
  sessionId?: string;
  error?: string;
}

export const useAIAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const sendMessage = async (message: string): Promise<AgentResponse> => {
    setIsLoading(true);
    
    try {
      const response = await axios.post<AgentResponse>(
        `${API_BASE}/api/agent/chat`,
        {
          message,
          sessionId,
          stream: false
        },
        {
          timeout: 60000 // 60 second timeout for complex queries
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('AI Agent error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to communicate with AI agent'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE}/api/agent/clear-history`, {
        sessionId
      });
    } catch (error) {
      console.error('Clear history error:', error);
      throw error;
    }
  };

  const checkHealth = async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE}/api/agent/health`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  };

  return {
    sendMessage,
    clearHistory,
    checkHealth,
    isLoading,
    sessionId
  };
};
