import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Kebijakan Privasi - Finance AI',
  description: 'Kebijakan Privasi dan Petunjuk Penghapusan Data Pengguna untuk Finance AI.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-orange-600 dark:bg-blue-600 px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Kebijakan Privasi & Ketentuan Layanan</h1>
          <p className="text-orange-100 dark:text-blue-100">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div className="px-8 py-10 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 border-b pb-2">1. Pengantar</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Selamat datang di Finance AI (Sistem Manajemen Keuangan & Multi-Tenant). Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat Anda menggunakan aplikasi kami, termasuk ketika Anda mendaftar melalui layanan pihak ketiga seperti <strong>Google</strong> dan <strong>Facebook</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 border-b pb-2">2. Data Apa Saja yang Kami Kumpulkan?</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Saat Anda mendaftar atau menggunakan Finance AI, kami dapat mengumpulkan informasi berikut:
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-300 space-y-2">
              <li><strong>Informasi Akun:</strong> Nama lengkap, alamat email, dan nomor WhatsApp.</li>
              <li><strong>Otentikasi Pihak Ketiga:</strong> Jika Anda menggunakan Login Google atau Facebook, kami menerima ID unik (Firebase UID) dan email publik Anda guna keperluan pembuatan akun. Kami <strong>tidak</strong> memiliki akses ke kata sandi media sosial Anda.</li>
              <li><strong>Data Transaksional:</strong> Data klien atau santri yang Anda masukkan ke dalam sistem untuk keperluan manajemen kas dan penagihan otomatis.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 border-b pb-2">3. Bagaimana Kami Menggunakan Data Anda?</h2>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-300 space-y-2">
              <li>Untuk menyediakan, mengoperasikan, dan memelihara infrastruktur layanan kami.</li>
              <li>Untuk mengirimkan notifikasi penagihan melalui bot WhatsApp terintegrasi yang Anda hubungkan.</li>
              <li>Untuk mematuhi kewajiban hukum yang berlaku.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 border-b pb-2">4. Petunjuk Penghapusan Data (Data Deletion Instructions)</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Berdasarkan Aturan Perlindungan Data Umum (GDPR) dan standar kepatuhan Facebook Developer, Anda memiliki hak penuh untuk meminta penghapusan total atas semua data pribadi Anda (Hak untuk Dilupakan / <em>Right to be Forgotten</em>) yang tersimpan di server kami.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold mt-4 mb-2">Langkah-Langkah Menghapus Data Anda:</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <ol className="list-decimal pl-5 text-slate-700 dark:text-slate-300 space-y-3">
                <li>Silakan kirimkan email permintaan penghapusan akun ke alamat <strong>yulison47@gmail.com</strong> dengan subjek <em>"Request Data Deletion - [Nama Anda]"</em>.</li>
                <li>Alternatif lainnya, jika Anda memiliki akses Dashboard Super Admin, Anda dapat menggunakan utilitas <strong>Reset Akun</strong> yang akan menghapus secara otomatis <em>Tenant ID</em> beserta seluruh data santri, transaksi, dan kredensial Anda dari Database Pusat secara permanen.</li>
                <li>Khusus untuk data Login (Google/Facebook), Anda juga dapat mencabut akses aplikasi Finance AI langsung dari pengaturan keamanan akun Google atau Facebook pribadi Anda.</li>
              </ol>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 border-b pb-2">5. Hubungi Kami</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Jika Anda memiliki pertanyaan seputar kebijakan privasi ini, atau ingin mengajukan permohonan penghapusan data, silakan hubungi kami di: <br />
              <strong>Email:</strong> yulison47@gmail.com <br />
              <strong>WhatsApp:</strong> 0821-3800-4443
            </p>
          </section>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950 px-8 py-6 text-center border-t border-slate-100 dark:border-slate-800">
          <Link href="/login" className="text-orange-600 dark:text-blue-500 font-semibold hover:underline transition-all">
            &larr; Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
