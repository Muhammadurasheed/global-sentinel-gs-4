import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface WorkflowResult {
  success: boolean;
  workflow: 'verify' | 'analyze' | 'simulate';
  result: any;
  agents: any;
  error?: string;
}

export const useAgentWorkflow = () => {
  const [isLoading, setIsLoading] = useState(false);

  const executeWorkflow = async (
    type: 'verify' | 'analyze' | 'simulate',
    threat: any
  ): Promise<WorkflowResult> => {
    setIsLoading(true);
    
    try {
      console.log(`🚀 Executing ${type} workflow for:`, threat.title);
      
      const response = await axios.post<WorkflowResult>(
        `${API_BASE}/api/agent-workflow/${type}`,
        { threat },
        { timeout: 120000 } // 2 minute timeout for complex workflows
      );

      console.log(`✅ ${type} workflow complete:`, response.data);
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ ${type} workflow error:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        `Failed to execute ${type} workflow`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeWorkflow,
    isLoading
  };
};
