import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Trash2,
  Sparkles,
  Search,
  Brain,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAIAgent } from '@/hooks/useAIAgent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{
    tool: string;
    parameters: any;
    result: any;
  }>;
  timestamp: string;
}

const toolIcons: Record<string, any> = {
  search_threats: Search,
  simulate_crisis: Brain,
  verify_threat: ShieldCheck,
  get_threat_statistics: BarChart3,
  analyze_threat_trends: TrendingUp
};

const toolColors: Record<string, string> = {
  search_threats: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  simulate_crisis: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  verify_threat: 'text-green-400 border-green-500/30 bg-green-500/10',
  get_threat_statistics: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  analyze_threat_trends: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
};

export const AIAgentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendMessage, clearHistory, isLoading } = useAIAgent();

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 Hello! I'm your AI intelligence agent powered by Google Cloud Vertex AI and Elastic Search. I can help you:\n\n🔍 Search global threats\n🎮 Simulate crisis scenarios\n✅ Verify threat credibility\n📊 Analyze threat statistics\n📈 Identify emerging trends\n\nWhat would you like to know?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage(input);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast({
        title: "⚠️ Communication Error",
        description: "Failed to connect to AI agent. Please try again.",
        variant: "destructive"
      });

      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try your request again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setMessages([{
        role: 'assistant',
        content: "Conversation history cleared. How can I assist you with threat intelligence?",
        timestamp: new Date().toISOString()
      }]);
      
      toast({
        title: "🗑️ History Cleared",
        description: "Conversation has been reset"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="cyber-card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
              AI Intelligence Agent
              <Sparkles className="w-4 h-4" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Powered by Google Cloud Vertex AI
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-muted-foreground hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                        : 'bg-slate-800/50 border border-border/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>

                    {/* Tool Calls */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.toolCalls.map((call, idx) => {
                          const Icon = toolIcons[call.tool] || Sparkles;
                          const colorClass = toolColors[call.tool] || 'text-gray-400';
                          
                          return (
                            <div key={idx} className={`text-xs border rounded p-2 ${colorClass}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-3 h-3" />
                                <span className="font-mono font-semibold">
                                  {call.tool.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </div>
                              {call.result?.count !== undefined && (
                                <div className="text-xs opacity-80">
                                  Found {call.result.count} results
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-800/50 border border-border/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about threats, simulations, or intelligence..."
            className="cyber-input flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="cyber-button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </span>
          <span>Try: "Show me cyber threats in Asia" or "Simulate power grid attack"</span>
        </div>
      </div>
    </Card>
  );
};
