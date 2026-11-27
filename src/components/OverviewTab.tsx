import React from 'react';
import {
  FileText,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ArrowRight,
  BarChart3,
  Award,
  TrendingUp,
  Layers,
  Download,
} from 'lucide-react';
import {
  formatVnNumber,
  type UserProfile,
  type ClassificationLevel,
  type QuarterCode,
} from '../utils/kpiEngine';
import { DEPARTMENT_PERFORMANCE_ANALYTICS } from '../data/mockKpiData';

export type NavTabId =
  | 'overview'
  | 'tasks'
  | 'self_eval'
  | 'forms'
  | 'approvals'
  | 'collective'
  | 'positions'
  | 'profile'
  | 'history'
  | 'admin';

interface OverviewTabProps {
  profile: UserProfile;
  totalScore: number;
  generalScore: number;
  kpiPillarScore: number;
  kpiPercentage: number;
  totalTasks: number;
  completedTasks: number;
  selfScoredTasks: number;
  onTimeTasks: number;
  onTimePercent: number;
  suggestedLevel: ClassificationLevel;
  quarterSummaryList: {
    quarter: QuarterCode;
    score: number;
    kpiPercent: number;
    classification: ClassificationLevel;
  }[];
  criteriaBreakdown: {
    avgA: number;
    avgB: number;
    avgC: number;
    avgD: number;
  };
  onNavigate: (tab: NavTabId) => void;
  onExportCsv: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  totalScore,
  generalScore,
  kpiPillarScore,
  kpiPercentage,
  totalTasks,
  completedTasks,
  selfScoredTasks,
  onTimeTasks,
  onTimePercent,
  suggestedLevel,
  quarterSummaryList,
  criteriaBreakdown,
  onNavigate,
  onExportCsv,
}) => {
  const circleRadius = 52;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference - (Math.min(100, Math.max(0, totalScore)) / 100) * circleCircumference;

  const workflowSteps: {
    step: number;
    title: string;
    desc: string;
    targetTab: NavTabId;
    done: boolean;
  }[] = [
    {
      step: 1,
      title: 'Hồ sơ',
      desc: `Đã chọn Mẫu ${profile.templateType}`,
      targetTab: 'profile',
      done: true,
    },
    {
      step: 2,
      title: 'Thiết lập',
      desc: 'Định mức vị trí việc làm',
      targetTab: 'positions',
      done: true,
    },
    {
      step: 3,
      title: 'Công việc',
      desc: `${completedTasks}/${totalTasks} đầu việc KPI`,
      targetTab: 'tasks',
      done: completedTasks > 0,
    },
    {
      step: 4,
      title: 'Tự đánh giá',
      desc: `${formatVnNumber(totalScore)}/100 điểm`,
      targetTab: 'self_eval',
      done: selfScoredTasks > 0,
    },
    {
      step: 5,
      title: 'Xuất mẫu biểu',
      desc: `Mẫu ${profile.templateType}, Mẫu 05 & PDF`,
      targetTab: 'forms',
      done: totalScore >= 50,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan đánh giá KPI & Kiểm điểm cuối năm
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Theo Hướng dẫn 02 · Quy định 366-QĐ/TW · Công văn 2772 & Quy định 227 của Trung ương
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất dữ liệu Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            + Thêm công việc
          </button>
        </div>
      </div>

      {/* Hero Banner matching Video 1 */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#5D131A] via-[#7A1C24] to-[#8F242E] text-white p-6 sm:p-7 border border-[#4A0E14]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-200">
              <span>KIỂM ĐIỂM - QĐ 366 & HƯỚNG DẪN 02</span>
              <span aria-hidden="true">·</span>
              <span>ÁP DỤNG MẪU {profile.templateType} {profile.hasConcurrentRole ? '+ MẪU 02C' : ''}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Xem mẫu biểu & Tổng hợp KPI 4 Quý
            </h2>
            <p className="text-sm text-rose-100/90 leading-relaxed">
              Hệ thống tự động liên kết bảng tính KPI hàng quý sang Biểu thống kê sản phẩm Mẫu 05 và Bản kiểm điểm cuối năm đúng đối tượng ({profile.fullName} — {profile.govRole}).
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('self_eval')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#5D131A] bg-white rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                + Làm kiểm điểm cuối năm
              </button>
              <button
                type="button"
                onClick={() => onNavigate('forms')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-white/15 border border-white/30 rounded-lg hover:bg-white/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Xem bảng KPI & Xuất PDF/Word
              </button>
            </div>
          </div>

          {/* Period Box on Right of Banner */}
          <div className="flex items-center gap-4 lg:border-l lg:border-white/20 lg:pl-8 shrink-0">
            <div className="bg-black/25 border border-white/15 rounded-xl px-5 py-4 text-center min-w-[140px]">
              <div className="text-[11px] font-medium text-rose-200">KỲ ĐÁNH GIÁ</div>
              <div className="text-3xl font-extrabold font-mono text-white mt-0.5 tabular-nums">
                Q4
              </div>
              <div className="text-xs font-mono text-amber-200 mt-0.5 tabular-nums">
                Năm 2026
              </div>
            </div>
            <div className="bg-black/25 border border-white/15 rounded-xl px-5 py-4 text-center min-w-[155px]">
              <div className="text-[11px] font-medium text-rose-200">TỶ LỆ HOÀN THÀNH KPI</div>
              <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1 tabular-nums">
                {formatVnNumber(kpiPercentage)}%
              </div>
              <div className="text-xs text-rose-100 mt-0.5">
                Quy đổi: {formatVnNumber(kpiPillarScore)}/70đ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Stat Cards matching Video 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Điểm tự đánh giá</span>
            <Award className="w-4 h-4 text-[#7A1C24]" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              data-testid="overview-total-score"
              className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums"
            >
              {formatVnNumber(totalScore)}
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#7A1C24] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, totalScore)}%` }}
            />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Công việc đã giao</span>
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              data-testid="overview-total-tasks"
              className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums"
            >
              {totalTasks}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              · {completedTasks} hoàn thành
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalTasks > 0 ? Math.min(100, (completedTasks / totalTasks) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Đã tự chấm điểm KPI</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {selfScoredTasks}
            </span>
            <span className="text-xs text-slate-500">
              · {Math.max(0, totalTasks - selfScoredTasks)} chưa chấm
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalTasks > 0 ? Math.min(100, (selfScoredTasks / totalTasks) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tiến độ đúng hạn</span>
            <Clock className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {onTimeTasks}/{totalTasks}
            </span>
            <span className="text-xs text-emerald-700 font-medium tabular-nums">
              · {onTimePercent}% đạt tiến độ
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, onTimePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Step Digital Signature Workflow Pipeline matching Video 1 */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <div className="text-xs font-semibold text-[#7A1C24]">QUY TRÌNH KÝ SỐ & TRÌNH DUYỆT</div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Từ thiết lập hồ sơ đến xuất bản kiểm điểm ký số
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Bấm vào từng bước để chuyển nhanh đến phân hệ xử lý
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {workflowSteps.map((item, idx) => (
            <button
              key={item.step}
              type="button"
              onClick={() => onNavigate(item.targetTab)}
              className="group text-left p-3.5 rounded-lg border border-slate-200 hover:border-[#7A1C24] hover:bg-rose-50/30 transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono bg-[#7A1C24] text-white">
                  {item.step}
                </span>
                {idx < workflowSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7A1C24] transition-colors" />
                )}
              </div>
              <div className="mt-3">
                <div className="text-sm font-bold text-slate-900 group-hover:text-[#7A1C24]">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pillar Score Analysis & Suggested Classification Gauge matching Video 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Điểm theo trụ */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#7A1C24]">PHÂN TÍCH KẾT QUẢ</div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Cấu trúc điểm theo 2 trụ cột (Quy định 366 & Hướng dẫn 02)
            </h3>

            <div className="mt-6 space-y-5">
              {/* Pillar 1: General Criteria (Max 30) */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-800">
                    I. Nhóm tiêu chí chung (Chính trị, đạo đức, tác phong, kỷ luật — tối đa 30)
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatVnNumber(generalScore)} / 30 điểm
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1C24] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (generalScore / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Pillar 2: Task Results KPI (Max 70) */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-800">
                    II. Kết quả thực hiện nhiệm vụ — KPI (Quy đổi từ {formatVnNumber(kpiPercentage)}% — tối đa 70)
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatVnNumber(kpiPillarScore)} / 70 điểm
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (kpiPillarScore / 70) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Criteria A/B/C/D mini breakdown from Video 2 */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-3">
              CHI TIẾT 4 TIÊU CHÍ CHẤM ĐIỂM ĐẦU VIỆC (THEO HƯỚNG DẪN 02)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">A. Số lượng sản phẩm</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatVnNumber(criteriaBreakdown.avgA)} / 1,00
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">B. Chất lượng sản phẩm</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatVnNumber(criteriaBreakdown.avgB)} / 1,00
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">C. Tiến độ hoàn thành</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatVnNumber(criteriaBreakdown.avgC)} / 1,00
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">D. Năng lực điều hành</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatVnNumber(criteriaBreakdown.avgD)} / 1,00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Circular Gauge Suggested Classification */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 flex flex-col items-center justify-between text-center">
          <div>
            <div className="text-xs font-semibold text-[#7A1C24]">ĐIỂM GỢI Ý</div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Đề xuất xếp loại cuối năm</h3>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="transparent"
                stroke="#7A1C24"
                strokeWidth="10"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {formatVnNumber(totalScore)}
              </span>
              <span className="text-[11px] text-slate-500">trên 100đ</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="text-sm font-bold text-[#7A1C24]">{suggestedLevel}</div>
            <p className="text-xs text-slate-500">
              Căn cứ tổng hợp 4 Quý & Bản kiểm điểm Mẫu {profile.templateType}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('forms')}
              className="w-full mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
            >
              Trình ký & Xuất Mẫu {profile.templateType}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Performance Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 4-Quarter Performance Trend */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-[#7A1C24] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                BIỂU ĐỒ HIỆU SUẤT THEO THỜI GIAN THỰC
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Diễn biến điểm KPI & Tổng điểm qua 4 Quý năm 2026
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">Đơn vị: Điểm (0-100)</span>
          </div>

          <div className="mt-4 pt-2">
            <div className="grid grid-cols-4 gap-4 items-end h-48 pt-6 px-3 border-b border-slate-200">
              {quarterSummaryList.map((q) => {
                const scoreHeight = Math.max(15, Math.min(100, q.score));
                const kpiHeight = Math.max(15, Math.min(100, q.kpiPercent));
                return (
                  <div key={q.quarter} className="flex flex-col items-center h-full justify-end">
                    <div className="text-xs font-mono font-bold text-slate-800 mb-1.5 tabular-nums">
                      {formatVnNumber(q.score)}đ
                    </div>
                    <div className="w-full flex items-end justify-center gap-2 h-32">
                      <div
                        className="w-6 bg-[#7A1C24] rounded-t-md transition-all duration-300"
                        style={{ height: `${scoreHeight}%` }}
                        title={`Tổng điểm ${q.quarter}: ${formatVnNumber(q.score)}`}
                      />
                      <div
                        className="w-6 bg-amber-500 rounded-t-md transition-all duration-300"
                        style={{ height: `${kpiHeight}%` }}
                        title={`Tỷ lệ KPI ${q.quarter}: ${formatVnNumber(q.kpiPercent)}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-4 pt-3 text-center">
              {quarterSummaryList.map((q) => (
                <div key={q.quarter}>
                  <div className="text-xs font-bold text-slate-900">{q.quarter}/2026</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {q.classification.replace(' nhiệm vụ', '')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#7A1C24] inline-block" />
                <span>Tổng điểm đánh giá (Thang 100)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                <span>Tỷ lệ hoàn thành KPI (%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Agency Department Comparison */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-[#7A1C24] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                THỐNG KÊ TOÀN CƠ QUAN
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                So sánh hiệu suất KPI & Tiến độ giữa các đơn vị
              </h3>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 mt-4">
            {DEPARTMENT_PERFORMANCE_ANALYTICS.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{dept.department}</span>
                  <div className="flex items-center gap-2 text-slate-600 font-mono tabular-nums">
                    <span>KPI: {formatVnNumber(dept.avgKpiPercent, 1)}%</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-slate-900">
                      ĐTB: {formatVnNumber(dept.avgTotalScore, 1)}đ
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1C24] h-full rounded-full"
                    style={{ width: `${Math.min(100, dept.avgKpiPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Biên chế: {dept.totalStaff} cán bộ</span>
                  <span>
                    Xuất sắc: {dept.excellentCount} · Tốt: {dept.goodCount} · Đúng hạn:{' '}
                    {formatVnNumber(dept.onTimeRate, 1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
