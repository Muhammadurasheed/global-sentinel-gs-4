import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Share2, AlertTriangle, TrendingUp,
  Users, Clock, MapPin, Shield, Target, Zap, Network,
  CheckCircle, XCircle, Info, ChevronRight, ExternalLink
} from 'lucide-react';
import { ImmersiveSimulationReport } from './ImmersiveSimulationReport';

interface FullReportPageProps {
  workflowType: 'verify' | 'analyze' | 'simulate';
  result: any;
  threat: any;
  onBack: () => void;
}

export const FullReportPage: React.FC<FullReportPageProps> = ({
  workflowType,
  result,
  threat,
  onBack
}) => {
  const renderVerificationReport = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Final Verdict:</span>
            <Badge className={`text-lg px-4 py-2 ${
              result.confidence > 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              result.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {result.confidence}% {result.verdict}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{result.supportingSources}</p>
              <p className="text-sm text-muted-foreground">Supporting Sources</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{result.contradictingSources}</p>
              <p className="text-sm text-muted-foreground">Contradicting</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-cyan-400">{result.historicalAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Historical Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-cyan-400" />
            Source Credibility Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.sources?.map((source: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                {source.stance === 'supporting' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{source.stance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">{Math.round(source.credibility)}%</p>
                  <p className="text-xs text-muted-foreground">Credibility</p>
                </div>
                <Progress value={source.credibility} className="w-20 h-2" />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Gemini Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Gemini Reasoning Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
              {result.geminiAnalysis || 'Detailed Gemini reasoning chain analysis...'}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalysisReport = () => (
    <div className="space-y-6">
      {/* Impact Overview */}
      <Card className="border-2 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            Impact Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold">{result.affectedPopulation}</p>
              <p className="text-xs text-muted-foreground">Affected Population</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-2xl font-bold">{result.affectedRegions}</p>
              <p className="text-xs text-muted-foreground">Regions</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold">{result.timelineMonths}mo</p>
              <p className="text-xs text-muted-foreground">Timeline</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{result.criticalityScore}</p>
              <p className="text-xs text-muted-foreground">Criticality</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Causal Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            Causal Chain Analysis ({result.causalSteps} steps)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
              {result.causalChain || result.fullAnalysis || 'Building detailed causal chain...'}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Recommended Mitigation Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.mitigationStrategies?.map((strategy: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{strategy.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{strategy.impact}</p>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {strategy.confidence}% confidence
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSimulationReport = () => (
    <div className="space-y-6">
      {/* Simulation Overview */}
      <Card className="border-2 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Monte Carlo Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scenarios Analyzed:</span>
              <span className="text-2xl font-bold text-primary">{result.scenariosRun?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Probability:</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {result.probability}%
              </Badge>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-2">Most Likely Outcome:</p>
              <p className="text-muted-foreground">{result.mostLikelyOutcome}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            Crisis Timeline Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-xs text-muted-foreground mb-1">Critical Threshold</p>
              <p className="text-lg font-bold text-red-400">Week {result.criticalWeek}</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <p className="text-xs text-muted-foreground mb-1">Peak Impact</p>
              <p className="text-lg font-bold text-orange-400">{result.peakImpact}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Mitigation Window</p>
              <p className="text-lg font-bold text-green-400">{result.mitigationWindow}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">Historical Precedents</p>
              <p className="text-lg font-bold text-blue-400">{result.historicalPrecedents}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intervention Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Intervention Effectiveness Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.mitigationStrategies?.map((strategy: any, idx: number) => (
            <div
              key={idx}
              className="p-4 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">{strategy.name}</p>
                <Badge variant="outline">{strategy.impact}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-semibold">{strategy.confidence}%</span>
                </div>
                <Progress value={strategy.confidence} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Use immersive report for simulations - already full-screen optimized
  if (workflowType === 'simulate') {
    return (
      <div className="min-h-screen bg-background">
        <ImmersiveSimulationReport result={result} threat={threat} />
        {/* Back button overlay for simulation */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2 bg-background/95 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Close Simulation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Close Report
              </Button>
              <div className="border-l pl-4">
                <h1 className="text-2xl font-bold">
                  {workflowType === 'verify' && '🔍 Verification Report'}
                  {workflowType === 'analyze' && '🧬 Analysis Report'}
                </h1>
                <p className="text-sm text-muted-foreground truncate max-w-md">{threat.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {workflowType === 'verify' && renderVerificationReport()}
        {workflowType === 'analyze' && renderAnalysisReport()}
      </div>
    </div>
  );
};
