import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, Globe, 
  AlertTriangle, Shield, Zap, Brain, Network,
  Clock, MapPin, Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

interface LiveAnalyticsDashboardProps {
  threats: any[];
}

export const LiveAnalyticsDashboard: React.FC<LiveAnalyticsDashboardProps> = ({ threats }) => {
  const [stats, setStats] = useState({
    totalThreats: 0,
    criticalThreats: 0,
    avgSeverity: 0,
    chaosIndex: 0,
    topRegion: '',
    emergingThreats: 0,
    verificationRate: 0,
    trend: 'up' as 'up' | 'down' | 'stable'
  });

  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);
  const [severityRadar, setSeverityRadar] = useState<any[]>([]);

  useEffect(() => {
    if (!threats || threats.length === 0) return;

    // Calculate statistics
    const critical = threats.filter(t => t.severity >= 80).length;
    const avgSev = threats.reduce((sum, t) => sum + t.severity, 0) / threats.length;
    const chaos = Math.min(100, avgSev + (critical * 3));
    
    // Get top region
    const regionCounts = threats.reduce((acc, t) => {
      const region = t.regions?.[0] || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topRegion = Object.entries(regionCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'Global';

    // Recent threats (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const emerging = threats.filter(t => {
      const detectedAt = new Date(t.detectedAt);
      return detectedAt > oneDayAgo;
    }).length;

    // Verification rate
    const verified = threats.filter(t => t.verifiedBy && t.verifiedBy.length > 0).length;
    const verificationRate = threats.length > 0 ? (verified / threats.length) * 100 : 0;

    setStats({
      totalThreats: threats.length,
      criticalThreats: critical,
      avgSeverity: Math.round(avgSev),
      chaosIndex: Math.round(chaos),
      topRegion,
      emergingThreats: emerging,
      verificationRate: Math.round(verificationRate),
      trend: chaos > 60 ? 'up' : chaos < 40 ? 'down' : 'stable'
    });

    // Generate timeline data (last 7 days)
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayThreats = threats.filter(t => {
        const tDate = new Date(t.detectedAt);
        return tDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        threats: dayThreats.length,
        critical: dayThreats.filter(t => t.severity >= 80).length,
        avgSeverity: dayThreats.length > 0 
          ? Math.round(dayThreats.reduce((sum, t) => sum + t.severity, 0) / dayThreats.length)
          : 0
      };
    });
    setTimelineData(timeline);

    // Region distribution (top 5)
    const regionDist = Object.entries(regionCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 5)
      .map(([region, count]) => ({
        region,
        count,
        avgSeverity: Math.round(
          threats.filter(t => t.regions?.[0] === region)
            .reduce((sum, t) => sum + (t.severity || 0), 0) / Number(count)
        )
      }));
    setRegionData(regionDist);

    // Type distribution
    const typeCounts = threats.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const typeDist = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    setTypeDistribution(typeDist);

    // Severity radar by type
    const radarData = Object.keys(typeCounts).map(type => {
      const typeThreats = threats.filter(t => t.type === type);
      return {
        type,
        severity: Math.round(typeThreats.reduce((sum, t) => sum + t.severity, 0) / typeThreats.length),
        count: typeThreats.length,
        critical: typeThreats.filter(t => t.severity >= 80).length
      };
    });
    setSeverityRadar(radarData);

  }, [threats]);

  const StatCard = ({ icon: Icon, label, value, subtext, trend, color }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card className={`border-${color}/30 bg-gradient-to-br from-background to-${color}/5`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              {subtext && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                  {trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                  {subtext}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}/10`}>
              <Icon className={`h-6 w-6 text-${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Live Intelligence Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time threat analysis powered by Elastic + Gemini AI
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Total Threats"
          value={stats.totalThreats}
          subtext={`${stats.emergingThreats} emerged in 24h`}
          trend={stats.trend}
          color="primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Threats"
          value={stats.criticalThreats}
          subtext={`${Math.round((stats.criticalThreats / stats.totalThreats) * 100)}% of total`}
          trend="up"
          color="destructive"
        />
        <StatCard
          icon={Zap}
          label="Chaos Index"
          value={`${stats.chaosIndex}%`}
          subtext={stats.trend === 'up' ? 'Escalating' : stats.trend === 'down' ? 'Declining' : 'Stable'}
          trend={stats.trend}
          color={stats.chaosIndex > 60 ? 'destructive' : stats.chaosIndex > 40 ? 'warning' : 'success'}
        />
        <StatCard
          icon={MapPin}
          label="Top Region"
          value={stats.topRegion}
          subtext={`${stats.verificationRate}% verified`}
          color="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              7-Day Threat Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Area type="monotone" dataKey="threats" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorThreats)" />
                <Area type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCritical)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Top Regions by Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="region" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Threat Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Severity Analysis by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={severityRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Radar name="Severity" dataKey="severity" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Radar name="Count" dataKey="count" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/20">
            <TrendingUp className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-sm">Escalating Threat Activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.emergingThreats} new threats detected in the last 24 hours, 
                representing a {Math.round((stats.emergingThreats / stats.totalThreats) * 100)}% increase. 
                Primary focus: {stats.topRegion}.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/20">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Verification Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.verificationRate}% of threats have been verified through multiple sources. 
                Community validation improving threat credibility assessment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-primary/20">
            <Zap className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-sm">Chaos Index Analysis</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current chaos index at {stats.chaosIndex}% - 
                {stats.chaosIndex > 60 ? ' High alert status. Multiple critical threats active.' : 
                 stats.chaosIndex > 40 ? ' Moderate threat level. Monitor for escalation.' : 
                 ' Low threat environment. Maintain surveillance.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
