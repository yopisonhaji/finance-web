"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateSantri, Santri } from "./actions"

const formSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  nama_wali: z.string().min(1, "Nama wali wajib diisi"),
  no_wa: z.string().min(10, "Nomor WA tidak valid"),
  nominal_spp: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
})

export function EditSantriDialog({ santri }: { santri: Santri }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nis: santri.nis || "",
      nama: santri.nama || "",
      kelas: santri.kelas || "",
      nama_wali: santri.nama_wali || "",
      no_wa: santri.no_wa || "",
      nominal_spp: santri.nominal_spp || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    const res = await updateSantri(santri.id, values)
    setLoading(false)
    
    if (res.success) {
      setOpen(false)
    } else {
      alert("Gagal mengubah data santri: " + res.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if(val) {
        form.reset({
          nis: santri.nis || "",
          nama: santri.nama || "",
          kelas: santri.kelas || "",
          nama_wali: santri.nama_wali || "",
          no_wa: santri.no_wa || "",
          nominal_spp: santri.nominal_spp || 0,
        });
      }
    }}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-orange-600 dark:text-blue-500 hover:text-blue-700 hover:bg-orange-50 dark:bg-blue-50 mr-1">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Santri</DialogTitle>
          <DialogDescription>
            Ubah biodata santri dan informasi kontak WhatsApp wali santri.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIS / ID Santri</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1001" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap Santri</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Ahmad Yasin" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas / Asrama</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 10 A" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama_wali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Wali</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Bpk. Supardi" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="no_wa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WA Wali (Awali dengan 62)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 62812345678" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nominal_spp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Tagihan SPP Bulanan (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 500000" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
