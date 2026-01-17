import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAnalyticsStats(uploadId?: string) {
  return useQuery({
    queryKey: [api.analytics.stats.path, uploadId],
    queryFn: async () => {
      const url = new URL(api.analytics.stats.path, window.location.origin);
      if (uploadId) url.searchParams.set("uploadId", uploadId);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.analytics.stats.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyticsCharts(uploadId?: string) {
  return useQuery({
    queryKey: [api.analytics.charts.path, uploadId],
    queryFn: async () => {
      const url = new URL(api.analytics.charts.path, window.location.origin);
      if (uploadId) url.searchParams.set("uploadId", uploadId);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch charts");
      return api.analytics.charts.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyticsInsights(uploadId?: string) {
  return useQuery({
    queryKey: [api.analytics.insights.path, uploadId],
    queryFn: async () => {
      const url = new URL(api.analytics.insights.path, window.location.origin);
      if (uploadId) url.searchParams.set("uploadId", uploadId);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch insights");
      return api.analytics.insights.responses[200].parse(await res.json());
    },
  });
}
