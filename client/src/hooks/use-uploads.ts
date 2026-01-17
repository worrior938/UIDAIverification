import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUploads() {
  return useQuery({
    queryKey: [api.uploads.list.path],
    queryFn: async () => {
      const res = await fetch(api.uploads.list.path);
      if (!res.ok) throw new Error("Failed to fetch uploads");
      return api.uploads.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpload(id: number) {
  return useQuery({
    queryKey: [api.uploads.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.uploads.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch upload");
      return api.uploads.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

type RecordParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'Verified' | 'Mismatch' | 'NotFound';
};

export function useRecords(uploadId: number, params: RecordParams = {}) {
  return useQuery({
    queryKey: [api.uploads.records.path, uploadId, params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;

      const url = buildUrl(api.uploads.records.path, { id: uploadId });
      const queryString = new URLSearchParams(queryParams).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch records");
      return api.uploads.records.responses[200].parse(await res.json());
    },
    enabled: !!uploadId,
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.uploads.create.path, {
        method: api.uploads.create.method,
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to upload file");
      }
      
      return api.uploads.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.uploads.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.stats.path] });
      toast({
        title: "Upload Successful",
        description: "Your file has been processed and analyzed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });
}
