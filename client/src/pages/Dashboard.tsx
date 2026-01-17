import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StateDistributionChart, AgeDistributionChart, TrendChart } from "@/components/charts/Charts";
import { useAnalyticsStats, useAnalyticsCharts, useAnalyticsInsights } from "@/hooks/use-analytics";
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  BrainCircuit,
  FileSpreadsheet
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats();
  const { data: charts, isLoading: chartsLoading } = useAnalyticsCharts();
  const { data: insights, isLoading: insightsLoading } = useAnalyticsInsights();

  const activeUpload = stats as any;
  const uploadedColumns = (activeUpload?.columns as string[]) || [];

  function formatColumnName(col: string) {
    const nameMap: Record<string, string> = {
      'bio_age_5_17': 'Age 5-17 (Biometric)',
      'bio_age_17_': 'Age 17+ (Biometric)',
      'age_0_5': 'Age 0-5',
      'age_5_17': 'Age 5-17',
      'age_18_greater': 'Age 18+',
      'demo_age_5_17': 'Age 5-17 (Demographic)',
      'demo_age_17_': 'Age 17+ (Demographic)',
      'date': 'Date',
      'state': 'State',
      'district': 'District',
      'pincode': 'Pincode'
    };
    return nameMap[col] || col;
  }

  const ageColumns = uploadedColumns.filter(col => 
    col.includes('age') || col.includes('bio_age') || col.includes('demo_age')
  );

  if (statsLoading || chartsLoading || insightsLoading) {
    return (
      <Layout>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!stats || !charts || !insights) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time analysis of uploaded demographic data</p>
        </div>

        {/* Summary Cards for Age Columns */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ageColumns.map(col => (
            <StatCard 
              key={col}
              label={`Total ${formatColumnName(col)}`}
              value={formatNumber(charts.ageDistribution.find(d => d.name === formatColumnName(col))?.value || 0)}
              icon={Users}
              color="blue"
            />
          ))}
        </div>

        {/* Top Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            label="Total Records"
            value={formatNumber(stats.total)}
            icon={Users}
            color="blue"
            trend="up"
            trendValue="12.5%"
          />
          <StatCard 
            label="Verified Records"
            value={formatNumber(stats.verified)}
            subtext={`${formatPercent(stats.verificationRate)} Success Rate`}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard 
            label="Mismatches"
            value={formatNumber(stats.mismatch)}
            subtext="Requires attention"
            icon={XCircle}
            color="red"
          />
          <StatCard 
            label="Data Not Found"
            value={formatNumber(stats.notFound)}
            subtext="Missing in database"
            icon={AlertTriangle}
            color="amber"
          />
        </div>

        {/* Charts Section 1 */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">State-wise Distribution</h3>
                <p className="text-sm text-muted-foreground">Verification status across regions</p>
              </div>
            </div>
            <StateDistributionChart data={charts.stateDistribution} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-display font-bold text-lg text-slate-800 mb-6">Age Demographics</h3>
            <AgeDistributionChart data={charts.ageDistribution} />
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dominant Group</p>
                  <p className="font-semibold text-sm">{insights.dominantAgeGroup}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Trends */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="h-5 w-5 text-indigo-300" />
              <h3 className="font-display font-bold text-lg">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-indigo-200 mb-1">Top Performing States</p>
                <p className="font-medium text-sm">{insights.topStates.join(", ")}</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-indigo-200 mb-1">Data Anomalies</p>
                <ul className="space-y-1">
                  {insights.anomalies.map((note, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-indigo-200">Processing Range</span>
                   <span className="font-mono">{new Date(insights.dateRange.start).toLocaleDateString()} - {new Date(insights.dateRange.end).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-slate-800">Temporal Verification Trends</h3>
              <div className="p-2 bg-slate-50 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              </div>
            </div>
            <TrendChart data={charts.temporalTrends} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
