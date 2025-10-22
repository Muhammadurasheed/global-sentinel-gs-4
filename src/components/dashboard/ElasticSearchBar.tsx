import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useElasticSearch } from '@/hooks/useElasticSearch';
import { motion, AnimatePresence } from 'framer-motion';

interface ElasticSearchBarProps {
  onSearch: (results: any[], query: string) => void;
  onFilterChange?: (filters: any) => void;
}

const ElasticSearchBar: React.FC<ElasticSearchBarProps> = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    threatType: '',
    minSeverity: 0,
    regions: [] as string[]
  });
  
  const { search, loading } = useElasticSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // In production, call suggestions API
      // const result = await elasticService.getSuggestions(query);
      // setSuggestions(result.suggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const results = await search(searchQuery, {
      searchType: 'hybrid',
      limit: 50,
      ...filters
    });

    if (results) {
      onSearch(results.threats, searchQuery);
    }
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      threatType: '',
      minSeverity: 0,
      regions: []
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = filters.threatType || filters.minSeverity > 0 || filters.regions.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search threats using AI-powered hybrid search... (e.g., 'cyber attacks on infrastructure')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-32 h-12 text-base bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            size="sm"
            variant={showFilters ? "default" : "ghost"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-8"
          >
            <Filter className="h-4 w-4 mr-1" />
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="h-8"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-1" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(suggestion.title);
                      handleSearch(suggestion.title);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-accent/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.type}</div>
                    </div>
                    <Badge variant={suggestion.severity > 70 ? "destructive" : "secondary"}>
                      {suggestion.severity}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                  </h3>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearFilters}
                      className="h-7 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Threat Type */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Threat Type</label>
                    <select
                      value={filters.threatType}
                      onChange={(e) => handleFilterChange('threatType', e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="Cyber">Cyber</option>
                      <option value="Health">Health</option>
                      <option value="Climate">Climate</option>
                      <option value="Economic">Economic</option>
                      <option value="Geopolitical">Geopolitical</option>
                    </select>
                  </div>

                  {/* Min Severity */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Min Severity: {filters.minSeverity}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={filters.minSeverity}
                      onChange={(e) => handleFilterChange('minSeverity', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Status</label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <label className="text-xs font-medium mb-2 block">Quick Filters</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleFilterChange('minSeverity', 80)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Critical Only
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleFilterChange('threatType', 'Cyber')}
                    >
                      Cyber Threats
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        handleFilterChange('minSeverity', 0);
                        handleFilterChange('threatType', '');
                      }}
                    >
                      Recent 24h
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Tips */}
      {query.length === 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          💡 Try: "ransomware attacks" • "climate disasters" • "supply chain risks"
        </div>
      )}
    </div>
  );
};

export default ElasticSearchBar;
