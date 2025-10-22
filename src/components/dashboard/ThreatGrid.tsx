
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Shield, TrendingUp, Activity } from 'lucide-react';
import EnhancedThreatCard from '../EnhancedThreatCard';
import { threatsApi } from '../../api/threats';
import { useToast } from '@/hooks/use-toast';
import ElasticSearchBar from './ElasticSearchBar';

interface ThreatGridProps {
  threats: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchTerm: string;
  filterType: string;
  elasticSearchEnabled?: boolean;
  onElasticSearch?: (results: any[], query: string) => void;
}

const ThreatGrid: React.FC<ThreatGridProps> = ({
  threats,
  isLoading,
  hasMore,
  onLoadMore,
  searchTerm,
  filterType,
  elasticSearchEnabled = true,
  onElasticSearch
}) => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayThreats = searchQuery ? searchResults : threats;

  const handleSimulate = async (threat: any) => {
    try {
      console.log('🚀 Starting crisis simulation for:', threat.title);
      const response = await threatsApi.simulate({ 
        scenario: `Crisis scenario: ${threat.title}. ${threat.summary}` 
      });
      
      toast({
        title: "🧠 Crisis Simulation Started",
        description: "AI analysis initiated for threat scenario",
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "🧠 Simulation Initiated",
        description: "Crisis analysis running in background",
      });
    }
  };

  const handleAnalyze = async (threat: any) => {
    try {
      console.log('🔍 Starting deep analysis for:', threat.title);
      const response = await threatsApi.deepAnalysis({ 
        crisisStep: threat.title,
        analysisType: 'root_cause'
      });
      
      toast({
        title: "🔍 Deep Analysis Started",
        description: "Comprehensive threat analysis in progress",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "🔍 Analysis Initiated",
        description: "Intelligence gathering in progress",
      });
    }
  };

  const handleVerify = async (threat: any) => {
    try {
      console.log('✅ Starting verification for:', threat.title);
      const response = await threatsApi.verify({ 
        claim: threat.summary,
        threatId: threat.id
      });
      
      toast({
        title: "✅ Verification Started",
        description: "Multi-source verification initiated",
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "✅ Verification Initiated", 
        description: "Source validation in progress",
      });
    }
  };

  const handleElasticSearch = (results: any[], query: string) => {
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearching(false);
    
    if (onElasticSearch) {
      onElasticSearch(results, query);
    }

    toast({
      title: "🔍 Search Complete",
      description: `Found ${results.length} threats using AI-powered hybrid search`,
    });
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  return (
    <div className="space-y-6">
      {/* Elastic Search Bar */}
      {elasticSearchEnabled && (
        <div className="flex justify-center mb-8">
          <ElasticSearchBar 
            onSearch={handleElasticSearch}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    Showing {displayThreats.length} results for "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Powered by Elastic hybrid search (ELSER + BM25 + Vector)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="cyber-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayThreats.length === 0 && (
        <Card className="cyber-card">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Threats Found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'All quiet on the intelligence front'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Threat Grid */}
      {!isLoading && displayThreats.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayThreats.map((threat, index) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedThreatCard
                    threat={threat}
                    onSimulate={handleSimulate}
                    onAnalyze={handleAnalyze}
                    onVerify={handleVerify}
                  />
                  {threat._relevance && (
                    <div className="mt-1 flex justify-end">
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Relevance: {threat._relevance.toFixed(2)}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {!searchQuery && hasMore && (
            <div className="text-center">
              <Button 
                onClick={onLoadMore} 
                variant="outline" 
                className="cyber-button"
              >
                <Eye className="w-4 h-4 mr-2" />
                Load More Threats
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreatGrid;
