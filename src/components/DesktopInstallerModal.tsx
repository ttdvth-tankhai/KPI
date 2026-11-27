import React, { useState } from 'react';
import {
  MonitorDown,
  X,
  Download,
  CheckCircle2,
  Terminal,
  HardDriveDownload,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface DesktopInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportDatabaseJson: () => void;
  onShowToast: (msg: string) => void;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg no-print">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      Chế độ Ngoại tuyến (Offline) — Dữ liệu đang được lưu và đọc trực tiếp trên máy tính.
    </div>
  );
};

export const DesktopInstallerModal: React.FC<DesktopInstallerModalProps> = ({
  isOpen,
  onClose,
  onExportDatabaseJson,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-i5qaxipsyh7h6y5yh6cj7o-481538170355.asia-southeast1.run.app';

  // Cách 1: Tải file .BAT tạo biểu tượng App độc lập ngay trên màn hình Desktop Windows (không cần cài VS Code)
  const handleDownloadQuickWindowsInstaller = () => {
    const batContent = [
      '@echo off',
      'chcp 65001 >nul',
      'title CAI DAT PHAN MEM V-KPI HD02 RA MAN HINH DESKTOP WINDOWS',
      'echo ==========================================================================',
      'echo   DANG TAO BIEU TUONG PHAN MEM V-KPI HD02 TREN MAN HINH DESKTOP WINDOWS',
      'echo ==========================================================================',
      'set "APP_URL=' + appUrl + '"',
      'set "SHORTCUT_PATH=%USERPROFILE%\\Desktop\\V-KPI HD02 - Danh gia Can bo.lnk"',
      '',
      'powershell -NoProfile -ExecutionPolicy Bypass -Command ^',
      '  "$ws = New-Object -ComObject WScript.Shell; ^',
      '   $edgePath = \'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\'; ^',
      '   if (-not (Test-Path $edgePath)) { $edgePath = \'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe\' }; ^',
      '   $sc = $ws.CreateShortcut(\'%SHORTCUT_PATH%\'); ^',
      '   $sc.TargetPath = $edgePath; ^',
      '   $sc.Arguments = \'--app=%APP_URL%\'; ^',
      '   $sc.Description = \'Phần mềm Đánh giá KPI & Kiểm điểm Cán bộ V-KPI HD02\'; ^',
      '   $sc.IconLocation = "$edgePath,0"; ^',
      '   $sc.Save()"',
      '',
      'echo.',
      'echo [HOAN TAT] Da tao bieu tuong "V-KPI HD02 - Danh gia Can bo" ngay tren Desktop!',
      'echo Dang khoi dong giao dien Desktop App...',
      'start "" msedge.exe --app="%APP_URL%"',
      'timeout /t 3 >nul',
    ].join('\r\n');

    const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CAI_DAT_VKPI_HD02_DESKTOP.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(
      'Đã tải file cài đặt nhanh CAI_DAT_VKPI_HD02_DESKTOP.bat! Hãy mở file này trên Windows để tạo biểu tượng phần mềm ngoài Desktop.'
    );
  };

  // Cách 2: Tải file TAO_FILE_CAIDAT_EXE.bat để đóng gói bộ cài Setup.exe độc lập trong VS Code
  const handleDownloadExeBuilderBat = () => {
    const batContent = [
      '@echo off',
      'chcp 65001 >nul',
      'title DONG GOI PHAN MEM V-KPI HD02 THANH FILE .EXE (WINDOWS)',
      'echo ============================================================================',
      'echo   HE THONG DONG GOI TU DONG V-KPI HD02 RA FILE CAI DAT .EXE TREN WINDOWS',
      'echo ============================================================================',
      'echo.',
      'where node >nul 2>nul',
      'if %errorlevel% neq 0 (',
      '    echo [LOI] May tinh chua cai dat Node.js! Vui long tai tai: https://nodejs.org/',
      '    pause',
      '    exit /b 1',
      ')',
      'echo [1/4] Dang cai dat cac thu vien du an (npm install)...',
      'call npm install',
      'echo [2/4] Dang cai dat cong cu dong goi Electron ^& Electron-Builder...',
      'call npm install --save-dev electron electron-builder',
      'echo [3/4] Dang bien dich giao dien V-KPI HD02 (che do Offline Desktop)...',
      'set ELECTRON_BUILD=true',
      'call npm run build',
      'echo [4/4] Dang xuat file cai dat Windows (.EXE) vao thu muc release/...',
      'call npx electron-builder --win --x64',
      'echo.',
      'echo [HOAN TAT] File V-KPI-HD02-Setup.exe da duoc tao trong thu muc release\\',
      'if exist "release" explorer "release"',
      'pause',
    ].join('\r\n');

    const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TAO_FILE_CAIDAT_EXE.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(
      'Đã tải kịch bản đóng gói TAO_FILE_CAIDAT_EXE.bat (đã được tích hợp sẵn trong thư mục gốc dự án).'
    );
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(
      'npm install --save-dev electron electron-builder && npm run desktop:build'
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div
      data-testid="desktop-installer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#541218] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <MonitorDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Cài đặt Phần mềm ra Máy tính Windows (.EXE / Desktop App)
              </h2>
              <p className="text-xs text-rose-200/90">
                Chọn 1 trong 2 phương thức cài đặt tùy theo nhu cầu sử dụng cá nhân của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ cài đặt"
            className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Option 1: Instant Desktop App / Shortcut Installer (Recommended, Zero VS Code required) */}
          <div className="rounded-xl border-2 border-emerald-600/30 bg-emerald-50/50 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white text-[11px] font-extrabold uppercase">
                  Khuyên dùng · Nhanh nhất (10 giây)
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Cách 1: Cài đặt trực tiếp ra màn hình Desktop Windows (Không cần VS Code)
                </h3>
              </div>
              {isInstalled && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Đã cài đặt
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Phần mềm chạy trong cửa sổ ứng dụng Windows độc lập (không có thanh địa chỉ trình duyệt), có biểu tượng{' '}
              <strong>V-KPI HD02</strong> ngoài màn hình Desktop, hỗ trợ lưu dữ liệu ngoại tuyến (Offline) trên máy và in phiếu A4 chuẩn thể thức.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  data-testid="pwa-direct-install-btn"
                  onClick={async () => {
                    const ok = await install();
                    if (ok) {
                      onShowToast('Đã cài đặt ứng dụng V-KPI HD02 ra màn hình máy tính thành công!');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Cài đặt App ngay (1 chạm từ Trình duyệt)
                </button>
              )}

              <button
                type="button"
                data-testid="download-desktop-bat-btn"
                onClick={handleDownloadQuickWindowsInstaller}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7A1C24] hover:bg-[#61151C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải file cài đặt nhanh Windows (CAI_DAT_VKPI_HD02_DESKTOP.bat)
              </button>
            </div>

            {isIOS && (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                Trên iPhone / iPad: Bấm nút <strong>Chia sẻ (Share)</strong> trên Safari và chọn{' '}
                <strong>Thêm vào MH chính (Add to Home Screen)</strong>.
              </div>
            )}

            <div className="text-[11px] text-slate-500 pt-1">
              * Hướng dẫn: Sau khi bấm tải file <code>CAI_DAT_VKPI_HD02_DESKTOP.bat</code> về máy, bạn chỉ cần nhấp đúp chuột chạy file đó, hệ thống sẽ tự tạo biểu tượng <strong>V-KPI HD02 - Đánh giá Cán bộ</strong> ngay trên màn hình Desktop của bạn.
            </div>
          </div>

          {/* Option 2: Standalone .EXE Packaging via Electron (Pre-configured in Source Code) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-white text-[11px] font-extrabold uppercase">
                  Đóng gói bộ cài độc lập
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Cách 2: Xuất bộ cài đặt độc lập <code className="text-[#7A1C24]">V-KPI-HD02-Setup.exe</code> (Qua VS Code)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Đã cấu hình sẵn trong mã nguồn
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tôi đã cấu hình sẵn toàn bộ file đóng gói <code>electron-main.cjs</code>, cấu hình <code>electron-builder</code> trong <code>package.json</code> và file chạy tự động <code>TAO_FILE_CAIDAT_EXE.bat</code> ngay trong mã nguồn dự án này.
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Các bước thực hiện khi tải mã nguồn về máy tính Windows:</span>
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCmd ? 'Đã sao chép lệnh' : 'Sao chép lệnh'}
                </button>
              </div>
              <div className="text-emerald-300">
                # Cách A: Nhấp đúp chuột chạy trực tiếp file có sẵn trong thư mục dự án:
              </div>
              <div className="pl-2 text-white font-bold">TAO_FILE_CAIDAT_EXE.bat</div>
              <div className="text-emerald-300 pt-1">
                # Cách B: Hoặc gõ lệnh trong Terminal của VS Code:
              </div>
              <div className="pl-2 text-amber-200">
                npm install --save-dev electron electron-builder && npm run desktop:build
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadExeBuilderBat}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#7A1C24]" />
                Tải kịch bản TAO_FILE_CAIDAT_EXE.bat
              </button>

              <button
                type="button"
                onClick={onExportDatabaseJson}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <HardDriveDownload className="w-3.5 h-3.5 text-emerald-700" />
                Sao lưu dữ liệu KPI cá nhân (.JSON)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            Mọi dữ liệu KPI 4 Quý & Hồ sơ cá nhân đều được tự động lưu an toàn trên máy tính của bạn.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
