import React, { useState } from 'react';
import {
  Award,
  Vote,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Printer,
  ThumbsUp,
} from 'lucide-react';
import {
  calculateExcellenceQuota,
  evaluateEmulationTitles,
  formatVnNumber,
  type ApprovalRecord,
  type CollectiveVoteRecord,
} from '../utils/kpiEngine';

interface CollectiveEmulationTabProps {
  approvals: ApprovalRecord[];
  onUpdateApproval: (updated: ApprovalRecord) => void;
  onBatchUpdateApprovals: (updatedList: ApprovalRecord[]) => void;
  collectiveVotes: CollectiveVoteRecord[];
  onUpdateVoteRecord: (updated: CollectiveVoteRecord) => void;
  onOpenFormPreview: (docId: 'mau01' | 'minutes') => void;
}

export const CollectiveEmulationTab: React.FC<CollectiveEmulationTabProps> = ({
  approvals,
  onUpdateApproval,
  onBatchUpdateApprovals,
  collectiveVotes,
  onUpdateVoteRecord,
  onOpenFormPreview,
}) => {
  const [quotaCapPercent, setQuotaCapPercent] = useState<20 | 25>(20);
  const [activeSubTab, setActiveSubTab] = useState<'quota' | 'voting' | 'emulation'>('quota');
  const [feedbackBanner, setFeedbackBanner] = useState('');
  const [showEmulationReportModal, setShowEmulationReportModal] = useState(false);

  const quotaStats = calculateExcellenceQuota(approvals, quotaCapPercent);
  const emulationStats = evaluateEmulationTitles(approvals);

  const showNotice = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(''), 4000);
  };

  // Auto-balance approvals so only the top N candidates within the 20% quota get "Hoàn thành xuất sắc nhiệm vụ"
  const handleAutoBalanceQuota = () => {
    const allowedIds = new Set(
      quotaStats.rankedCandidates
        .filter((c) => c.withinQuotaRank)
        .map((c) => c.id)
    );

    const balanced = approvals.map((rec) => {
      if (allowedIds.has(rec.id)) {
        return {
          ...rec,
          approvedClassification: 'Hoàn thành xuất sắc nhiệm vụ' as const,
        };
      }
      if (rec.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ') {
        return {
          ...rec,
          approvedClassification: 'Hoàn thành tốt nhiệm vụ' as const,
          directorComment:
            'Điểm KPI đạt mức cao, điều chỉnh về Hoàn thành tốt nhiệm vụ để đảm bảo tỷ lệ khống chế ≤ 20% Xuất sắc theo Quy định 366-QĐ/TW.',
        };
      }
      return rec;
    });

    onBatchUpdateApprovals(balanced);
    showNotice(
      `Đã tự động cân đối danh sách xếp loại theo đúng hạn ngạch ${quotaCapPercent}% (Tối đa ${quotaStats.maxAllowedExcellent} suất Hoàn thành xuất sắc nhiệm vụ).`
    );
  };

  const handleCastVote = (voteRec: CollectiveVoteRecord, voteType: 'excellent' | 'good') => {
    const updated: CollectiveVoteRecord = {
      ...voteRec,
      totalVoters: voteRec.totalVoters + 1,
      votesExcellent:
        voteType === 'excellent' ? voteRec.votesExcellent + 1 : voteRec.votesExcellent,
      votesGood: voteType === 'good' ? voteRec.votesGood + 1 : voteRec.votesGood,
      userVoted: true,
    };
    onUpdateVoteRecord(updated);
    showNotice(
      `Đã ghi nhận phiếu biểu quyết tín nhiệm cho đồng chí ${voteRec.fullName} vào Biên bản họp Chi bộ.`
    );
  };

  const handleToggleInitiative = (rec: ApprovalRecord) => {
    const nextState = !rec.hasRecognizedInitiative;
    onUpdateApproval({
      ...rec,
      hasRecognizedInitiative: nextState,
      initiativeTitle: nextState
        ? rec.initiativeTitle ||
          `Sáng kiến cải cách hành chính & chuyển đổi số năm 2026 của ${rec.fullName} (Đã nghiệm thu cấp cơ sở)`
        : '',
    });
    showNotice(
      `Đã cập nhật trạng thái Sáng kiến cấp cơ sở cho đồng chí ${rec.fullName} để xét danh hiệu Chiến sĩ thi đua.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Họp Chi bộ, Kiểm soát Tỷ lệ 20% Xuất sắc & Xét Thi đua - Khen thưởng
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Thực hiện Quy định 366-QĐ/TW về khống chế tỷ lệ Xuất sắc ≤ 20%, bỏ phiếu tín nhiệm tập thể và xét danh hiệu Chiến sĩ thi đua cơ sở
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenFormPreview('mau01')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#7A1C24]" />
            Xuất Mẫu 01 (Kiểm điểm Tập thể)
          </button>
          <button
            type="button"
            onClick={() => onOpenFormPreview('minutes')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Vote className="w-3.5 h-3.5 text-[#7A1C24]" />
            Xuất Biên bản Họp & Kiểm phiếu
          </button>
          <button
            type="button"
            onClick={() => setShowEmulationReportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            In Tờ trình Thi đua - Khen thưởng
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div
          data-testid="collective-feedback-banner"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 20% Quota Control */}
        <div
          className={`rounded-xl p-5 border flex flex-col justify-between ${
            quotaStats.isExceeded
              ? 'bg-red-50/60 border-red-300'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Tỷ lệ Hoàn thành xuất sắc (Khống chế ≤ {quotaCapPercent}%)
            </span>
            <Scale className="w-4 h-4 text-[#7A1C24]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              data-testid="quota-current-vs-max"
              className={`text-3xl font-extrabold font-mono tabular-nums ${
                quotaStats.isExceeded ? 'text-red-700' : 'text-slate-900'
              }`}
            >
              {quotaStats.currentExcellentCount} / {quotaStats.maxAllowedExcellent}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              suất ({formatVnNumber(quotaStats.currentExcellentPercent, 1)}% trên{' '}
              {quotaStats.goodOrBetterCount} CB Hoàn thành tốt)
            </span>
          </div>
          <div className="mt-2 text-xs">
            {quotaStats.isExceeded ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Vượt hạn ngạch {Math.abs(quotaStats.remainingSlots)} suất — Cần cân đối lại
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đảm bảo đúng tỷ lệ quy định tại Quy định 366-QĐ/TW
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Collective Meeting Voting */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Họp kiểm điểm & Bỏ phiếu tín nhiệm Chi bộ</span>
            <Vote className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {collectiveVotes.length}/{approvals.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              · 100% đã kiểm phiếu tín nhiệm
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tổng số đảng viên / cán bộ dự họp biểu quyết: 12 đồng chí
          </div>
        </div>

        {/* Card 3: Emulation & Commendation Titles */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Đủ điều kiện xét Thi đua - Khen thưởng 2026</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span
                data-testid="emulation-cstd-count"
                className="text-3xl font-extrabold font-mono text-[#7A1C24] tabular-nums"
              >
                {emulationStats.cstdCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 ml-1">CSTĐ cơ sở</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {emulationStats.ldttCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 ml-1">LĐ tiên tiến</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tự động đối chiếu điểm KPI ≥ 90đ và Sáng kiến cải cách hành chính
          </div>
        </div>
      </div>

      {/* Sub-navigation Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('quota')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'quota'
                ? 'bg-[#7A1C24] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            1. Kiểm soát Tỷ lệ 20% Xuất sắc (QĐ 366)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('voting')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'voting'
                ? 'bg-[#7A1C24] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            2. Bỏ phiếu Tín nhiệm Họp kiểm điểm
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('emulation')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'emulation'
                ? 'bg-[#7A1C24] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            3. Xét Danh hiệu Thi đua - Khen thưởng
          </button>
        </div>

        {activeSubTab === 'quota' && (
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="quota-limit-select" className="font-semibold text-slate-700">
              Khung tỷ lệ áp dụng cho đơn vị:
            </label>
            <select
              id="quota-limit-select"
              value={quotaCapPercent}
              onChange={(e) => setQuotaCapPercent(Number(e.target.value) as 20 | 25)}
              className="px-3 py-1.5 font-bold text-[#7A1C24] bg-white border border-slate-300 rounded-lg cursor-pointer"
            >
              <option value={20}>Tối đa 20% (Quy định chuẩn QĐ 366)</option>
              <option value={25}>Tối đa 25% (Đơn vị có thành tích đặc biệt xuất sắc)</option>
            </select>
            <button
              type="button"
              onClick={handleAutoBalanceQuota}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tự động cân đối đúng hạn ngạch {quotaCapPercent}%
            </button>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: 20% QUOTA LEADERBOARD */}
      {activeSubTab === 'quota' && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div>
              <strong className="text-slate-900">
                Bảng xếp hạng điểm KPI từ cao xuống thấp để xét duyệt hạn ngạch {quotaCapPercent}% Hoàn thành xuất sắc:
              </strong>
              <span className="text-slate-600 ml-2">
                (Số suất tối đa được phép duyệt: <strong>{quotaStats.maxAllowedExcellent} cán bộ</strong>)
              </span>
            </div>
            <span className="font-mono text-slate-600">
              Đang xếp Xuất sắc: {quotaStats.currentExcellentCount}/{quotaStats.maxAllowedExcellent}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 font-bold text-slate-600">
                  <th className="py-3 px-4 text-center w-16">Hạng</th>
                  <th className="py-3 px-4">Cán bộ / Chức vụ / Đơn vị</th>
                  <th className="py-3 px-3 text-center">Mẫu</th>
                  <th className="py-3 px-3 text-right">Điểm thẩm định</th>
                  <th className="py-3 px-3 text-center">Điều kiện Sáng kiến</th>
                  <th className="py-3 px-3">Khuyến nghị theo Hạn ngạch 20%</th>
                  <th className="py-3 px-4">Mức xếp loại phê duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {quotaStats.rankedCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-sm text-[#7A1C24]">
                      #{cand.rank}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cand.fullName}</div>
                      <div className="text-slate-600 mt-0.5">
                        {cand.position} · {cand.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                      Mẫu {cand.templateType}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatVnNumber(cand.appraisedTotalScore)}đ
                      </div>
                      <div className="text-[11px] text-slate-500">
                        KPI: {formatVnNumber(cand.kpiPercent)}%
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {cand.hasRecognizedInitiative ? (
                        <span className="text-emerald-700 font-bold">Có sáng kiến cơ sở</span>
                      ) : (
                        <span className="text-slate-500">Chưa có sáng kiến</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {cand.withinQuotaRank ? (
                        <span className="text-emerald-800 font-bold">
                          Trong hạn ngạch {quotaCapPercent}% (Ưu tiên #{cand.rank})
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          Ngoài hạn ngạch {quotaCapPercent}% (Nên xếp Hoàn thành tốt)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        aria-label={`Chọn mức xếp loại cho ${cand.fullName}`}
                        value={cand.approvedClassification}
                        onChange={(e) =>
                          onUpdateApproval({
                            ...cand,
                            approvedClassification:
                              e.target.value as ApprovalRecord['approvedClassification'],
                          })
                        }
                        className="px-2.5 py-1.5 font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] cursor-pointer"
                      >
                        <option value="Hoàn thành xuất sắc nhiệm vụ">
                          Hoàn thành xuất sắc nhiệm vụ
                        </option>
                        <option value="Hoàn thành tốt nhiệm vụ">Hoàn thành tốt nhiệm vụ</option>
                        <option value="Hoàn thành nhiệm vụ">Hoàn thành nhiệm vụ</option>
                        <option value="Không hoàn thành nhiệm vụ">Không hoàn thành nhiệm vụ</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COLLECTIVE CONFIDENCE VOTING (BỎ PHIẾU TÍN NHIỆM CHI BỘ) */}
      {activeSubTab === 'voting' && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div>
              <strong className="text-slate-900">
                Bảng tổng hợp kiểm phiếu biểu quyết xếp loại chất lượng tại Hội nghị Chi bộ / Cơ quan cuối năm 2026
              </strong>
            </div>
            <span className="text-slate-600">
              Kết quả tự động kết chuyển vào Biên bản họp kiểm điểm cuối năm
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 font-bold text-slate-600">
                  <th className="py-3 px-4">Cán bộ / Đảng viên được bỏ phiếu</th>
                  <th className="py-3 px-3 text-center">Tổng số phiếu</th>
                  <th className="py-3 px-3 text-center">Phiếu Xuất sắc</th>
                  <th className="py-3 px-3 text-center">Phiếu Tốt</th>
                  <th className="py-3 px-3 text-center">Tỷ lệ tín nhiệm mức cao nhất</th>
                  <th className="py-3 px-4">Nghị quyết / Kết luận của Chi bộ</th>
                  <th className="py-3 px-4 text-right">Bỏ phiếu trực tuyến</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {collectiveVotes.map((v) => {
                  const maxVote = Math.max(v.votesExcellent, v.votesGood);
                  const dominantLabel =
                    v.votesExcellent >= v.votesGood ? 'Xuất sắc' : 'Hoàn thành tốt';
                  const ratioPct =
                    v.totalVoters > 0
                      ? Math.round((maxVote / v.totalVoters) * 1000) / 10
                      : 0;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{v.fullName}</div>
                        <div className="text-slate-600 mt-0.5">
                          {v.position} · Mẫu {v.templateType}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {v.totalVoters} phiếu
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#7A1C24]">
                        {v.votesExcellent}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {v.votesGood}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="font-extrabold text-slate-900">
                          {formatVnNumber(ratioPct, 1)}%
                        </span>{' '}
                        <span className="text-slate-600">({dominantLabel})</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        {v.meetingResolutionNote}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCastVote(v, 'excellent')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#7A1C24] rounded-md hover:bg-[#61151C] cursor-pointer whitespace-nowrap"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            +1 Phiếu Xuất sắc
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCastVote(v, 'good')}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 cursor-pointer whitespace-nowrap"
                          >
                            +1 Phiếu Tốt
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EMULATION & COMMENDATION (THI ĐUA - KHEN THƯỞNG) */}
      {activeSubTab === 'emulation' && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div>
              <strong className="text-slate-900">
                Danh sách tự động xét danh hiệu Thi đua - Khen thưởng cuối năm 2026 từ kết quả KPI:
              </strong>
            </div>
            <span className="text-slate-600">
              Điều kiện Chiến sĩ thi đua cơ sở: Hoàn thành xuất sắc + Điểm ≥ 90 + Có sáng kiến cấp cơ sở
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 font-bold text-slate-600">
                  <th className="py-3 px-4">Cán bộ / Đơn vị</th>
                  <th className="py-3 px-3 text-right">Điểm KPI cả năm</th>
                  <th className="py-3 px-3">Mức xếp loại được duyệt</th>
                  <th className="py-3 px-4">Đề tài / Sáng kiến cải cách hành chính</th>
                  <th className="py-3 px-4">Danh hiệu Thi đua - Khen thưởng đề xuất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {emulationStats.results.map((res) => {
                  const originalRec = approvals.find(
                    (a) => a.employeeCode === res.employeeCode
                  );
                  return (
                    <tr key={res.employeeCode} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{res.fullName}</div>
                        <div className="text-slate-600 mt-0.5">
                          {res.position} · {res.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-extrabold text-slate-900 tabular-nums">
                        {formatVnNumber(res.appraisedTotalScore)} / 100
                        <div className="text-[11px] font-normal text-slate-500">
                          KPI: {formatVnNumber(res.kpiPercent)}%
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {res.approvedClassification}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-800">{res.initiativeTitle}</div>
                        {originalRec && (
                          <button
                            type="button"
                            onClick={() => handleToggleInitiative(originalRec)}
                            className="mt-1 text-[11px] font-bold text-[#7A1C24] hover:underline cursor-pointer"
                          >
                            {res.hasRecognizedInitiative
                              ? 'Hủy xác nhận sáng kiến'
                              : '+ Xác nhận có Sáng kiến cấp cơ sở'}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {res.recommendedTitles.map((title) => (
                            <div
                              key={title}
                              className={`font-bold ${
                                title.includes('Chiến sĩ thi đua')
                                  ? 'text-[#7A1C24]'
                                  : 'text-emerald-800'
                              }`}
                            >
                              • {title}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Emulation Proposal Modal */}
      {showEmulationReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emulation-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="emulation-modal-title" className="text-base font-bold text-slate-900">
                Tờ trình & Danh sách đề nghị công nhận danh hiệu Thi đua - Khen thưởng năm 2026
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch {
                      // ignore in sandbox
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In Tờ trình A4
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmulationReportModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="p-6 border border-slate-300 font-serif-doc text-xs space-y-4 text-slate-950">
              <div className="grid grid-cols-2 text-center">
                <div>
                  <div className="font-bold uppercase">UBND TỈNH MINH HÒA</div>
                  <div className="font-bold uppercase underline">
                    HỘI ĐỒNG THI ĐUA - KHEN THƯỞNG XÃ MINH HÒA
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold underline">Độc lập - Tự do - Hạnh phúc</div>
                </div>
              </div>

              <div className="text-center pt-2">
                <h3 className="text-base font-bold uppercase">
                  TỜ TRÌNH ĐỀ NGHỊ CÔNG NHẬN DANH HIỆU THI ĐUA VÀ KHEN THƯỞNG CÁN BỘ, CÔNG CHỨC NĂM 2026
                </h3>
                <div className="italic">
                  (Căn cứ kết quả đánh giá KPI 4 Quý và Kiểm điểm cuối năm theo Quy định 366-QĐ/TW & Hướng dẫn 02)
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-900 py-1.5 px-2">TT</th>
                    <th className="border border-slate-900 py-1.5 px-2">Họ và tên</th>
                    <th className="border border-slate-900 py-1.5 px-2">Chức vụ / Đơn vị</th>
                    <th className="border border-slate-900 py-1.5 px-2">Điểm KPI</th>
                    <th className="border border-slate-900 py-1.5 px-2">Mức xếp loại</th>
                    <th className="border border-slate-900 py-1.5 px-2">
                      Danh hiệu Thi đua đề nghị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emulationStats.results.map((r, idx) => (
                    <tr key={r.employeeCode}>
                      <td className="border border-slate-900 py-1.5 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 py-1.5 px-2 font-bold">{r.fullName}</td>
                      <td className="border border-slate-900 py-1.5 px-2">
                        {r.position} — {r.department}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                        {formatVnNumber(r.appraisedTotalScore)}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2">
                        {r.approvedClassification}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 font-bold">
                        {r.recommendedTitles.join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
