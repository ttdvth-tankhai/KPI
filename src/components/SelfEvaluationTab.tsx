import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Sparkles,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowRight,
  Target,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import {
  formatVnNumber,
  calculateGeneralCriteriaScore,
  type GeneralCriterion,
  type QuarterSummaryRecord,
  type SelfReviewContent,
  type UserProfile,
  type ClassificationLevel,
  type QuarterCode,
  type RemediationCommitmentItem,
  type CriterionRatingLevel,
} from '../utils/kpiEngine';
import { SELF_REVIEW_SUGGESTIONS } from '../data/mockKpiData';

interface SelfEvaluationTabProps {
  profile: UserProfile;
  generalCriteria: GeneralCriterion[];
  onUpdateCriterion: (updated: GeneralCriterion) => void;
  quarterRecords: QuarterSummaryRecord[];
  onUpdateQuarterRecord: (updated: QuarterSummaryRecord) => void;
  q4AutoScore: number;
  q4AutoKpiPercent: number;
  q4AutoClassification: ClassificationLevel;
  yearSummary: {
    averageScore: number;
    averageKpiPercent: number;
    excellentQuartersCount: number;
    goodQuartersCount: number;
    completedQuartersCount: number;
    failedQuartersCount: number;
    suggestedYearClassification: ClassificationLevel;
  };
  generalScore: number;
  kpiPillarScore: number;
  totalScore: number;
  selfReview: SelfReviewContent;
  onUpdateSelfReview: (updated: SelfReviewContent) => void;
  remediationPlan: RemediationCommitmentItem[];
  onUpdateRemediationPlan: (updated: RemediationCommitmentItem[]) => void;
  onProceedToForms: () => void;
  unscoredTasksCount?: number;
  onOpenSectorModal?: (tab: 'sector' | 'guide') => void;
}

const CLASSIFICATION_OPTIONS: ClassificationLevel[] = [
  'Hoàn thành xuất sắc nhiệm vụ',
  'Hoàn thành tốt nhiệm vụ',
  'Hoàn thành nhiệm vụ',
  'Không hoàn thành nhiệm vụ',
];

