import React, { useState } from 'react';
import {
  Archive,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Eye,
  PlusCircle,
} from 'lucide-react';
import {
  formatVnNumber,
  type HistoricalArchiveItem,
  type UserProfile,
  type ClassificationLevel,
} from '../utils/kpiEngine';

interface HistoryArchiveTabProps {
  archiveItems: HistoricalArchiveItem[];
  profile: UserProfile;
  currentYearScore: number;
  currentYearGeneral: number;
  currentYearKpi: number;
  currentYearKpiPercent: number;
  currentYearLevel: ClassificationLevel;
  onArchiveCurrentYear: () => void;
}

export const HistoryArchiveTab: React.FC<HistoryArchiveTabProps> = ({
  archiveItems,
  profile,
  currentYearScore,
  currentYearGeneral,
  currentYearKpi,
  currentYearKpiPercent,
  currentYearLevel,
  onArchiveCurrentYear,
}) => {
  const [selectedArchive, setSelectedArchive] = useState<HistoricalArchiveItem | null>(
    archiveItems[0] || null
  );
  const [archivedBanner, setArchivedBanner] = useState(false);

  const has2026Archived = archiveItems.some((item) => item.year === 2026);

  const handleArchive2026 = () => {
    onArchiveCurrentYear();
    setArchivedBanner(true);
    setTimeout(() => setArchivedBanner(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kho lưu trữ lịch sử đánh giá lâu dài & Bảo mật chữ ký số
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Lưu trữ hồ sơ kiểm điểm, phiếu điểm KPI đa niên hạn (2023 – 2026) với mã băm SHA-256 chống chỉnh sửa
          </p>
        </div>

        {!has2026Archived && (
          <button
            type="button"
            onClick={handleArchive2026}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Đóng dấu & Lưu trữ Hồ sơ Năm 2026 ({formatVnNumber(currentYearScore)}đ)
          </button>
        )}
      </div>

      {archivedBanner && (
        <div
          data-testid="archive-saved-banner"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Đã đóng gói, ký số bảo mật SHA-256 và đưa Hồ sơ đánh giá Năm 2026 của đồng chí{' '}
            {profile.fullName} vào kho lưu trữ vĩnh viễn.
          </span>
        </div>
      )}

      {/* Multi-Year Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live 2026 Card */}
        <div className="bg-white rounded-xl p-5 border-2 border-[#7A1C24] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#7A1C24]">NĂM 2026 (HIỆN TẠI)</span>
            <ShieldCheck className="w-4 h-4 text-[#7A1C24]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatVnNumber(currentYearScore)} / 100
          </div>
          <div className="text-xs font-bold text-[#7A1C24]">{currentYearLevel}</div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            Chung: {formatVnNumber(currentYearGeneral)}/30 · KPI: {formatVnNumber(currentYearKpi)}/70 ({formatVnNumber(currentYearKpiPercent)}%)
          </div>
        </div>

        {archiveItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-5 border border-slate-200/90 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-700">NĂM {item.year} (LƯU TRỮ)</span>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {formatVnNumber(item.totalScore)} / 100
            </div>
            <div className="text-xs font-bold text-slate-800">{item.finalClassification}</div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              Chung: {formatVnNumber(item.generalScore)}/30 · KPI: {formatVnNumber(item.kpiScore)}/70
            </div>
          </div>
        ))}
      </div>

      {/* Historical Archive Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Archive className="w-4 h-4 text-[#7A1C24]" />
              <span>DANH SÁCH HỒ SƠ ĐÁNH GIÁ LƯU TRỮ ĐA NIÊN HẠN</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Toàn vẹn dữ liệu: 100% hợp lệ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-3 px-4">Kỳ lưu trữ</th>
                  <th className="py-3 px-3">Chức vụ thời điểm đánh giá</th>
                  <th className="py-3 px-3 text-center">Mẫu</th>
                  <th className="py-3 px-3 text-right">Điểm tổng</th>
                  <th className="py-3 px-3">Kết quả xếp loại</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {archiveItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedArchive?.id === item.id ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.periodLabel}
                      <div className="text-[11px] font-mono font-normal text-slate-500 mt-0.5">
                        Ngày lưu: {item.archivedDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">{item.position}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-[#7A1C24]">
                      Mẫu {item.templateType}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-extrabold text-slate-900 tabular-nums">
                      {formatVnNumber(item.totalScore)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {item.finalClassification}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedArchive(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Tra cứu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Detail Card */}
        {selectedArchive && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-[11px] font-bold text-[#7A1C24]">CHỨNG THỰC LƯU TRỮ SỐ</div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Hồ sơ {selectedArchive.periodLabel}
                </h3>
              </div>
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên cán bộ:</span>
                <span className="font-bold text-slate-900">{selectedArchive.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chức vụ:</span>
                <span className="font-semibold text-slate-800">{selectedArchive.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biểu mẫu lưu trữ:</span>
                <span className="font-mono font-bold text-[#7A1C24]">
                  Mẫu {selectedArchive.templateType} + Mẫu 05
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Điểm tiêu chí chung (30):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatVnNumber(selectedArchive.generalScore)} / 30
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Điểm KPI nhiệm vụ (70):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatVnNumber(selectedArchive.kpiScore)} / 70 ({formatVnNumber(selectedArchive.kpiPercent)}%)
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700">Tổng điểm thẩm định:</span>
                <span className="font-mono text-sm font-extrabold text-[#7A1C24]">
                  {formatVnNumber(selectedArchive.totalScore)} / 100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cấp có thẩm quyền ký:</span>
                <span className="font-semibold text-slate-800">{selectedArchive.approverName}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-500">
                MÃ BĂM NIÊM PHONG HỒ SƠ (SHA-256 VGCA)
              </div>
              <div className="font-mono text-[11px] text-emerald-800 break-all">
                {selectedArchive.digitalSignatureHash}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
