"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"

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
import { addSantri } from "./actions"
import { useAppConfig } from "@/contexts/AppConfigContext"

const formSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  nama_wali: z.string().min(1, "Nama wali wajib diisi"),
  no_wa: z.string().min(10, "Nomor WA tidak valid"),
  nominal_spp: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
})

export function AddSantriDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { tipeBisnis } = useAppConfig()

  const isBisnis = tipeBisnis === "PERUSAHAAN"
  const termStudent = isBisnis ? "Klien" : "Siswa"
  const termWali = isBisnis ? "Penanggung Jawab" : "Wali Siswa"
  const termKelas = isBisnis ? "Layanan" : "Kelas"
  const termNIS = isBisnis ? "ID Klien" : "NIS / ID Siswa"

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nis: "",
      nama: "",
      kelas: "",
      nama_wali: "",
      no_wa: "",
      nominal_spp: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    const res = await addSantri(values)
    setLoading(false)
    
    if (res.success) {
      setOpen(false)
      form.reset()
    } else {
      alert("Gagal menambahkan santri: " + res.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah {termStudent}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Data {termStudent}</DialogTitle>
          <DialogDescription>
            Masukkan biodata {termStudent.toLowerCase()} dan informasi kontak WhatsApp {termWali.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{termNIS}</FormLabel>
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
                  <FormLabel>Nama Lengkap {termStudent}</FormLabel>
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
                  <FormLabel>{termKelas}</FormLabel>
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
                  <FormLabel>Nama {termWali}</FormLabel>
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
                  <FormLabel>Nomor WA {termWali} (Awali dengan 62)</FormLabel>
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
                  <FormLabel>Nominal Tagihan Bulanan (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 500000" {...field} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Menyimpan..." : `Simpan Data ${termStudent}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
