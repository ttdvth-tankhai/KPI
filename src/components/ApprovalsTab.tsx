import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Printer,
  ShieldCheck,
  Search,
  UserCheck,
  MessageSquare,
  Scale,
  Send,
} from 'lucide-react';
import {
  calculateExcellenceQuota,
  formatVnNumber,
  type ApprovalRecord,
  type ClassificationLevel,
  type UserRole,
  type ExplanationMessage,
} from '../utils/kpiEngine';

interface ApprovalsTabProps {
  approvals: ApprovalRecord[];
  currentRole: UserRole;
  onUpdateApproval: (updated: ApprovalRecord) => void;
  onNavigateCollective: () => void;
}

const CLASSIFICATION_OPTIONS: ClassificationLevel[] = [
  'Hoàn thành xuất sắc nhiệm vụ',
  'Hoàn thành tốt nhiệm vụ',
  'Hoàn thành nhiệm vụ',
  'Không hoàn thành nhiệm vụ',
];

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
  approvals,
  currentRole,
  onUpdateApproval,
  onNavigateCollective,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REVISION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(null);
  const [showLeadershipReportModal, setShowLeadershipReportModal] = useState(false);

  // Modal appraisal state
  const [appraisedGeneral, setAppraisedGeneral] = useState(27.0);
  const [appraisedKpi, setAppraisedKpi] = useState(63.94);
  const [approvedLevel, setApprovedLevel] = useState<ClassificationLevel>(
    'Hoàn thành xuất sắc nhiệm vụ'
  );
  const [managerComment, setManagerComment] = useState('');
  const [directorComment, setDirectorComment] = useState('');

  // Two-way Explanation / Opinion Reservation state
  const [explanationInput, setExplanationInput] = useState('');
  const [explanationType, setExplanationType] =
    useState<ExplanationMessage['type']>('giai_trinh');

  const quotaStats = calculateExcellenceQuota(approvals, 20);

  const filteredList = approvals.filter((item) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' &&
        (item.status === 'pending_manager' || item.status === 'pending_director')) ||
      (statusFilter === 'APPROVED' && item.status === 'approved') ||
      (statusFilter === 'REVISION' && item.status === 'revision_requested');

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.fullName.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      item.employeeCode.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const openAppraisalModal = (rec: ApprovalRecord) => {
    setSelectedRecord(rec);
    setAppraisedGeneral(rec.appraisedGeneralScore);
    setAppraisedKpi(rec.appraisedKpiScore);
    setApprovedLevel(rec.approvedClassification);
    setManagerComment(rec.managerComment);
    setDirectorComment(rec.directorComment);
    setExplanationInput('');
  };

  const handleAddExplanationMessage = () => {
    if (!selectedRecord || !explanationInput.trim()) return;
    const isLeader = currentRole === 'director' || currentRole === 'manager' || currentRole === 'admin';
    const newMsg: ExplanationMessage = {
      id: `EXP-${Date.now()}`,
      senderName: isLeader
        ? 'Cấp có thẩm quyền thẩm định'
        : selectedRecord.fullName,
      senderRole: isLeader ? 'Lãnh đạo thẩm định' : 'Cán bộ giải trình',
      createdAt: '26/12/2026 18:45',
      type: explanationType,
      content: explanationInput.trim(),
    };

    const updatedRecord: ApprovalRecord = {
      ...selectedRecord,
      explanations: [...(selectedRecord.explanations || []), newMsg],
    };
    setSelectedRecord(updatedRecord);
    onUpdateApproval(updatedRecord);
    setExplanationInput('');
  };

  const handleConfirmApproval = (newStatus: 'approved' | 'revision_requested') => {
    if (!selectedRecord) return;
    const total = Math.round((Number(appraisedGeneral) + Number(appraisedKpi)) * 100) / 100;
    onUpdateApproval({
      ...selectedRecord,
      appraisedGeneralScore: Number(appraisedGeneral),
      appraisedKpiScore: Number(appraisedKpi),
      appraisedTotalScore: total,
      approvedClassification: approvedLevel,
      managerComment,
      directorComment:
        directorComment ||
        `Phê duyệt kết quả đánh giá ${formatVnNumber(total)}/100 điểm — Xếp loại: ${approvedLevel}.`,
      status: newStatus,
      signedBy:
        newStatus === 'approved'
          ? 'Đ/c Phạm Quốc Tuấn - Bí thư Đảng ủy, Chủ tịch UBND (Ký số VGCA)'
          : undefined,
      signedAt: newStatus === 'approved' ? '2026-12-26 17:00' : undefined,
    });
    setSelectedRecord(null);
  };

  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const pendingCount = approvals.filter(
    (a) => a.status === 'pending_manager' || a.status === 'pending_director'
  ).length;
  const revisionCount = approvals.filter((a) => a.status === 'revision_requested').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hệ thống phê duyệt trực tuyến, Giải trình 2 chiều & Báo cáo lãnh đạo
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Thẩm định điểm KPI, kiểm soát hạn ngạch 20% Xuất sắc (Quy định 366), ghi nhận giải trình/bảo lưu và ký số ban hành
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateCollective}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            Kiểm soát hạn ngạch 20% Xuất sắc ({quotaStats.currentExcellentCount}/{quotaStats.maxAllowedExcellent})
          </button>
          <button
            type="button"
            onClick={() => setShowLeadershipReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Xuất Báo cáo PDF Tổng hợp Lãnh đạo
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Hồ sơ chờ thẩm định / duyệt</div>
            <div
              data-testid="approvals-pending-count"
              className="text-2xl font-extrabold font-mono text-amber-700 mt-1 tabular-nums"
            >
              {pendingCount} hồ sơ
            </div>
          </div>
          <Clock className="w-6 h-6 text-amber-600" />
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Đã phê duyệt & ký số</div>
            <div
              data-testid="approvals-approved-count"
              className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums"
            >
              {approvedCount} hồ sơ
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Yêu cầu giải trình / Bổ sung</div>
            <div className="text-2xl font-extrabold font-mono text-red-700 mt-1 tabular-nums">
              {revisionCount} hồ sơ
            </div>
          </div>
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Tỷ lệ Xuất sắc (Khống chế ≤ 20%)</div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 tabular-nums ${
                quotaStats.isExceeded ? 'text-red-700' : 'text-[#7A1C24]'
              }`}
            >
              {quotaStats.currentExcellentCount}/{quotaStats.maxAllowedExcellent} suất
            </div>
          </div>
          <Scale className="w-6 h-6 text-[#7A1C24]" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-lg w-fit">
          {(
            [
              { id: 'ALL', label: 'Tất cả hồ sơ' },
              { id: 'PENDING', label: 'Chờ phê duyệt' },
              { id: 'APPROVED', label: 'Đã phê duyệt' },
              { id: 'REVISION', label: 'Yêu cầu bổ sung' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#7A1C24] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Tìm kiếm hồ sơ cán bộ trình duyệt"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm họ tên, mã cán bộ, phòng ban..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
          />
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="py-3.5 px-4">Cán bộ / Đơn vị công tác</th>
                <th className="py-3.5 px-3 text-center">Mẫu biểu</th>
                <th className="py-3.5 px-3 text-right">Điểm tự chấm</th>
                <th className="py-3.5 px-3 text-right">Điểm thẩm định</th>
                <th className="py-3.5 px-3">Mức xếp loại & Giải trình</th>
                <th className="py-3.5 px-3">Trạng thái phê duyệt</th>
                <th className="py-3.5 px-4 text-right">Thao tác lãnh đạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredList.map((item) => {
                const expCount = item.explanations?.length || 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.fullName}</div>
                      <div className="text-slate-600 mt-0.5">{item.position}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.department} · Mã: <span className="font-mono">{item.employeeCode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top text-center font-mono font-bold text-[#7A1C24]">
                      Mẫu {item.templateType}
                      {item.hasConcurrentRole ? ' + 02C' : ''}
                      <div className="text-[10px] font-sans font-normal text-slate-500 mt-0.5">
                        Kèm Mẫu 05
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900">
                        {formatVnNumber(item.selfTotalScore)} / 100
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        KPI: {formatVnNumber(item.kpiPercent)}%
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums">
                      <div className="font-extrabold text-[#7A1C24]">
                        {formatVnNumber(item.appraisedTotalScore)} / 100
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatVnNumber(item.appraisedGeneralScore)}đ +{' '}
                        {formatVnNumber(item.appraisedKpiScore)}đ
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top">
                      <div className="font-bold text-slate-900">{item.approvedClassification}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.managerComment}
                      </div>
                      {expCount > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A1C24]">
                          <MessageSquare className="w-3 h-3" />
                          <span>{expCount} ý kiến giải trình / phản hồi</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 align-top">
                      {item.status === 'approved' && (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Đã phê duyệt & Ký số</span>
                        </div>
                      )}
                      {(item.status === 'pending_manager' || item.status === 'pending_director') && (
                        <div className="text-amber-700 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {item.status === 'pending_director'
                              ? 'Chờ Thủ trưởng phê duyệt'
                              : 'Chờ Trưởng phòng thẩm định'}
                          </span>
                        </div>
                      )}
                      {item.status === 'revision_requested' && (
                        <div className="text-red-700 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Yêu cầu bổ sung minh chứng</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        Trình lúc: {item.submittedAt}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => openAppraisalModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        {item.status === 'approved' ? 'Xem / Giải trình' : 'Thẩm định & Duyệt'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appraisal, Digital Sign-Off & Two-Way Explanation Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="appraisal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 shadow-xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#7A1C24]">
                  HỘI ĐỒNG ĐÁNH GIÁ, THẨM ĐỊNH & GIẢI TRÌNH 2 CHIỀU ({currentRole.toUpperCase()})
                </div>
                <h2 id="appraisal-modal-title" className="text-lg font-bold text-slate-900 mt-0.5">
                  Hồ sơ Mẫu {selectedRecord.templateType}: {selectedRecord.fullName} (
                  {selectedRecord.position})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label htmlFor="appraise-general" className="block font-bold text-slate-700 mb-1">
                  Điểm thẩm định Tiêu chí chung (Tối đa 30đ)
                </label>
                <input
                  id="appraise-general"
                  type="number"
                  step="0.5"
                  min={0}
                  max={30}
                  value={appraisedGeneral}
                  onChange={(e) => setAppraisedGeneral(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Cán bộ tự chấm: {formatVnNumber(selectedRecord.selfGeneralScore)} / 30đ
                </div>
              </div>

              <div>
                <label htmlFor="appraise-kpi" className="block font-bold text-slate-700 mb-1">
                  Điểm thẩm định Kết quả nhiệm vụ KPI (Tối đa 70đ)
                </label>
                <input
                  id="appraise-kpi"
                  type="number"
                  step="0.1"
                  min={0}
                  max={70}
                  value={appraisedKpi}
                  onChange={(e) => setAppraisedKpi(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Cán bộ tự chấm: {formatVnNumber(selectedRecord.selfKpiScore)} / 70đ (Tỷ lệ{' '}
                  {formatVnNumber(selectedRecord.kpiPercent)}%)
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="approved-level-select" className="block font-bold text-slate-800 mb-1">
                Kết luận mức xếp loại chất lượng cuối năm của cấp có thẩm quyền
              </label>
              <select
                id="approved-level-select"
                value={approvedLevel}
                onChange={(e) => setApprovedLevel(e.target.value as ClassificationLevel)}
                className="w-full px-3 py-2 font-bold text-[#7A1C24] border border-slate-300 rounded-lg"
              >
                {CLASSIFICATION_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="manager-comment-input" className="block font-bold text-slate-800 mb-1">
                  Nhận xét, đánh giá của Lãnh đạo trực tiếp / Chi bộ
                </label>
                <textarea
                  id="manager-comment-input"
                  rows={2}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="director-comment-input" className="block font-bold text-slate-800 mb-1">
                  Ý kiến kết luận của Thủ trưởng cơ quan / Ban Thường vụ
                </label>
                <textarea
                  id="director-comment-input"
                  rows={2}
                  value={directorComment}
                  onChange={(e) => setDirectorComment(e.target.value)}
                  placeholder="Nhập kết luận phê duyệt chính thức..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Two-Way Explanation & Opinion Reservation Stream (Feature Group 4) */}
            <div className="p-4 rounded-xl bg-rose-50/35 border border-rose-200 space-y-3">
              <div className="font-bold text-[#7A1C24] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>
                  LUỒNG GIẢI TRÌNH, BẢO LƯU Ý KIẾN & PHẢN HỒI THẨM ĐỊNH (THEO QUY ĐỊNH 366-QĐ/TW)
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(selectedRecord.explanations || []).length === 0 ? (
                  <div className="text-slate-500 italic">
                    Chưa có ý kiến giải trình hoặc bảo lưu nào trên hồ sơ này.
                  </div>
                ) : (
                  (selectedRecord.explanations || []).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">
                          {msg.senderName} ({msg.senderRole})
                        </span>
                        <span className="font-mono text-slate-500">{msg.createdAt}</span>
                      </div>
                      <div className="text-slate-700 leading-relaxed">{msg.content}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                <div className="sm:col-span-3">
                  <select
                    aria-label="Loại ý kiến giải trình hoặc phản hồi"
                    value={explanationType}
                    onChange={(e) =>
                      setExplanationType(e.target.value as ExplanationMessage['type'])
                    }
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                  >
                    <option value="giai_trinh">Giải trình minh chứng</option>
                    <option value="bao_luu_y_kien">Bảo lưu ý kiến cá nhân</option>
                    <option value="phan_hoi_tham_dinh">Ý kiến Hội đồng thẩm định</option>
                  </select>
                </div>
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    aria-label="Nội dung giải trình hoặc bảo lưu ý kiến"
                    value={explanationInput}
                    onChange={(e) => setExplanationInput(e.target.value)}
                    placeholder="Nhập nội dung giải trình bổ sung, bảo lưu ý kiến hoặc phản hồi thẩm định..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddExplanationMessage}
                    className="w-full py-2 px-3 font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleConfirmApproval('revision_requested')}
                className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
              >
                Yêu cầu giải trình / Bổ sung Mẫu 05
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmApproval('approved')}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Phê duyệt & Ký số ban hành
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leadership A4 Summary Report PDF Modal */}
      {showLeadershipReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leadership-pdf-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#7A1C24]" />
                <h2 id="leadership-pdf-modal-title" className="text-base font-bold text-slate-900">
                  Báo cáo PDF Tổng hợp Kết quả Đánh giá, Xếp loại Cán bộ Cuối năm (Trình Lãnh đạo)
                </h2>
              </div>
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In / Xuất Báo cáo PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeadershipReportModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="p-6 border border-slate-300 font-serif-doc text-xs space-y-4 text-slate-950">
              <div className="grid grid-cols-2 text-center">
                <div>
                  <div className="font-bold uppercase">ĐẢNG BỘ TỈNH MINH HÒA</div>
                  <div className="font-bold uppercase underline">ĐẢNG ỦY - UBND XÃ MINH HÒA</div>
                </div>
                <div>
                  <div className="font-bold uppercase">ĐẢNG CỘNG SẢN VIỆT NAM</div>
                  <div className="italic mt-1">Minh Hòa, ngày 26 tháng 12 năm 2026</div>
                </div>
              </div>

              <div className="text-center pt-2">
                <h3 className="text-base font-bold uppercase">
                  BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ KPI VÀ XẾP LOẠI CHẤT LƯỢNG CÁN BỘ, CÔNG CHỨC NĂM 2026
                </h3>
                <div className="italic">
                  (Theo Hướng dẫn 02, Quy định 366-QĐ/TW, Công văn 2772 & Quy định 227 — Tỷ lệ Xuất sắc: {quotaStats.currentExcellentCount}/{quotaStats.maxAllowedExcellent} suất)
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-900 py-1.5 px-2">TT</th>
                    <th className="border border-slate-900 py-1.5 px-2">Họ và tên</th>
                    <th className="border border-slate-900 py-1.5 px-2">Chức vụ / Đơn vị</th>
                    <th className="border border-slate-900 py-1.5 px-2">Mẫu</th>
                    <th className="border border-slate-900 py-1.5 px-2">Tỷ lệ KPI</th>
                    <th className="border border-slate-900 py-1.5 px-2">Điểm thẩm định</th>
                    <th className="border border-slate-900 py-1.5 px-2">Mức xếp loại</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((a, idx) => (
                    <tr key={a.id}>
                      <td className="border border-slate-900 py-1.5 px-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 py-1.5 px-2 font-bold">{a.fullName}</td>
                      <td className="border border-slate-900 py-1.5 px-2">
                        {a.position} — {a.department}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                        {a.templateType}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                        {formatVnNumber(a.kpiPercent)}%
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                        {formatVnNumber(a.appraisedTotalScore)}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 font-bold">
                        {a.approvedClassification}
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
