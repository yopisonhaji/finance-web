import { getTunggakan } from "./actions"
import { columns } from "./columns"
import { DataTable } from "../santri/data-table"
import { TranslatedText } from "@/components/TranslatedText"
import { TunggakanMobileList } from "./TunggakanMobileList"

export default async function TunggakanPage() {
  const data = await getTunggakan()

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-500">
            <TranslatedText tKey="arrears.title" />
          </h1>
          <p className="text-muted-foreground mt-2">
            <TranslatedText tKey="arrears.subtitle" />
          </p>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block flex-1 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl p-6 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>

      {/* Mobile Card List View */}
      <TunggakanMobileList data={data} />
    </div>
  )
}




