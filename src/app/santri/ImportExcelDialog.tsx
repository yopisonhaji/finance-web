"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { read, utils } from "xlsx";
import { importSantriBatch } from "../actions/santri";

export function ImportExcelDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Parse file for preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = utils.sheet_to_json(ws);
          setPreview(data.slice(0, 3)); // preview top 3 rows
        } catch (error) {
          console.error("Error reading excel:", error);
          setMessage({ text: "Gagal membaca file. Pastikan format file Excel valid.", type: "error" });
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = utils.sheet_to_json(ws);

          const res = await importSantriBatch(data);
          
          if (res.success) {
            setMessage({ text: `Berhasil mengimpor ${res.count} data!`, type: "success" });
            setTimeout(() => {
              setOpen(false);
              setFile(null);
              setPreview([]);
              setMessage(null);
              router.refresh();
            }, 1500);
          } else {
            setMessage({ text: res.error || "Gagal mengimpor data", type: "error" });
          }
        } catch (error: any) {
          setMessage({ text: error.message, type: "error" });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error: any) {
      setLoading(false);
      setMessage({ text: error.message, type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-[#1e293b] border-slate-700 hover:bg-slate-800 text-white">
          <Upload className="w-4 h-4" /> Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1e293b] text-white border-slate-700">
        <DialogHeader>
          <DialogTitle>Import Data dari Excel</DialogTitle>
          <DialogDescription className="text-slate-400">
            Unggah file .xlsx atau .csv dengan kolom minimal: NIS dan Nama.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {!file ? (
            <div 
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-12 h-12 text-slate-400" />
              <p className="text-sm text-center text-slate-400">
                Klik untuk memilih file Excel / CSV
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <FileSpreadsheet className="w-6 h-6 text-green-400" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview([]); }} disabled={loading}>
                  Batal
                </Button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">Preview (3 baris pertama):</p>
                  <div className="bg-slate-900 rounded border border-slate-800 p-2 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr>
                          {Object.keys(preview[0]).map(k => <th key={k} className="px-2 py-1 text-slate-400">{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t border-slate-800">
                            {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1 truncate max-w-[100px]">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileChange} 
          />

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 flex gap-3 text-blue-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs">
              Pastikan header kolom di Excel sesuai. Contoh: <strong>NIS, Nama, Kelas, Nama Wali, No WA, Nominal SPP</strong>.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs font-medium border ${message.type === "success" ? "bg-green-900/20 border-green-800/50 text-green-400" : "bg-red-900/20 border-red-800/50 text-red-400"}`}>
              {message.text}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-transparent border-slate-700 text-white">
            Tutup
          </Button>
          <Button onClick={handleImport} disabled={!file || loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Memproses..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
