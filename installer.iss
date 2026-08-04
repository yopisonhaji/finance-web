; Script Inno Setup untuk Aplikasi Kasir
; Script ini akan mengubah folder dist-client menjadi file Setup-Kasir.exe

[Setup]
AppName=Aplikasi Kasir Pesantren
AppVersion=0.1.2
AppVerName=Aplikasi Kasir Pesantren 0.1.2
DefaultDirName={pf}\AplikasiKasir
DefaultGroupName=Aplikasi Kasir
OutputDir=.\
OutputBaseFilename=Setup-Kasir
Compression=lzma
SolidCompression=yes
; Jika Anda punya file ikon (.ico), hapus tanda titik koma di bawah ini dan sesuaikan namanya:
; SetupIconFile=icon.ico

[Files]
; Mengambil SELURUH isi dari folder dist-client
Source: "dist-client\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Membuat Shortcut di Start Menu
Name: "{group}\Buka Aplikasi Kasir"; Filename: "{app}\run.bat"
; Membuat Shortcut di Desktop pembeli
Name: "{commondesktop}\Aplikasi Kasir"; Filename: "{app}\run.bat"

[Run]
; Menawarkan opsi untuk langsung membuka aplikasi setelah instalasi selesai
Filename: "{app}\run.bat"; Description: "Jalankan Aplikasi Kasir Sekarang"; Flags: postinstall shellexec
