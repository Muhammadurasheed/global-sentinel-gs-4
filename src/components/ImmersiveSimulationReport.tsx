import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Share2, AlertTriangle, Activity,
  Users, Clock, MapPin, Shield, Target, Zap, Network,
  TrendingUp, Brain, Globe, Radio, Database, Cpu
} from 'lucide-react';

interface ImmersiveSimulationReportProps {
  result: any;
  threat: any;
  onBack?: () => void;
}

export const ImmersiveSimulationReport: React.FC<ImmersiveSimulationReportProps> = ({
  result,
  threat,
  onBack
}) => {
  const [activePhase, setActivePhase] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [pulseValue, setPulseValue] = useState(0);

  // Simulate live data streaming effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseValue(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance phases
  useEffect(() => {
    if (!isLive) return;
    const phaseInterval = setInterval(() => {
      setActivePhase(prev => (prev + 1) % (result.flowchart?.length || 6));
    }, 4000);
    return () => clearInterval(phaseInterval);
  }, [isLive, result.flowchart]);

  const phases = result.flowchart || [
    "Initial detection and threat assessment",
    "Stakeholder notification and emergency protocols",
    "Resource mobilization and coordination",
    "Public communication strategy deployment",
    "Escalation management and containment",
    "Recovery and post-crisis analysis"
  ];

  const mitigations = result.mitigations || [];
  const confidence = result.confidence || 75;
  const probability = result.probability || 76;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Header with Live Status */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Simulation
              </Button>
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
                <span className="text-sm font-mono text-red-400 uppercase tracking-wider">
                  Live Simulation Active
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="gap-2 border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10"
              >
                <Radio className="h-4 w-4" />
                {isLive ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="space-y-8">
          {/* Threat Overview Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-purple-950/40 p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="mb-3 bg-red-500/20 text-red-400 border-red-500/30">
                    {threat.severity || 'HIGH'} SEVERITY
                  </Badge>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {threat.title}
                  </h1>
                  <p className="text-cyan-400 text-lg">Monte Carlo Crisis Simulation</p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {probability}%
                  </div>
                  <div className="text-sm text-cyan-400/70 uppercase tracking-wider">Probability</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Scenarios Analyzed', value: result.scenariosRun?.toLocaleString() || '1,000', icon: Database, color: 'cyan' },
              { label: 'Confidence Level', value: `${confidence}%`, icon: Brain, color: 'purple' },
              { label: 'Critical Week', value: `Week ${result.criticalWeek || 4}`, icon: Clock, color: 'red' },
              { label: 'Active Agents', value: '12', icon: Cpu, color: 'green' }
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="relative overflow-hidden border-cyan-500/20 bg-slate-900/50 backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className={`h-8 w-8 text-${metric.color}-400`} />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={`w-2 h-2 rounded-full bg-${metric.color}-400`}
                      />
                    </div>
                    <div className={`text-3xl font-bold text-${metric.color}-400 mb-1`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Crisis Flowchart Visualization */}
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-cyan-400">
                <Activity className="h-6 w-6" />
                Crisis Evolution Timeline
                <div className="ml-auto flex items-center gap-2">
                  <Progress value={(activePhase / phases.length) * 100} className="w-32 h-2" />
                  <span className="text-sm font-mono">Phase {activePhase + 1}/{phases.length}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, idx) => {
                  const isActive = idx === activePhase;
                  const isPast = idx < activePhase;
                  const isFuture = idx > activePhase;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ 
                        opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
                        x: 0,
                        scale: isActive ? 1.02 : 1
                      }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative p-6 rounded-xl border transition-all duration-500 ${
                        isActive 
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' 
                          : isPast
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-slate-700 bg-slate-900/30'
                      }`}
                    >
                      {/* Phase Number Badge */}
                      <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isActive 
                          ? 'bg-cyan-500 text-slate-900' 
                          : isPast
                          ? 'bg-green-500 text-slate-900'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Phase Content */}
                      <div className="ml-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              isActive ? 'text-cyan-400' : isPast ? 'text-green-400' : 'text-slate-400'
                            }`}>
                              {phase}
                            </h3>
                            
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-cyan-500/20"
                              >
                                <div className="flex items-center gap-2 text-sm text-cyan-400/70">
                                  <motion.div
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Activity className="h-4 w-4" />
                                  </motion.div>
                                  <span>Analyzing phase dynamics...</span>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Status Indicator */}
                          {isPast && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Complete
                            </Badge>
                          )}
                          {isActive && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                Active
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Connection Line */}
                      {idx < phases.length - 1 && (
                        <div className={`absolute left-3 top-full w-0.5 h-4 ${
                          isPast ? 'bg-green-500' : 'bg-slate-700'
                        }`} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mitigation Strategies with Effectiveness Bars */}
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-cyan-400">
                <Shield className="h-6 w-6" />
                Intervention Effectiveness Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mitigations.map((mitigation: string, idx: number) => {
                  const effectiveness = Math.floor(Math.random() * 30) + 60;
                  const cost = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                              <Target className="h-5 w-5 text-cyan-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white">{mitigation}</h4>
                          </div>
                        </div>
                        <Badge className={`${
                          cost === 'Low' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          cost === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {cost} Cost
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Effectiveness</span>
                          <span className="text-cyan-400 font-mono font-bold">{effectiveness}%</span>
                        </div>
                        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${effectiveness}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          />
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Most Likely Outcome */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 via-orange-950/20 to-red-950/20 p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                    Most Likely Outcome
                  </h3>
                  <p className="text-lg text-foreground leading-relaxed">
                    {result.mostLikelyOutcome || result.verdict || 'Regional health crisis within 8 weeks'}
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        Impact: {result.impact || 'Regional'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        Timeline: {result.timeline || '24-48 hours'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};