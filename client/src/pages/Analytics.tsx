import { Layout } from "@/components/Layout";
import { StateDistributionChart, AgeDistributionChart, TrendChart } from "@/components/charts/Charts";
import { useAnalyticsStats, useAnalyticsCharts } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, PieChart, LineChart, Map } from "lucide-react";

export default function Analytics() {
  const { data: stats } = useAnalyticsStats();
  const { data: charts, isLoading } = useAnalyticsCharts();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
             <Skeleton className="h-96 rounded-2xl" />
             <Skeleton className="h-96 rounded-2xl" />
             <Skeleton className="h-96 rounded-2xl" />
             <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!charts) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into data patterns and regional performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: State Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                 <Map className="h-5 w-5" />
               </div>
               <h3 className="font-display font-bold text-lg text-slate-900">Regional Verification Status</h3>
             </div>
             <StateDistributionChart data={charts.stateDistribution} />
          </div>

          {/* Card 2: Age Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                 <PieChart className="h-5 w-5" />
               </div>
               <h3 className="font-display font-bold text-lg text-slate-900">Age Demographics</h3>
             </div>
             <AgeDistributionChart data={charts.ageDistribution} />
          </div>

          {/* Card 3: District Analysis (Reusing State Chart for now but would ideally be another chart type) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                 <BarChart2 className="h-5 w-5" />
               </div>
               <h3 className="font-display font-bold text-lg text-slate-900">District Performance</h3>
             </div>
             <p className="text-sm text-muted-foreground mb-4">Top districts by verification rate</p>
             {/* Using simplified chart for demo, in real app would use specific district chart */}
             <StateDistributionChart 
                data={charts.districtAnalysis.map(d => ({ 
                  state: d.district, 
                  verified: d.total * (d.verifiedRate/100), 
                  mismatch: d.total * ((100-d.verifiedRate)/100), 
                  notFound: 0 
                }))} 
             />
          </div>

          {/* Card 4: Trends */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                 <LineChart className="h-5 w-5" />
               </div>
               <h3 className="font-display font-bold text-lg text-slate-900">Processing Velocity</h3>
             </div>
             <TrendChart data={charts.temporalTrends} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
