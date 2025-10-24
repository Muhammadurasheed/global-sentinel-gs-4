import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Sparkles, Shield, AlertTriangle, 
  Activity, TrendingUp, Search, Zap, Network,
  ChevronRight, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: Array<{
    tool: string;
    parameters: any;
    result: any;
  }>;
  timestamp: Date;
}

interface AICommandCenterProps {
  selectedThreat?: any;
  onClose?: () => void;
}

const QUICK_ACTIONS = [
  { icon: Shield, label: 'Verify Threat', prompt: 'Verify this threat using multiple sources' },
  { icon: Activity, label: 'Deep Analysis', prompt: 'Perform deep root cause analysis' },
  { icon: TrendingUp, label: 'Predict Impact', prompt: 'Predict the potential impact and timeline' },
  { icon: Network, label: 'Find Correlations', prompt: 'Find related threats and patterns' },
  { icon: Search, label: 'Search Similar', prompt: 'Search for similar historical threats' },
  { icon: Zap, label: 'Simulate Crisis', prompt: 'Run a crisis simulation scenario' },
];

export const AICommandCenter: React.FC<AICommandCenterProps> = ({ selectedThreat, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `🧠 **AI Agent Online** - I'm your threat intelligence analyst. I can verify threats, analyze patterns, predict impacts, and search across global intelligence networks using Elastic Search and Gemini AI.${selectedThreat ? `\n\n📍 **Active Threat**: ${selectedThreat.title}` : ''}`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendMessage, isLoading } = useAIAgent();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const contextMessage = selectedThreat 
        ? `Context: Analyzing threat "${selectedThreat.title}" (Type: ${selectedThreat.type}, Severity: ${selectedThreat.severity}). User query: ${message}`
        : message;

      const response = await sendMessage(contextMessage);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        toolCalls: response.toolCalls,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show toast for tool executions
      if (response.toolCalls && response.toolCalls.length > 0) {
        toast({
          title: '🔧 AI Tools Activated',
          description: `Executed ${response.toolCalls.length} intelligence operations`,
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Communication Error',
        description: error.message || 'Failed to reach AI agent',
        variant: 'destructive'
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    if (!selectedThreat) {
      toast({
        title: '⚠️ No Threat Selected',
        description: 'Please select a threat card first',
        variant: 'destructive'
      });
      return;
    }
    handleSend(prompt);
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
      <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <div>
              <CardTitle className="text-xl">AI Command Center</CardTitle>
              <p className="text-xs text-muted-foreground">Powered by Gemini + Elastic ELSER</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={!selectedThreat || isLoading}
              className="text-xs hover:bg-primary/10 hover:border-primary/50"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : msg.role === 'system'
                      ? 'bg-muted border border-primary/20'
                      : 'bg-secondary'
                  } rounded-lg p-3 space-y-2`}>
                    {msg.role !== 'user' && (
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Agent</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    
                    {/* Tool Calls */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-primary/20">
                        <div className="text-xs font-semibold flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Tools Executed:
                        </div>
                        {msg.toolCalls.map((tool, i) => (
                          <div key={i} className="text-xs bg-background/50 rounded p-2 space-y-1">
                            <div className="flex items-center gap-1 font-medium">
                              <ChevronRight className="h-3 w-3" />
                              {tool.tool}
                            </div>
                            {tool.result && (
                              <div className="text-xs opacity-70 ml-4">
                                {typeof tool.result === 'string' 
                                  ? tool.result.substring(0, 100) + '...'
                                  : JSON.stringify(tool.result).substring(0, 100) + '...'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-50 text-right">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                AI analyzing...
              </motion.div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-primary/20 bg-background/50">
          {selectedThreat && (
            <div className="mb-3 p-2 bg-primary/10 rounded-md text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-primary" />
                <span className="font-medium">Active Context:</span>
                <span className="truncate">{selectedThreat.title}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder={selectedThreat ? "Ask about this threat..." : "Ask AI to analyze threats, search patterns, or verify claims..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
