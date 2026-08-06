import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { getLaporanData } from "./actions"
import { TranslatedText } from "@/components/TranslatedText"

export default async function LaporanPage() {
  const data = await getLaporanData()
  
  const lunasTransactions = data.filter(t => t.status === 'LUNAS')
  const pendingTransactions = data.filter(t => t.status !== 'LUNAS')
  
  const totalPendapatan = lunasTransactions.reduce((acc, curr) => acc + curr.jumlah, 0)
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><TranslatedText tKey="reports.title" /></h1>
        <p className="text-muted-foreground mt-2">
          <TranslatedText tKey="reports.subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-colors bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><TranslatedText tKey="reports.total_income" /></CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              Rp {totalPendapatan.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TranslatedText tKey="reports.from_x_paid" params={{ count: lunasTransactions.length }} />
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><TranslatedText tKey="reports.pending_tx" /></CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400"><TranslatedText tKey="reports.tx_count" params={{ count: pendingTransactions.length }} /></div>
            <p className="text-xs text-muted-foreground mt-1">
              <TranslatedText tKey="reports.pending_desc" />
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xl">
        <CardHeader>
          <CardTitle><TranslatedText tKey="reports.recent_tx" /></CardTitle>
          <CardDescription><TranslatedText tKey="reports.tx_log_desc" /></CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-[300px] border-dashed border-slate-300 dark:border-slate-700 border-2 rounded-xl flex items-center justify-center text-muted-foreground bg-white dark:bg-slate-900/50">
              <div className="text-center">
                <CalendarIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p><TranslatedText tKey="reports.no_tx_data" /></p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-300 dark:border-slate-700">
              <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
                <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 uppercase border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.date" /></th>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.student_name" /></th>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.type" /></th>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.amount" /></th>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.method" /></th>
                    <th className="px-4 py-3"><TranslatedText tKey="reports.status" /></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((trx) => (
                    <tr key={trx.id} className="border-b border-slate-300 dark:border-slate-700/50 hover:bg-slate-100 dark:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {new Date(trx.createdAt || "").toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">
                        {trx.santri?.nama || <TranslatedText tKey="reports.deleted_student" />}
                        <div className="text-xs text-slate-500">{trx.santri?.kelas || "-"}</div>
                      </td>
                      <td className="px-4 py-3">{trx.tipe}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">
                        Rp {trx.jumlah.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded text-xs">
                          {trx.metode || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {trx.status === 'LUNAS' ? (
                          <span className="flex items-center text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> <TranslatedText tKey="reports.paid_status" />
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">{trx.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
