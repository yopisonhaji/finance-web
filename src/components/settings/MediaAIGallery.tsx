"use client"

import { useState, useEffect } from "react"
import { Upload, Trash2, Image as ImageIcon, FileText, Loader2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface MediaItem {
  id: number
  namaFile: string
  urlFile: string
  deskripsi: string
  tipeMedia: string
}

export function MediaAIGallery() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNama, setEditNama] = useState("")
  const [editDeskripsi, setEditDeskripsi] = useState("")
  const [saving, setSaving] = useState(false)

  const [nama, setNama] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/settings/media-ai")
      const data = await res.json()
      if (res.ok) setMediaList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleUpload = async () => {
    if (!file || !nama || !deskripsi) return alert("Semua kolom wajib diisi")

    if (file.size > 20 * 1024 * 1024) {
      return alert("Ukuran file maksimal 20MB")
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("namaFile", nama)
    formData.append("deskripsi", deskripsi)
    formData.append("tipeMedia", file.type.startsWith("image/") ? "image" : "document")

    try {
      const res = await fetch("/api/settings/media-ai", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setNama("")
        setDeskripsi("")
        setFile(null)
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        fetchMedia()
      } else {
        alert(data.error || "Gagal mengunggah")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number, urlFile: string) => {
    if (!confirm("Yakin ingin menghapus media ini?")) return
    setDeletingId(id)

    try {
      const filename = urlFile.split('/').pop()
      const res = await fetch(`/api/settings/media-ai?id=${id}&filename=${filename}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id))
      } else {
        alert("Gagal menghapus media")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (media: MediaItem) => {
    setEditingId(media.id)
    setEditNama(media.namaFile)
    setEditDeskripsi(media.deskripsi)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editNama.trim()) return alert("Nama file tidak boleh kosong")
    setSaving(true)
    try {
      const res = await fetch("/api/settings/media-ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, namaFile: editNama, deskripsi: editDeskripsi })
      })
      if (res.ok) {
        setMediaList((prev) => prev.map(m => m.id === id ? { ...m, namaFile: editNama, deskripsi: editDeskripsi } : m))
        setEditingId(null)
      } else {
        const data = await res.json()
        alert(data.error || "Gagal mengupdate media")
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
      <div className="flex flex-col mb-4">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-500" /> Galeri Media AI
        </h3>
        <p className="text-slate-500 text-sm mt-1">Unggah file atau gambar agar AI bisa mengirimkannya secara otomatis saat ditanya pengguna.</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-5 rounded-xl">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-500" /> Tambah Media Baru
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama File Singkat</Label>
              <Input 
                value={nama} 
                onChange={(e) => setNama(e.target.value)} 
                placeholder="Contoh: Brosur Perumahan, Daftar Harga" 
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Pilih File (Max 20MB)</Label>
              <Input 
                id="file-upload"
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="mt-1 bg-white dark:bg-slate-800"
                required
              />
            </div>
          </div>
          <div>
            <Label>Konteks / Instruksi untuk AI</Label>
            <Textarea 
              value={deskripsi} 
              onChange={(e) => setDeskripsi(e.target.value)} 
              placeholder="Beritahu AI kapan harus mengirimkan gambar ini. Contoh: 'Gunakan gambar ini jika pengguna menanyakan daftar harga perumahan.'" 
              className="mt-1 min-h-[80px]"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleUpload} disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Mengunggah..." : "Unggah & Simpan"}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-1">Galeri Tersimpan ({mediaList.length} file · Kuota 20MB total)</h3>
        <p className="text-xs text-slate-500 mb-4">Maksimal 20MB per file. Total penyimpanan 20MB per tenant. Bukan batas jumlah file.</p>
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 bg-white/50 dark:bg-slate-900/50">
            Belum ada media yang ditambahkan. AI hanya akan mengirim teks.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((media) => (
              <Card key={media.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden group hover:border-emerald-500/50 transition-colors">
                <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 relative">
                  {media.tipeMedia === "image" ? (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-300" />
                  )}
                  {media.tipeMedia === "image" && (
                     <img 
                       src={`http://195.88.211.117:8080${media.urlFile}`} 
                       alt={media.namaFile}
                       className="absolute inset-0 w-full h-full object-cover opacity-90"
                     />
                  )}
                </div>
                <CardContent className="p-4">
                  {editingId === media.id ? (
                    <div className="space-y-2">
                      <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} className="text-sm h-8" />
                      <Textarea value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} className="text-xs min-h-[50px]" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(media.id)} disabled={saving} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                          <Check className="w-3 h-3 mr-1" /> Simpan
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 text-xs">
                          <X className="w-3 h-3 mr-1" /> Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{media.namaFile}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{media.deskripsi}</p>
                    </>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                      ID: {media.id}
                    </span>
                    <div className="flex gap-1">
                      {editingId !== media.id && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="h-7 text-[10px] px-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white shadow-none"
                          onClick={() => handleEdit(media)}
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-7 text-[10px] px-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white shadow-none"
                        onClick={() => handleDelete(media.id, media.urlFile)}
                        disabled={deletingId === media.id}
                    >
                      {deletingId === media.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />} Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
