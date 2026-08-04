"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddSantriDialog } from "@/components/santri/AddSantriDialog"
import { Download, Upload, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [isExporting, setIsExporting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const { t } = useLanguage()
  
  const handleExport = () => {
    setIsExporting(true)
    try {
      const exportData = data.map((item: any) => ({
        NIS: item.nis || "",
        "Nama Santri": item.nama || "",
        Kelas: item.kelas || "",
        "Nama Wali": item.nama_wali || "",
        "No WA Wali": item.no_wa || "",
        "Sisa Tagihan": item.saldo || 0,
        "Status Bulan Ini": item.status_bulan_ini || "BELUM_BAYAR"
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Data Santri")
      XLSX.writeFile(wb, `Data_Santri_${new Date().toISOString().slice(0,10)}.xlsx`)
    } catch (e) {
      console.error(e)
      alert("Gagal mengexport file")
    }
    setIsExporting(false)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          // Map Excel columns to DB schema
          const mappedData = jsonData.map((row: any) => ({
            nis: String(row.NIS || row.nis || ""),
            nama: String(row["Nama Santri"] || row.nama || ""),
            kelas: String(row.Kelas || row.kelas || ""),
            nama_wali: String(row["Nama Wali"] || row.nama_wali || ""),
            no_wa: String(row["No WA Wali"] || row.no_wa || ""),
            saldo: Number(row["Sisa Tagihan"] || row.saldo || 0),
            status_bulan_ini: String(row["Status Bulan Ini"] || row.status_bulan_ini || "BELUM_BAYAR")
          })).filter(row => row.nis && row.nama)

          if (mappedData.length === 0) {
            alert("Format Excel salah atau tidak ada data yang valid (Pastikan kolom NIS dan Nama Santri ada).")
            setIsImporting(false)
            return
          }

          const res = await fetch("/api/santri/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappedData)
          })

          const result = await res.json()
          if (res.ok) {
            alert(`Berhasil import ${mappedData.length} data santri! Refresh halaman untuk melihat perubahan.`)
            window.location.reload()
          } else {
            alert(`Gagal import: ${result.error}`)
          }
        } catch (error) {
          console.error(error)
          alert("Gagal membaca isi file Excel")
        } finally {
          setIsImporting(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat memproses file")
      setIsImporting(false)
    }
    
    // Reset input
    e.target.value = ""
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <div className="flex flex-col gap-4 py-4">
        <div className="w-full">
          <Input
            placeholder={t("students.search_placeholder")}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="w-full bg-[#0b172a] border-slate-700 text-white focus-visible:ring-blue-500 h-12 rounded-xl text-base"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:flex-row sm:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={isExporting} className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 h-11 rounded-lg">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4 text-blue-400" />}
            {t("students.export")}
          </Button>
          
          <div className="relative w-full">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleImport}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
            />
            <Button variant="outline" disabled={isImporting} className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 h-11 rounded-lg">
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4 text-green-400" />}
              {t("students.import")}
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("students.no_data")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t("students.prev")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("students.next")}
        </Button>
      </div>
    </div>
  )
}
