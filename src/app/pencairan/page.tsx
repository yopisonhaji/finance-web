import { Banknote, HandCoins } from "lucide-react";

export default function PencairanPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Banknote className="w-8 h-8 text-blue-500" />
          Pencairan Dana
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tarik saldo virtual yang Anda terima dari pembayaran pelanggan ke rekening instansi Anda.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <HandCoins className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Segera Hadir
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Halaman pencairan dana sedang dalam tahap pengembangan. Saat ini saldo Anda tetap aman tersimpan di sistem kami.
        </p>
      </div>
    </div>
  );
}
