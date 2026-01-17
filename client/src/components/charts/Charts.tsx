import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { formatNumber } from "@/lib/utils";

const COLORS = {
  verified: "#059669", // emerald-600
  mismatch: "#dc2626", // rose-600
  notFound: "#d97706", // amber-600
  primary: "#3b82f6",  // blue-500
  secondary: "#6366f1", // indigo-500
  slate: "#64748b"     // slate-500
};

const PIE_COLORS = ["#3b82f6", "#059669", "#d97706", "#dc2626", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-mono font-medium text-slate-900">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function StateDistributionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="state" 
          width={100} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="verified" name="Verified" stackId="a" fill={COLORS.verified} radius={[0, 4, 4, 0]} barSize={20} />
        <Bar dataKey="mismatch" name="Mismatch" stackId="a" fill={COLORS.mismatch} radius={[0, 4, 4, 0]} barSize={20} />
        <Bar dataKey="notFound" name="Not Found" stackId="a" fill={COLORS.notFound} radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgeDistributionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="count" 
          name="Total Uploads" 
          stroke={COLORS.primary} 
          strokeWidth={3} 
          dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }} 
          activeDot={{ r: 6 }} 
        />
        <Line 
          type="monotone" 
          dataKey="verified" 
          name="Verified" 
          stroke={COLORS.verified} 
          strokeWidth={3} 
          strokeDasharray="5 5"
          dot={{ r: 4, fill: COLORS.verified, strokeWidth: 2, stroke: '#fff' }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
