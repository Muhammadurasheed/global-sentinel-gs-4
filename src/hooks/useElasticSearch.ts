import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface SearchOptions {
  searchType?: 'hybrid' | 'semantic' | 'keyword';
  limit?: number;
  threatType?: string;
  minSeverity?: number;
  regions?: string[];
}

interface SearchResult {
  success: boolean;
  threats: any[];
  total: number;
  took?: number;
  searchType?: string;
  fallback?: boolean;
}

export function useElasticSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);

  const search = async (query: string, options: SearchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/elastic/search`, {
        query,
        searchType: options.searchType || 'hybrid',
        limit: options.limit || 50,
        options: {
          threatType: options.threatType,
          minSeverity: options.minSeverity,
          regions: options.regions
        }
      });

      setResults(response.data);
      return response.data;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Search failed';
      setError(errorMessage);
      console.error('Elastic search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/elastic/stats`);
      return response.data;
    } catch (err: any) {
      console.error('Failed to get stats:', err);
      return null;
    }
  };

  const healthCheck = async () => {
    try {
      const response = await axios.get(`${API_BASE}/elastic/health`);
      return response.data;
    } catch (err: any) {
      console.error('Health check failed:', err);
      return { healthy: false, error: err.message };
    }
  };

  return {
    search,
    getStats,
    healthCheck,
    loading,
    error,
    results
  };
}
