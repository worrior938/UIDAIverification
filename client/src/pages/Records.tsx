import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useUploads, useRecords } from "@/hooks/use-uploads";
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Status = 'Verified' | 'Mismatch' | 'NotFound';

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Mismatch: "bg-rose-50 text-rose-700 border-rose-200",
    NotFound: "bg-amber-50 text-amber-700 border-amber-200",
  }[status] || "bg-slate-50 text-slate-700 border-slate-200";

  const Icon = {
    Verified: CheckCircle,
    Mismatch: XCircle,
    NotFound: AlertTriangle,
  }[status] || AlertTriangle;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1.5", styles)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function Records() {
  const [selectedUploadId, setSelectedUploadId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const { data: uploads } = useUploads();
  
  // Default to latest upload if not selected
  const activeUploadId = selectedUploadId 
    ? parseInt(selectedUploadId) 
    : (uploads && uploads.length > 0 ? uploads[0].id : 0);

  const { data: recordsData, isLoading } = useRecords(activeUploadId, {
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter
  });

  const columnHelper = createColumnHelper<any>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: info => <span className="font-mono text-slate-500 text-xs">#{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => {
      const data = row.originalData || {};
      return data.name || data.Name || data.full_name || data.Full_Name || data.resident_name || data.Resident_Name || "N/A";
    }, {
      id: "name",
      header: "Name",
      cell: info => <span className="font-medium text-slate-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor("state", {
      header: "State",
    }),
    columnHelper.accessor("district", {
      header: "District",
    }),
    columnHelper.accessor("pincode", {
      header: "Pincode",
    }),
    columnHelper.accessor((row) => {
      return (row.age_0_5 || 0) + (row.age_5_17 || 0) + (row.age_18_greater || 0) + 
             (row.demo_age_5_17 || 0) + (row.demo_age_17_greater || 0) +
             (row.bio_age_5_17 || 0) + (row.bio_age_17_greater || 0);
    }, {
      id: "total_count",
      header: "Count",
      cell: info => <span className="font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
  ];

  const table = useReactTable({
    data: recordsData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: recordsData?.totalPages || 0,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Data Records</h1>
            <p className="text-muted-foreground mt-1">
              Browse and verify individual demographic entries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select 
              value={activeUploadId ? activeUploadId.toString() : ""} 
              onValueChange={setSelectedUploadId}
            >
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select Upload" />
              </SelectTrigger>
              <SelectContent>
                {uploads?.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.fileName} ({new Date(u.uploadDate!).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, state, or district..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="flex gap-1 p-1 bg-slate-200/50 rounded-lg">
                {['all', 'Verified', 'Mismatch', 'NotFound'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as any)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      statusFilter === s 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {columns.map((_, j) => (
                        <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : recordsData?.data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                      No records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-sm text-slate-500">
              Page {page} of {recordsData?.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (recordsData?.totalPages || 1) || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
