import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Layout } from "@/components/Layout";
import { useCreateUpload } from "@/hooks/use-uploads";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: uploadFile, isPending } = useCreateUpload();
  const [, setLocation] = useLocation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    uploadFile(formData, {
      onSuccess: () => {
        setFile(null);
        setLocation("/records");
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Upload Data</h1>
          <p className="text-muted-foreground mt-1">
            Import CSV or Excel files for bulk verification.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
              isDragActive 
                ? "border-primary bg-primary/5 scale-[1.01]" 
                : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
              file && "border-emerald-200 bg-emerald-50/30"
            )}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="space-y-4">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 text-lg">{file.name}</h3>
                  <p className="text-emerald-700 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <CloudUpload className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {isDragActive ? "Drop file here" : "Click to upload or drag and drop"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">
                    Supports .csv, .xlsx, .xls formats. Maximum file size 10MB.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleUpload} 
              disabled={!file || isPending}
              className={cn(
                "w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20",
                isPending && "opacity-80"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process & Verify
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900">Format Requirements</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Ensure your file has headers: Name, Aadhaar (masked), DOB, District, State.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex gap-3">
              <CloudUpload className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Secure Processing</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Files are processed securely and deleted after analysis. No raw Aadhaar numbers stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