export const SelfEvaluationTab: React.FC<SelfEvaluationTabProps> = ({
  profile,
  generalCriteria,
  onUpdateCriterion,
  quarterRecords,
  onUpdateQuarterRecord,
  q4AutoScore,
  q4AutoKpiPercent,
  q4AutoClassification,
  yearSummary,
  generalScore,
  kpiPillarScore,
  totalScore,
  selfReview,
  onUpdateSelfReview,
  remediationPlan,
  onUpdateRemediationPlan,
  onProceedToForms,
  unscoredTasksCount = 0,
  onOpenSectorModal,
}) => {
  const [showQuickQuarterInput, setShowQuickQuarterInput] = useState(true);
  const [savedNotice, setSavedNotice] = useState('');
  const [newLimitationText, setNewLimitationText] = useState('');
  const [newActionPlan2027, setNewActionPlan2027] = useState('');
  const [newTargetQuarter, setNewTargetQuarter] =
    useState<RemediationCommitmentItem['targetQuarter2027']>('Quý I/2027');
  const [openGuideIds, setOpenGuideIds] = useState<Record<string, boolean>>({
    'GC-1': true,
  });

  const isPublicService = profile.governanceType === 'public_service_center';
  const generalDetail = calculateGeneralCriteriaScore(generalCriteria, 30);

  const toggleCriterionGuide = (id: string) => {
    setOpenGuideIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectRatingLevel = (
    item: GeneralCriterion,
    level: CriterionRatingLevel
  ) => {
    if (level === 'KPH') {
      onUpdateCriterion({
        ...item,
        ratingLevel: 'KPH',
        passed: true,
        selfScore: 0,
        appraisedScore: 0,
        note: 'KPH — Không phát sinh / Không thuộc nhiệm vụ (Không tính vào mẫu số)',
      });
      return;
    }

    const numericRatio = Number(level);
    const computedScore = Math.round(item.maxScore * numericRatio * 100) / 100;
    onUpdateCriterion({
      ...item,
      ratingLevel: level,
      passed: numericRatio > 0,
      selfScore: computedScore,
      appraisedScore: computedScore,
    });
  };

  const handleQuarterManualChange = (
    quarter: QuarterCode,
    field: 'manualScore' | 'manualKpiPercent' | 'manualClassification',
    value: number | ClassificationLevel
  ) => {
    const existing = quarterRecords.find((r) => r.quarter === quarter);
    if (!existing) return;
    onUpdateQuarterRecord({
      ...existing,
      mode: 'manual',
      [field]: value,
    });
  };

  const handleAutoGenerateReason = () => {
    const reasonText = `Đạt tổng điểm đánh giá Quý IV là ${formatVnNumber(
      totalScore
    )}/100 điểm (Điểm tiêu chí chung: ${formatVnNumber(
      generalScore
    )}/30 điểm; Điểm KPI thực hiện nhiệm vụ: ${formatVnNumber(
      kpiPillarScore
    )}/70 điểm, tương ứng tỷ lệ hoàn thành ${formatVnNumber(
      q4AutoKpiPercent
    )}%). Điểm trung bình cả năm 4 quý đạt ${formatVnNumber(
      yearSummary.averageScore
    )}/100 điểm (${yearSummary.excellentQuartersCount} quý Hoàn thành xuất sắc, ${
      yearSummary.goodQuartersCount
    } quý Hoàn thành tốt). Đủ điều kiện đề xuất xếp loại: ${selfReview.proposedLevel}.`;

    onUpdateSelfReview({
      ...selfReview,
      classificationReason: reasonText,
    });
  };

  const handleSaveEvaluation = () => {
    setSavedNotice(
      `Đã lưu và đồng bộ toàn bộ điểm số, nội dung tự kiểm điểm và ${remediationPlan.length} cam kết khắc phục năm 2027 sang Bản kiểm điểm Mẫu ${profile.templateType}.`
    );
    setTimeout(() => setSavedNotice(''), 3500);
  };

  const handleExtractLimitationTo2027 = () => {
    const extractedItem: RemediationCommitmentItem = {
      id: `REM-2027-0${remediationPlan.length + 1}`,
      limitationGroup: 'Chuyên môn & Tiến độ KPI',
      limitationDescription:
        selfReview.limitations.slice(0, 160) ||
        'Rà soát tiến độ phối hợp liên thông và nâng cao chất lượng thẩm định văn bản lần đầu.',
      actionPlan2027:
        selfReview.futureDirections.slice(0, 160) ||
        'Thực hiện kiểm soát tiến độ hàng tuần trên hệ thống e-KPI TÂN KHAI và hoàn thành 100% trước hạn.',
      targetQuarter2027: 'Quý I/2027',
      supervisor: `${profile.partyBranch} & Lãnh đạo đơn vị`,
      status: 'cam_ket',
    };
    onUpdateRemediationPlan([...remediationPlan, extractedItem]);
    setSavedNotice('Đã trích xuất nội dung hạn chế năm 2026 sang Bảng cam kết khắc phục năm 2027.');
    setTimeout(() => setSavedNotice(''), 3500);
  };

  const handleAddRemediationItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimitationText.trim() || !newActionPlan2027.trim()) return;
    const item: RemediationCommitmentItem = {
      id: `REM-2027-0${remediationPlan.length + 1}`,
      limitationGroup: 'Chuyên môn & Tiến độ KPI',
      limitationDescription: newLimitationText.trim(),
      actionPlan2027: newActionPlan2027.trim(),
      targetQuarter2027: newTargetQuarter,
      supervisor: `${profile.partyBranch}`,
      status: 'cam_ket',
    };
    onUpdateRemediationPlan([...remediationPlan, item]);
    setNewLimitationText('');
    setNewActionPlan2027('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tự đánh giá KPI, Kiểm điểm cuối năm & Cam kết khắc phục 2027
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tự tổng hợp kết quả 4 quý, rà soát 30 điểm tiêu chí chung (Quy định 366) và lập kế hoạch khắc phục hạn chế năm 2027
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveEvaluation}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu bản tự đánh giá
          </button>
          <button
            type="button"
            onClick={onProceedToForms}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
          >
            Xem & Xuất Mẫu {profile.templateType}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sticky Live Evaluation Progress Bar (Inspired by Video 3: Tự đánh giá: A = .../30 · B = .../70 · Tổng = .../100 — còn X ô) */}
      <div
        data-testid="sticky-eval-summary-bar"
        className="sticky top-2 z-20 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-[#7A1C24] text-amber-200 font-extrabold">
            {isPublicService
              ? 'Khối Đơn vị Sự nghiệp công lập (Chấm 6 mức có KPH)'
              : profile.governanceType === 'state_admin'
              ? 'Khối Hành chính Nhà nước (NĐ 90 & Hướng dẫn 02)'
              : 'Khối Đảng - Đoàn thể (Quy định 366-QĐ/TW)'}
          </span>
          <div className="font-mono font-bold flex flex-wrap items-center gap-2">
            <span>
              Tự đánh giá: <strong className="text-amber-300">A = {formatVnNumber(generalScore)}/30</strong>
            </span>
            <span className="text-slate-400">·</span>
            <span>
              <strong className="text-emerald-300">B = {formatVnNumber(kpiPillarScore)}/70</strong>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sm">
              Tổng = <strong className="text-white underline decoration-amber-400">{formatVnNumber(totalScore)}/100</strong>
            </span>
          </div>
          {generalDetail.kphCount > 0 && (
            <span
              data-testid="kph-normalized-badge"
              className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-semibold"
            >
              Đã loại {generalDetail.kphCount} tiêu chí KPH khỏi mẫu số ({formatVnNumber(generalDetail.rawSelfTotal)}/{formatVnNumber(generalDetail.activeMaxTotal)} → Tự quy về thang 30)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {unscoredTasksCount > 0 ? (
            <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-extrabold">
              Còn {unscoredTasksCount} ô công việc chưa chấm
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấm đủ toàn bộ ({generalCriteria.length} tiêu chí A + 100% đầu việc B)
            </span>
          )}
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): 4-Quarter Summary + 30-Point General Criteria + 2027 Remediation Plan */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Tự tổng hợp 4 Quý + Ô nhập bổ sung nhanh Quý 1, 2, 3 */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#7A1C24] flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5" />
                  TỔNG HỢP ĐIỂM CẢ NĂM LINH HOẠT (THEO CÔNG VĂN 2772 & QUY ĐỊNH 227)
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Tổng hợp kết quả 4 Quý năm 2026 & Nhập bổ sung nhanh Quý I, II, III
                </h2>
              </div>
            </div>

            {/* 4 Quarters Summary Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Kỳ đánh giá</th>
                    <th className="py-2.5 px-3 text-right">Điểm tổng (100)</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ KPI (%)</th>
                    <th className="py-2.5 px-3">Mức xếp loại quý</th>
                    <th className="py-2.5 px-3 text-right">Nguồn dữ liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {quarterRecords.map((rec) => {
                    const isQ4 = rec.quarter === 'Q4';
                    const score = isQ4 ? q4AutoScore : rec.manualScore;
                    const kpiPct = isQ4 ? q4AutoKpiPercent : rec.manualKpiPercent;
                    const level = isQ4 ? q4AutoClassification : rec.manualClassification;

                    return (
                      <tr key={rec.quarter} className={isQ4 ? 'bg-rose-50/35 font-semibold' : ''}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Quý {rec.quarter.replace('Q', '')} / 2026
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatVnNumber(score)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {formatVnNumber(kpiPct)}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">{level}</td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-slate-500">
                          {isQ4 ? 'Tự động từ Bảng KPI' : 'Nhập bổ sung / Lưu trữ'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 border-t border-slate-200 font-bold text-slate-900">
                    <td className="py-3 px-3">Tổng hợp cả năm 2026</td>
                    <td
                      data-testid="year-average-score"
                      className="py-3 px-3 text-right font-mono text-sm text-[#7A1C24] tabular-nums"
                    >
                      {formatVnNumber(yearSummary.averageScore)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-slate-900 tabular-nums">
                      {formatVnNumber(yearSummary.averageKpiPercent)}%
                    </td>
                    <td className="py-3 px-3 text-[#7A1C24]" colSpan={2}>
                      {yearSummary.excellentQuartersCount} Quý Xuất sắc ·{' '}
                      {yearSummary.goodQuartersCount} Quý Tốt
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quick Supplemental Input for Q1, Q2, Q3 */}
            <div className="border border-rose-200/80 rounded-lg bg-rose-50/25 p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowQuickQuarterInput(!showQuickQuarterInput)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-[#7A1C24] cursor-pointer"
              >
                <span>
                  + Nhập bổ sung nhanh điểm Quý I, Quý II, Quý III (Dành cho đơn vị mới triển khai vào cuối năm)
                </span>
                {showQuickQuarterInput ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showQuickQuarterInput && (
                <div className="space-y-2.5 pt-2 border-t border-rose-200/60">
                  {quarterRecords
                    .filter((r) => r.quarter !== 'Q4')
                    .map((rec) => (
                      <div
                        key={rec.quarter}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="sm:col-span-2 font-bold text-slate-800">
                          Quý {rec.quarter.replace('Q', '')}/2026
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor={`q-score-${rec.quarter}`}
                            className="block text-[10px] text-slate-500"
                          >
                            Điểm đã có (Thang 100)
                          </label>
                          <input
                            id={`q-score-${rec.quarter}`}
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            value={rec.manualScore}
                            onChange={(e) =>
                              handleQuarterManualChange(
                                rec.quarter,
                                'manualScore',
                                Number(e.target.value)
                              )
                            }
                            className="w-full mt-0.5 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-slate-900 tabular-nums"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor={`q-kpi-${rec.quarter}`}
                            className="block text-[10px] text-slate-500"
                          >
                            Tỷ lệ % KPI
                          </label>
                          <input
                            id={`q-kpi-${rec.quarter}`}
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            value={rec.manualKpiPercent}
                            onChange={(e) =>
                              handleQuarterManualChange(
                                rec.quarter,
                                'manualKpiPercent',
                                Number(e.target.value)
                              )
                            }
                            className="w-full mt-0.5 px-2 py-1 border border-slate-300 rounded font-mono text-slate-800 tabular-nums"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label
                            htmlFor={`q-level-${rec.quarter}`}
                            className="block text-[10px] text-slate-500"
                          >
                            Mức xếp loại Quý {rec.quarter.replace('Q', '')}
                          </label>
                          <select
                            id={`q-level-${rec.quarter}`}
                            value={rec.manualClassification}
                            onChange={(e) =>
                              handleQuarterManualChange(
                                rec.quarter,
                                'manualClassification',
                                e.target.value as ClassificationLevel
                              )
                            }
                            className="w-full mt-0.5 px-2 py-1 border border-slate-300 rounded text-slate-800"
                          >
                            {CLASSIFICATION_OPTIONS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Rà soát tiêu chí chung (30 điểm - Quy định 366-QĐ/TW & Quy chế Đơn vị Sự nghiệp công lập) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#7A1C24]">
                  {isPublicService
                    ? 'I. NHÓM TIÊU CHÍ CHUNG (TỐI ĐA 30 ĐIỂM — QUY CHẾ ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP · CHẤM 6 MỨC & KPH)'
                    : 'I. NHÓM TIÊU CHÍ CHUNG (TỐI ĐA 30 ĐIỂM — THEO QUY ĐỊNH 366-QĐ/TW & HƯỚNG DẪN 02)'}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Rà soát phẩm chất chính trị, đạo đức, lối sống, tác phong và kỷ luật
                </h2>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-500">Điểm A tự tính: </span>
                <span
                  data-testid="general-criteria-score"
                  className="text-base font-extrabold text-[#7A1C24] tabular-nums"
                >
                  {formatVnNumber(generalScore)} / 30,00
                </span>
              </div>
            </div>

            {/* Banner explaining the active sector's scoring rule */}
            <div
              className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
                isPublicService
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/50 border-rose-200 text-slate-800'
              }`}
            >
              <div>
                {isPublicService ? (
                  <span>
                    <strong>Chế độ Đơn vị Sự nghiệp công lập:</strong> Chạm 1 mức{' '}
                    <code className="font-bold">1 · 0,75 · 0,5 · 0,25 · 0 · KPH</code>. Tiêu chí không thuộc nhiệm vụ chọn{' '}
                    <strong className="text-emerald-800">KPH (Không phát sinh)</strong> — không trừ điểm, không tính vào mẫu số, tự quy về thang 30.
                  </span>
                ) : (
                  <span>
                    <strong>Chế độ Chuẩn Quy định 366-QĐ/TW & Hướng dẫn 02:</strong> Đánh giá theo chuẩn{' '}
                    <strong className="text-[#7A1C24]">Đảm bảo (Tối đa) / Không đảm bảo (0đ)</strong> để khớp 100% với mẫu biểu Trung ương.
                  </span>
                )}
              </div>
              {onOpenSectorModal && (
                <button
                  type="button"
                  onClick={() => onOpenSectorModal('sector')}
                  className="text-[11px] font-extrabold text-[#7A1C24] underline hover:text-slate-900 cursor-pointer shrink-0"
                >
                  Đổi sang {isPublicService ? 'Khối Đảng / Nhà nước' : 'Khối Đơn vị Sự nghiệp (có nút KPH)'} →
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {generalCriteria.map((item) => {
                const isGuideOpen = !!openGuideIds[item.id];
                const isKph = item.ratingLevel === 'KPH';
                const currentRatio: CriterionRatingLevel = isKph
                  ? 'KPH'
                  : !item.passed || item.selfScore === 0
                  ? 0
                  : item.ratingLevel ??
                    (Math.abs(item.selfScore - item.maxScore) < 0.01
                      ? 1
                      : Math.abs(item.selfScore - item.maxScore * 0.75) < 0.26
                      ? 0.75
                      : Math.abs(item.selfScore - item.maxScore * 0.5) < 0.26
                      ? 0.5
                      : 0.25);

                const levelLabelMap: Record<string, string> = {
                  '1': 'Đạt đầy đủ (100%)',
                  '0.75': 'Cơ bản đạt (75%)',
                  '0.5': 'Đạt một phần (50%)',
                  '0.25': 'Còn hạn chế (25%)',
                  '0': 'Không đạt / Vi phạm (0 điểm — vẫn tính vào mẫu số)',
                  KPH: 'KPH: Không phát sinh / Không thuộc nhiệm vụ — Không trừ điểm, không đưa vào mẫu số',
                };

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-[#7A1C24]">{item.group}</span>
                        {item.legalCitation && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
                            {item.legalCitation}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`toggle-guide-${item.code}`}
                          onClick={() => toggleCriterionGuide(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
                        >
                          <Info className="w-3 h-3 text-amber-700" />
                          <span>Cách chấm</span>
                        </button>
                        <span className="text-[11px] text-slate-500">
                          Tối đa:{' '}
                          <strong className="font-mono text-slate-900">
                            {formatVnNumber(item.maxScore)}đ
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-900 font-medium leading-relaxed">
                      <strong className="font-mono text-[#7A1C24]">{item.code}</strong> {item.title}
                    </div>

                    {/* Expandable ⓘ Cách chấm Box (From Video 3) */}
                    {isGuideOpen && (
                      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/90 text-[11px] text-slate-700 space-y-1">
                        <div className="font-bold text-amber-950">
                          Nội dung đánh giá & Hướng dẫn chấm tiêu chí {item.code}:
                        </div>
                        <p className="leading-relaxed">
                          {item.scoringGuide ||
                            'Đánh giá mức độ chấp hành và kết quả thực hiện thực tế trong kỳ dựa trên hồ sơ minh chứng.'}
                        </p>
                        {isPublicService && (
                          <p className="text-emerald-900 font-semibold pt-1">
                            • Lưu ý KPH: Nếu tiêu chí này không phát sinh hoặc không thuộc nhiệm vụ được phân công theo Quy chế Đơn vị sự nghiệp, hãy chọn nút KPH (không trừ điểm, không đưa vào mẫu số).
                          </p>
                        )}
                      </div>
                    )}

                    {/* Scoring Controls: 6-level 1-touch buttons for Public Service Units OR Standard QĐ 366 + Quick buttons */}
                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(isPublicService
                            ? ([1, 0.75, 0.5, 0.25, 0, 'KPH'] as CriterionRatingLevel[])
                            : ([1, 0.75, 0.5, 0] as CriterionRatingLevel[])
                          ).map((lvl) => {
                            const isSelected = String(currentRatio) === String(lvl);
                            const labelText =
                              lvl === 'KPH'
                                ? 'KPH'
                                : lvl === 1
                                ? '1 (Đảm bảo)'
                                : String(lvl).replace('.', ',');

                            return (
                              <button
                                key={String(lvl)}
                                type="button"
                                data-testid={`crit-lvl-${item.code}-${String(lvl)}`}
                                onClick={() => handleSelectRatingLevel(item, lvl)}
                                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-extrabold border transition-all cursor-pointer ${
                                  isSelected
                                    ? lvl === 'KPH'
                                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                                      : lvl === 0
                                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                      : 'bg-[#7A1C24] text-white border-[#7A1C24] shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {labelText}
                              </button>
                            );
                          })}
                        </div>

                        {/* Live Level Name & Formula Calculation underneath (Video 3 pattern) */}
                        <div className="text-[11px] font-semibold">
                          {isKph ? (
                            <span className="text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              {levelLabelMap.KPH}
                            </span>
                          ) : (
                            <span
                              className={
                                item.passed && item.selfScore > 0
                                  ? 'text-emerald-800'
                                  : 'text-red-700'
                              }
                            >
                              {levelLabelMap[String(currentRatio)] || 'Đạt yêu cầu'} →{' '}
                              <strong className="font-mono">
                                {formatVnNumber(item.passed ? item.selfScore : 0)} điểm
                              </strong>{' '}
                              <span className="text-slate-500 font-normal">
                                (Tối đa {formatVnNumber(item.maxScore)}đ)
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Manual fine-tune score & evidence note */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        {!isKph && (
                          <div className="flex items-center gap-1.5">
                            <label
                              htmlFor={`crit-score-${item.id}`}
                              className="text-[11px] text-slate-500 whitespace-nowrap"
                            >
                              Điểm:
                            </label>
                            <input
                              id={`crit-score-${item.id}`}
                              type="number"
                              step="0.25"
                              min={0}
                              max={item.maxScore}
                              disabled={!item.passed}
                              value={item.passed ? item.selfScore : 0}
                              onChange={(e) =>
                                onUpdateCriterion({
                                  ...item,
                                  selfScore: Math.min(
                                    item.maxScore,
                                    Math.max(0, Number(e.target.value))
                                  ),
                                })
                              }
                              className="w-16 px-2 py-1 text-right font-mono font-bold text-slate-900 border border-slate-300 rounded focus:outline-none focus:border-[#7A1C24] tabular-nums"
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          aria-label={`Ghi chú tiêu chí ${item.code}`}
                          value={item.note}
                          onChange={(e) =>
                            onUpdateCriterion({
                              ...item,
                              note: e.target.value,
                            })
                          }
                          placeholder="Ghi chú minh chứng..."
                          className="w-full sm:w-44 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-none focus:bg-white focus:border-[#7A1C24]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Bảng theo dõi cam kết khắc phục hạn chế đầu năm 2027 (Feature Group 4) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#7A1C24] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  KẾ HOẠCH KHẮC PHỤC HẠN CHẾ, KHUYẾT ĐIỂM SAU KIỂM ĐIỂM (CHUYỂN TIẾP NĂM 2027)
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Bảng cam kết lộ trình khắc phục hạn chế năm 2026 sang Quý I – Quý IV/2027
                </h2>
              </div>
              <button
                type="button"
                onClick={handleExtractLimitationTo2027}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Trích xuất tự động từ Mục Hạn chế
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="py-2.5 px-3">Hạn chế đã chỉ ra năm 2026</th>
                    <th className="py-2.5 px-3">Giải pháp & Cam kết khắc phục năm 2027</th>
                    <th className="py-2.5 px-3 text-center">Thời hạn</th>
                    <th className="py-2.5 px-3 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {remediationPlan.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 text-slate-800">{item.limitationDescription}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.actionPlan2027}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#7A1C24]">
                        {item.targetQuarter2027}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          aria-label={`Xóa cam kết ${item.id}`}
                          onClick={() =>
                            onUpdateRemediationPlan(
                              remediationPlan.filter((r) => r.id !== item.id)
                            )
                          }
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form
              onSubmit={handleAddRemediationItem}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  aria-label="Nội dung hạn chế cần khắc phục"
                  value={newLimitationText}
                  onChange={(e) => setNewLimitationText(e.target.value)}
                  placeholder="Nội dung hạn chế cần khắc phục..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  aria-label="Giải pháp khắc phục cụ thể năm 2027"
                  value={newActionPlan2027}
                  onChange={(e) => setNewActionPlan2027(e.target.value)}
                  placeholder="Giải pháp cụ thể năm 2027..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  aria-label="Quý hoàn thành khắc phục 2027"
                  value={newTargetQuarter}
                  onChange={(e) =>
                    setNewTargetQuarter(
                      e.target.value as RemediationCommitmentItem['targetQuarter2027']
                    )
                  }
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-mono"
                >
                  <option value="Quý I/2027">Quý I/2027</option>
                  <option value="Quý II/2027">Quý II/2027</option>
                  <option value="Quý III/2027">Quý III/2027</option>
                  <option value="Quý IV/2027">Quý IV/2027</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-1.5 px-2.5 font-bold text-white bg-[#7A1C24] rounded hover:bg-[#61151C] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Sticky Classification & Self-Review Builder */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          {/* Score & Classification Box */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#7A1C24]">KẾT QUẢ & ĐỀ XUẤT XẾP LOẠI</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Tự động đồng bộ sang Bản kiểm điểm Mẫu {profile.templateType}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-[#7A1C24] tabular-nums">
                  {formatVnNumber(totalScore)} / 100
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  KPI: {formatVnNumber(kpiPillarScore)}/70 · Chung: {formatVnNumber(generalScore)}/30
                </div>
              </div>
            </div>

            {/* Suggested classification banner */}
            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Gợi ý xếp loại tự động:</span>
                <span className="font-bold text-[#7A1C24]">
                  {yearSummary.suggestedYearClassification}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfReview.hasBreakthroughProduct}
                    onChange={(e) =>
                      onUpdateSelfReview({
                        ...selfReview,
                        hasBreakthroughProduct: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#7A1C24] focus:ring-[#7A1C24]"
                  />
                  <span>Có sản phẩm đột phá / sáng kiến cải cách (Điều kiện Xuất sắc)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfReview.noDisciplinaryViolation}
                    onChange={(e) =>
                      onUpdateSelfReview({
                        ...selfReview,
                        noDisciplinaryViolation: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#7A1C24] focus:ring-[#7A1C24]"
                  />
                  <span>Không vi phạm kỷ luật, không suy thoái tư tưởng chính trị</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="proposed-classification-select"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Cán bộ tự nhận mức xếp loại cuối năm (Mục B - Mẫu {profile.templateType})
              </label>
              <select
                id="proposed-classification-select"
                value={selfReview.proposedLevel}
                onChange={(e) =>
                  onUpdateSelfReview({
                    ...selfReview,
                    proposedLevel: e.target.value as ClassificationLevel,
                  })
                }
                className="w-full px-3 py-2 text-xs font-bold text-[#7A1C24] bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              >
                {CLASSIFICATION_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Self-Critique Content Builder */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#7A1C24] flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  NỘI DUNG TỰ KIỂM ĐIỂM (MẪU {profile.templateType})
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Điền nhanh ưu điểm, hạn chế theo gợi ý chuẩn
                </h3>
              </div>
            </div>

            {/* Section 1: Ưu điểm, kết quả đạt được */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="review-advantages" className="font-bold text-slate-800">
                  1. Ưu điểm, kết quả đạt được
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSelfReview({
                      ...selfReview,
                      advantages:
                        selfReview.advantages +
                        ' ' +
                        SELF_REVIEW_SUGGESTIONS.advantages[0],
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A1C24] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  + Chèn gợi ý chuẩn
                </button>
              </div>
              <textarea
                id="review-advantages"
                rows={4}
                value={selfReview.advantages}
                onChange={(e) =>
                  onUpdateSelfReview({ ...selfReview, advantages: e.target.value })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] leading-relaxed"
              />
            </div>

            {/* Section 2: Hạn chế, khuyết điểm và nguyên nhân */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="review-limitations" className="font-bold text-slate-800">
                  2. Hạn chế, khuyết điểm và nguyên nhân
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSelfReview({
                      ...selfReview,
                      limitations: SELF_REVIEW_SUGGESTIONS.limitations[0],
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A1C24] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  + Chèn câu mẫu hạn chế
                </button>
              </div>
              <textarea
                id="review-limitations"
                rows={3}
                value={selfReview.limitations}
                onChange={(e) =>
                  onUpdateSelfReview({ ...selfReview, limitations: e.target.value })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] leading-relaxed"
              />
            </div>

            {/* Section 3: Kết quả khắc phục hạn chế */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="review-remediation" className="block font-bold text-slate-800">
                3. Kết quả khắc phục những hạn chế, khuyết điểm đã được chỉ ra
              </label>
              <textarea
                id="review-remediation"
                rows={2}
                value={selfReview.remediationResults}
                onChange={(e) =>
                  onUpdateSelfReview({ ...selfReview, remediationResults: e.target.value })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] leading-relaxed"
              />
            </div>

            {/* Section 4: Phương hướng khắc phục */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="review-future" className="block font-bold text-slate-800">
                4. Phương hướng, biện pháp khắc phục và phát huy
              </label>
              <textarea
                id="review-future"
                rows={2}
                value={selfReview.futureDirections}
                onChange={(e) =>
                  onUpdateSelfReview({ ...selfReview, futureDirections: e.target.value })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] leading-relaxed"
              />
            </div>

            {/* Section 5: Lý do đề xuất mức xếp loại */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="review-reason" className="font-bold text-slate-800">
                  5. Lý do đề xuất mức xếp loại cuối năm
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateReason}
                  className="text-[11px] font-semibold text-[#7A1C24] hover:underline cursor-pointer"
                >
                  Tự động tổng hợp từ điểm số
                </button>
              </div>
              <textarea
                id="review-reason"
                rows={3}
                value={selfReview.classificationReason}
                onChange={(e) =>
                  onUpdateSelfReview({
                    ...selfReview,
                    classificationReason: e.target.value,
                  })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={onProceedToForms}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đồng bộ & Mở trang In / Xuất Mẫu {profile.templateType}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
