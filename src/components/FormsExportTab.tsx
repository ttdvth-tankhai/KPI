import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  FileDown,
  PenTool,
  CheckCircle2,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  getAllowedFormsForProfile,
  calculateTaskCriteriaAverage,
  calculatePublicServiceEvaluation,
  formatVnNumber,
  type UserProfile,
  type KpiTask,
  type GeneralCriterion,
  type SelfReviewContent,
  type QuarterCode,
  type ClassificationLevel,
  type CollectiveVoteRecord,
  type RemediationCommitmentItem,
  type AllowedFormTab,
} from '../utils/kpiEngine';

interface FormsExportTabProps {
  profile: UserProfile;
  tasks: KpiTask[];
  generalCriteria: GeneralCriterion[];
  selfReview: SelfReviewContent;
  remediationPlan?: RemediationCommitmentItem[];
  collectiveVotes?: CollectiveVoteRecord[];
  initialDocId?: AllowedFormTab['id'];
  generalScore: number;
  kpiPillarScore: number;
  kpiPercentage: number;
  totalScore: number;
  quarterSummaryList: {
    quarter: QuarterCode;
    score: number;
    kpiPercent: number;
    classification: ClassificationLevel;
  }[];
  yearAverageScore: number;
  onNavigateProfile: () => void;
}

export const FormsExportTab: React.FC<FormsExportTabProps> = ({
  profile,
  tasks,
  generalCriteria,
  selfReview,
  remediationPlan = [],
  collectiveVotes = [],
  initialDocId,
  generalScore,
  kpiPillarScore,
  kpiPercentage,
  totalScore,
  quarterSummaryList,
  yearAverageScore,
  onNavigateProfile,
}) => {
  const allowedTabs = getAllowedFormsForProfile(profile);
  const [activeDocId, setActiveDocId] = useState<AllowedFormTab['id']>(
    initialDocId || profile.templateType
  );
  const [showAllReferenceTemplates, setShowAllReferenceTemplates] = useState(false);
  const [isDigitallySigned, setIsDigitallySigned] = useState(true);
  const [exportStatusMsg, setExportStatusMsg] = useState('');
  const docContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDocId) {
      setActiveDocId(initialDocId);
    }
  }, [initialDocId]);

  // Ensure activeDocId is valid if user switched profile templateType
  const effectiveDocId: AllowedFormTab['id'] =
    !showAllReferenceTemplates &&
    (activeDocId === '02A' || activeDocId === '02B' || activeDocId === '02D') &&
    activeDocId !== profile.templateType
      ? profile.templateType
      : activeDocId;

  const visibleTabs: { id: AllowedFormTab['id']; code: string; label: string }[] =
    showAllReferenceTemplates
      ? [
          {
            id: 'scorecard',
            code: 'Bảng điểm KPI',
            label: '1. Bảng tính điểm cá nhân',
          },
          {
            id: 'mau05',
            code: 'Mẫu 05',
            label: '2. Biểu thống kê sản phẩm (Mẫu 05)',
          },
          {
            id: '02A',
            code: 'Mẫu 02A',
            label: '3. Mẫu 02A (Lãnh đạo, quản lý)',
          },
          {
            id: '02B',
            code: 'Mẫu 02B',
            label: '4. Mẫu 02B (Đảng viên không giữ chức vụ)',
          },
          {
            id: '02D',
            code: 'Mẫu 02D',
            label: '5. Mẫu 02D (Công chức, viên chức ngoài Đảng)',
          },
          {
            id: '02C',
            code: 'Mẫu 02C',
            label: '6. Mẫu 02C (Nơi kiêm nhiệm)',
          },
          {
            id: 'public_service_eval',
            code: 'Phiếu ĐG Viên chức & NLĐ',
            label: '7. Phiếu ĐG Viên chức (Quy chế TT Dịch vụ tổng hợp)',
          },
          {
            id: 'mau01',
            code: 'Mẫu 01 Tập thể',
            label: '8. Mẫu 01 (Kiểm điểm Tập thể Lãnh đạo)',
          },
          {
            id: 'minutes',
            code: 'Biên bản Họp',
            label: '9. Biên bản Họp & Kiểm phiếu tín nhiệm',
          },
        ]
      : allowedTabs;

  const publicServiceEval = calculatePublicServiceEvaluation(
    totalScore,
    kpiPercentage,
    profile.citizenSatisfactionRate ?? 96.8,
    selfReview.proposedLevel
  );

  const handleExportWord = () => {
    if (!docContainerRef.current) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Mau_Bieu_${effectiveDocId}_${profile.fullName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 6px; }
      </style>
      </head>
      <body>${docContainerRef.current.innerHTML}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VKPI_HD02_Mau_${effectiveDocId}_${profile.employeeCode}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatusMsg(
      `Đã xuất file Word chuẩn thể thức A4: VKPI_HD02_Mau_${effectiveDocId}_${profile.employeeCode}.doc`
    );
  };

  const handleExportPdf = () => {
    setExportStatusMsg(
      `Đã tạo bản in/xuất PDF khổ A4 chuẩn thể thức hành chính cho biểu mẫu ${effectiveDocId} (${profile.fullName}).`
    );
    try {
      window.print();
    } catch {
      // Fallback in sandboxed environments
    }
  };

  const formattedDob = profile.dob.split('-').reverse().join('/');

  return (
    <div className="space-y-6">
      {/* Control Card matching Video 1 (1:08 - 1:14) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Chữ ký số & Xuất Mẫu biểu chuẩn thể thức A4
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Hồ sơ của đồng chí <strong>{profile.fullName}</strong> đang thiết lập nhóm đối tượng{' '}
              <strong className="text-[#7A1C24]">Mẫu {profile.templateType}</strong>. Hệ thống tự động lọc đúng mẫu biểu cá nhân và bổ sung Mẫu 01 Tập thể & Biên bản kiểm phiếu Chi bộ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllReferenceTemplates(!showAllReferenceTemplates)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {showAllReferenceTemplates
                ? `Chỉ hiện mẫu của hồ sơ (Mẫu ${profile.templateType})`
                : 'Xem đối chiếu tất cả mẫu 02A · 02B · 02D · 02C · Mẫu 01'}
            </button>
            <button
              type="button"
              onClick={onNavigateProfile}
              className="px-3 py-1.5 text-xs font-semibold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Đổi mẫu tại Hồ sơ cá nhân
            </button>
          </div>
        </div>

        {/* Form Selector Tabs + Export Buttons Row matching Video 1 (1:10) */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDocId(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  effectiveDocId === tab.id
                    ? 'bg-rose-50/90 text-[#7A1C24] border-[#7A1C24] shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDigitallySigned(!isDigitallySigned)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDigitallySigned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              {isDigitallySigned ? 'Đã chèn Chữ ký số' : 'Chèn Chữ ký số'}
            </button>
            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-700" />
              Xuất file Word
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              In / Lưu PDF
            </button>
          </div>
        </div>

        {exportStatusMsg && (
          <div
            data-testid="export-status-banner"
            className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportStatusMsg}</span>
          </div>
        )}
      </div>

      {/* A4 Official Document Preview Container */}
      <div className="bg-slate-200/70 p-4 sm:p-8 rounded-xl border border-slate-300/80 flex justify-center print-only-a4">
        <div
          ref={docContainerRef}
          data-testid="a4-document-preview"
          className="bg-white w-full max-w-[860px] min-h-[1080px] p-8 sm:p-12 shadow-md border border-slate-300 text-slate-950 font-serif-doc text-[13.5px] leading-relaxed print-only-a4"
        >
          {/* DOCUMENT TYPE 1: BẢN KIỂM ĐIỂM MẪU 02A / 02B / 02D */}
          {(effectiveDocId === '02A' ||
            effectiveDocId === '02B' ||
            effectiveDocId === '02D') && (
            <div className="space-y-5">
              <div className="text-right font-bold text-xs">
                Mẫu {effectiveDocId} (Hướng dẫn 02 & Quy định 366-QĐ/TW)
              </div>

              {/* Header Quốc hiệu / Đảng hiệu */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  {effectiveDocId === '02D' ? (
                    <>
                      <div className="font-bold uppercase">UBND TỈNH MINH HÒA</div>
                      <div className="font-bold uppercase underline">
                        {profile.agencyName.toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold uppercase">ĐẢNG BỘ TỈNH MINH HÒA</div>
                      <div className="font-bold uppercase underline">ĐẢNG ỦY XÃ MINH HÒA</div>
                    </>
                  )}
                </div>
                <div>
                  {effectiveDocId === '02D' ? (
                    <>
                      <div className="font-bold uppercase">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </div>
                      <div className="font-bold underline">Độc lập - Tự do - Hạnh phúc</div>
                    </>
                  ) : (
                    <div className="font-bold uppercase underline">ĐẢNG CỘNG SẢN VIỆT NAM</div>
                  )}
                  <div className="italic text-xs mt-1.5">
                    Minh Hòa, ngày 26 tháng 12 năm 2026
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center pt-3">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BẢN KIỂM ĐIỂM, TỰ ĐÁNH GIÁ, XẾP LOẠI CỦA CÁ NHÂN
                </h2>
                <div className="font-bold">Năm 2026</div>
                <div className="italic text-xs mt-0.5">
                  {effectiveDocId === '02A' &&
                    '(Cá nhân giữ chức vụ lãnh đạo, quản lý — Mẫu 02A)'}
                  {effectiveDocId === '02B' &&
                    '(Đảng viên không giữ chức vụ lãnh đạo, quản lý — Mẫu 02B)'}
                  {effectiveDocId === '02D' &&
                    '(Công chức, viên chức không phải là đảng viên — Mẫu 02D)'}
                </div>
              </div>

              {/* Personal Metadata */}
              <div className="space-y-1.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    Họ và tên: <strong>{profile.fullName}</strong>
                  </div>
                  <div>
                    Ngày sinh: <strong>{formattedDob}</strong>
                  </div>
                </div>
                {effectiveDocId !== '02D' && (
                  <div>
                    Chức vụ Đảng: <strong>{profile.partyRole}</strong>
                  </div>
                )}
                <div>
                  Chức vụ chính quyền: <strong>{profile.govRole}</strong>
                </div>
                <div>
                  Chức vụ đoàn thể: <strong>{profile.unionRole}</strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    Đơn vị công tác: <strong>{profile.agencyName}</strong>
                  </div>
                  {effectiveDocId !== '02D' && (
                    <div>
                      Chi bộ: <strong>{profile.partyBranch}</strong>
                    </div>
                  )}
                </div>
                {profile.hasConcurrentRole && (
                  <div>
                    Chức vụ kiêm nhiệm: <strong>{profile.concurrentRole}</strong>
                  </div>
                )}
              </div>

              {/* Section A: Nội dung kiểm điểm */}
              <div className="space-y-3 pt-2">
                <div className="font-bold uppercase">A. NỘI DUNG KIỂM ĐIỂM</div>

                <div>
                  <div className="font-bold">I. Ưu điểm, kết quả đạt được</div>
                  <div className="mt-1 text-justify">
                    <strong>1. Về phẩm chất chính trị, đạo đức, lối sống; tinh thần đoàn kết, thống nhất trong nội bộ; ý thức tổ chức kỷ luật, trách nhiệm nêu gương, việc thực hiện những điều đảng viên/công chức không được làm; tác phong, lề lối làm việc:</strong>
                    <p className="mt-1">{selfReview.advantages}</p>
                    <p className="mt-1">
                      Kết quả tự chấm nhóm tiêu chí chung theo Quy định 366-QĐ/TW đạt:{' '}
                      <strong>{formatVnNumber(generalScore)} / 30,00 điểm</strong>.
                    </p>
                  </div>

                  <div className="mt-2 text-justify">
                    <strong>
                      2. Việc thực hiện nhiệm vụ, quyền hạn và kết quả thực hiện các chỉ tiêu, nhiệm vụ được giao trong năm (Tổng hợp KPI 4 Quý & Biểu thống kê Mẫu 05 kèm theo):
                    </strong>
                    <p className="mt-1">
                      Trong năm 2026, đã hoàn thành <strong>{tasks.length}/{tasks.length}</strong> nhiệm vụ trọng tâm và thường xuyên được giao. Tỷ lệ hoàn thành chỉ tiêu KPI Quý IV đạt{' '}
                      <strong>{formatVnNumber(kpiPercentage)}%</strong> (quy đổi đạt{' '}
                      <strong>{formatVnNumber(kpiPillarScore)} / 70,00 điểm</strong>).
                    </p>

                    {/* 4-Quarter Summary Embedded Table inside Form 02A/02B/02D */}
                    <table className="w-full border-collapse border border-slate-800 text-xs my-2.5">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-slate-800 py-1.5 px-2">Kỳ Quý</th>
                          <th className="border border-slate-800 py-1.5 px-2">Tỷ lệ % KPI</th>
                          <th className="border border-slate-800 py-1.5 px-2">Tổng điểm (Thang 100)</th>
                          <th className="border border-slate-800 py-1.5 px-2">Mức xếp loại Quý</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quarterSummaryList.map((q) => (
                          <tr key={q.quarter} className="text-center">
                            <td className="border border-slate-800 py-1 px-2 font-bold">
                              Quý {q.quarter.replace('Q', '')}/2026
                            </td>
                            <td className="border border-slate-800 py-1 px-2 font-mono">
                              {formatVnNumber(q.kpiPercent)}%
                            </td>
                            <td className="border border-slate-800 py-1 px-2 font-mono font-bold">
                              {formatVnNumber(q.score)}
                            </td>
                            <td className="border border-slate-800 py-1 px-2">
                              {q.classification}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-center">
                          <td className="border border-slate-800 py-1.5 px-2">
                            Trung bình cả năm 2026
                          </td>
                          <td className="border border-slate-800 py-1.5 px-2 font-mono">
                            {formatVnNumber(kpiPercentage)}%
                          </td>
                          <td className="border border-slate-800 py-1.5 px-2 font-mono">
                            {formatVnNumber(yearAverageScore)} / 100
                          </td>
                          <td className="border border-slate-800 py-1.5 px-2">
                            {selfReview.proposedLevel}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {effectiveDocId === '02A' && (
                      <p className="mt-1">
                        <strong>3. Kết quả lãnh đạo, quản lý, điều hành và trách nhiệm của cá nhân trong tham gia cùng tập thể lãnh đạo:</strong> Tập thể bộ phận phụ trách đoàn kết, hoàn thành xuất sắc 100% nhiệm vụ chính trị năm 2026.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-bold">II. Hạn chế, khuyết điểm và nguyên nhân</div>
                  <p className="mt-1 text-justify">{selfReview.limitations}</p>
                </div>

                <div>
                  <div className="font-bold">
                    III. Kết quả khắc phục những hạn chế, khuyết điểm đã được cấp có thẩm quyền kết luận hoặc chỉ ra ở các kỳ kiểm điểm trước
                  </div>
                  <p className="mt-1 text-justify">{selfReview.remediationResults}</p>
                </div>

                <div>
                  <div className="font-bold">
                    IV. Giải trình những vấn đề được gợi ý kiểm điểm (nếu có)
                  </div>
                  <p className="mt-1">Không có vấn đề gợi ý kiểm điểm riêng.</p>
                </div>

                <div>
                  <div className="font-bold">
                    V. Làm rõ trách nhiệm của cá nhân đối với những hạn chế, khuyết điểm của tập thể (nếu có)
                  </div>
                  <p className="mt-1">
                    Chịu trách nhiệm người đứng đầu bộ phận trong việc đôn đốc tiến độ phối hợp liên thông giữa các tổ chuyên môn.
                  </p>
                </div>

                <div>
                  <div className="font-bold">VI. Phương hướng, biện pháp khắc phục và Cam kết năm 2027</div>
                  <p className="mt-1 text-justify">{selfReview.futureDirections}</p>
                  {remediationPlan.length > 0 && (
                    <table className="w-full border-collapse border border-slate-800 text-xs mt-2">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-slate-800 py-1 px-2">TT</th>
                          <th className="border border-slate-800 py-1 px-2">Hạn chế cần khắc phục</th>
                          <th className="border border-slate-800 py-1 px-2">Giải pháp trọng tâm năm 2027</th>
                          <th className="border border-slate-800 py-1 px-2">Thời hạn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remediationPlan.map((rp, i) => (
                          <tr key={rp.id}>
                            <td className="border border-slate-800 py-1 px-2 text-center">{i + 1}</td>
                            <td className="border border-slate-800 py-1 px-2">{rp.limitationDescription}</td>
                            <td className="border border-slate-800 py-1 px-2">{rp.actionPlan2027}</td>
                            <td className="border border-slate-800 py-1 px-2 text-center font-mono">{rp.targetQuarter2027}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Section B: Nội dung tự đánh giá, xếp loại */}
              <div className="space-y-2 pt-2">
                <div className="font-bold uppercase">
                  B. NỘI DUNG TỰ ĐÁNH GIÁ, XẾP LOẠI
                </div>
                <div>
                  1. Điểm tự đánh giá cuối năm:{' '}
                  <strong>{formatVnNumber(totalScore)} / 100 điểm</strong> (Trong đó: Tiêu chí chung:{' '}
                  {formatVnNumber(generalScore)}/30 điểm; Kết quả thực hiện nhiệm vụ KPI:{' '}
                  {formatVnNumber(kpiPillarScore)}/70 điểm).
                </div>
                <div>
                  2. Tự nhận mức xếp loại chất lượng:{' '}
                  <strong className="uppercase">{selfReview.proposedLevel}</strong>.
                </div>
                <div className="text-justify">
                  3. Lý do đề xuất: {selfReview.classificationReason}
                </div>
              </div>

              {/* Signature Block */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                <div>
                  <div className="font-bold uppercase text-xs">
                    Ý KIẾN NHẬN XÉT CỦA LÃNH ĐẠO TRỰC TIẾP
                  </div>
                  <div className="italic text-xs text-slate-600 mt-2">
                    Nhất trí với bản tự kiểm điểm và kết quả chấm điểm KPI ({formatVnNumber(totalScore)}/100 điểm) của đồng chí {profile.fullName}.
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="font-bold uppercase text-xs">NGƯỜI TỰ KIỂM ĐIỂM</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>

                  {isDigitallySigned ? (
                    <div className="my-3 px-4 py-2 border-2 border-red-700/80 bg-red-50/40 rounded text-left text-[11px] font-sans text-red-800 max-w-[230px]">
                      <div className="font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        KÝ SỐ BỞI: {profile.fullName.toUpperCase()}
                      </div>
                      <div>Cơ quan: {profile.agencyName}</div>
                      <div>Thời gian: 26/12/2026 16:45:12 +07:00</div>
                    </div>
                  ) : (
                    <div className="h-16" />
                  )}

                  <div className="font-bold">{profile.fullName}</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT TYPE 2: BIỂU THỐNG KÊ SẢN PHẨM CÔNG VIỆC (MẪU 05) */}
          {effectiveDocId === 'mau05' && (
            <div className="space-y-5">
              <div className="text-right font-bold text-xs">
                Mẫu 05 (Kèm theo Bản kiểm điểm Mẫu {profile.templateType})
              </div>

              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BIỂU THỐNG KÊ SẢN PHẨM, KẾT QUẢ THỰC HIỆN NHIỆM VỤ TRONG NĂM 2026
                </h2>
                <div className="italic text-xs mt-1">
                  (Kèm theo Bản kiểm điểm cá nhân của đồng chí <strong>{profile.fullName}</strong> — Chức vụ: {profile.govRole})
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-900 py-2 px-2 w-10">TT</th>
                    <th className="border border-slate-900 py-2 px-2">
                      Nhiệm vụ và Sản phẩm đầu ra
                    </th>
                    <th className="border border-slate-900 py-2 px-2 w-14">Quý</th>
                    <th className="border border-slate-900 py-2 px-2 w-16">Giao / Đạt</th>
                    <th className="border border-slate-900 py-2 px-2 w-14">Hệ số</th>
                    <th className="border border-slate-900 py-2 px-2 w-28">
                      4 Tiêu chí (A·B·C·D)
                    </th>
                    <th className="border border-slate-900 py-2 px-2 w-16">Điểm KPI</th>
                    <th className="border border-slate-900 py-2 px-2 w-32">
                      Số hiệu E-Office / Minh chứng số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, idx) => {
                    const avg = calculateTaskCriteriaAverage(t);
                    return (
                      <tr key={t.id}>
                        <td className="border border-slate-900 py-1.5 px-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2">
                          <div className="font-bold">{t.title}</div>
                          <div className="italic text-[11px] mt-0.5">
                            Sản phẩm: {t.productName} ({t.unitName}) ·{' '}
                            <span className="font-semibold">
                              Căn cứ: {t.legalBasisDocNumber || profile.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU'}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                          {t.quarter}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                          {t.completedQty}/{t.assignedQty}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                          {formatVnNumber(t.weight, 1)}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-mono text-[11px]">
                          {t.criteriaA} · {t.criteriaB} · {t.criteriaC} · {t.criteriaD}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                          {formatVnNumber(avg)}
                        </td>
                        <td className="border border-slate-900 py-1.5 px-2 text-[11px]">
                          <div className="font-semibold">{t.evidenceDoc}</div>
                          {t.digitalEvidence && (
                            <div className="font-mono text-[10px] text-slate-600 mt-0.5">
                              [{t.digitalEvidence.eOfficeCode}] {t.digitalEvidence.fileName}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border border-slate-900 py-2 px-2 text-center" colSpan={4}>
                      TỔNG HỢP KẾT QUẢ THỰC HIỆN NHIỆM VỤ (KPI)
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-center font-mono" colSpan={2}>
                      Tỷ lệ đạt: {formatVnNumber(kpiPercentage)}%
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-center font-mono" colSpan={2}>
                      Quy đổi: {formatVnNumber(kpiPillarScore)} / 70,00 điểm
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                <div>
                  <div className="font-bold uppercase text-xs">XÁC NHẬN CỦA TRƯỞNG ĐƠN VỊ</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-xs">NGƯỜI LẬP BIỂU THỐNG KÊ</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>
                  <div className="font-bold mt-12">{profile.fullName}</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT TYPE 3: BẢNG TÍNH ĐIỂM CÁ NHÂN (Matching Video 2 at 0:49) */}
          {effectiveDocId === 'scorecard' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BẢN TỰ ĐÁNH GIÁ, CHẤM ĐIỂM VÀ XẾP LOẠI CỦA CÁ NHÂN
                </h2>
                <div className="font-bold">Quý IV, Năm 2026</div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    Họ và tên: <strong>{profile.fullName}</strong>
                  </div>
                  <div>
                    Ngày sinh: <strong>{formattedDob}</strong>
                  </div>
                </div>
                <div>
                  Chức vụ Đảng: <strong>{profile.partyRole}</strong>
                </div>
                <div>
                  Chức vụ chính quyền: <strong>{profile.govRole}</strong>
                </div>
                <div>
                  Chức vụ đoàn thể: <strong>{profile.unionRole}</strong>
                </div>
                <div>
                  Đơn vị công tác: <strong>{profile.department} — {profile.agencyName}</strong>
                </div>
              </div>

              <div className="font-bold text-xs">
                1. Tự đánh giá kết quả thực hiện nhiệm vụ theo Quy định số 366-QĐ/TW và Hướng dẫn 02:
              </div>

              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-900 py-2 px-2 w-10">TT</th>
                    <th className="border border-slate-900 py-2 px-2">Tiêu chí / Nội dung</th>
                    <th className="border border-slate-900 py-2 px-1.5 w-16">
                      Đảm bảo (Đánh dấu x)
                    </th>
                    <th className="border border-slate-900 py-2 px-1.5 w-16">
                      Không đảm bảo
                    </th>
                    <th className="border border-slate-900 py-2 px-2 w-16">Điểm tối đa</th>
                    <th className="border border-slate-900 py-2 px-2 w-16">Điểm tự chấm</th>
                    <th className="border border-slate-900 py-2 px-2 w-24">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-50 font-bold">
                    <td className="border border-slate-900 py-1.5 px-2 text-center">I</td>
                    <td className="border border-slate-900 py-1.5 px-2" colSpan={3}>
                      NHÓM TIÊU CHÍ CHUNG (30 ĐIỂM - Theo Quy định số 366-QĐ/TW của Bộ Chính trị)
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                      30,00
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                      {formatVnNumber(generalScore)}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2" />
                  </tr>
                  {generalCriteria.map((c) => (
                    <tr key={c.id}>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                        {c.code}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-justify">
                        {c.title}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">
                        {c.passed ? 'X' : ''}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">
                        {!c.passed ? 'X' : ''}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                        {formatVnNumber(c.maxScore)}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                        {formatVnNumber(c.passed ? c.selfScore : 0)}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-[11px]">
                        {c.note}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="border border-slate-900 py-1.5 px-2 text-center">II</td>
                    <td className="border border-slate-900 py-1.5 px-2" colSpan={3}>
                      NHÓM TIÊU CHÍ KẾT QUẢ THỰC HIỆN NHIỆM VỤ — KPI (70 ĐIỂM)
                      <div className="font-normal text-[11px] mt-0.5">
                        Quy đổi từ Bảng tính KPI ({tasks.length} đầu việc · Tỷ lệ hoàn thành có trọng số đạt {formatVnNumber(kpiPercentage)}%)
                      </div>
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                      70,00
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                      {formatVnNumber(kpiPillarScore)}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-[11px]">
                      Kèm Mẫu 05
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td className="border border-slate-900 py-2 px-2 text-center" colSpan={4}>
                      TỔNG ĐIỂM ĐÁNH GIÁ (I + II)
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-center font-mono">
                      100,00
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-center font-mono text-[#7A1C24]">
                      {formatVnNumber(totalScore)}
                    </td>
                    <td className="border border-slate-900 py-2 px-2 text-xs">
                      {selfReview.proposedLevel}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* DOCUMENT TYPE 4: MẪU 02C (NƠI KIÊM NHIỆM) */}
          {effectiveDocId === '02C' && (
            <div className="space-y-5">
              <div className="text-right font-bold text-xs">
                Mẫu 02C (Bản đánh giá tại nơi giữ chức vụ kiêm nhiệm)
              </div>

              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BẢN NHẬN XÉT, ĐÁNH GIÁ CÁN BỘ GIỮ CHỨC VỤ KIÊM NHIỆM
                </h2>
                <div className="font-bold">Năm 2026</div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  Họ và tên cán bộ: <strong>{profile.fullName}</strong>
                </div>
                <div>
                  Chức vụ chính: <strong>{profile.govRole} ({profile.agencyName})</strong>
                </div>
                <div>
                  Chức vụ kiêm nhiệm: <strong>{profile.concurrentRole}</strong>
                </div>
                <div className="pt-2">
                  <div className="font-bold">
                    1. Tự nhận xét kết quả thực hiện chức trách, nhiệm vụ kiêm nhiệm:
                  </div>
                  <p className="mt-1 text-justify">{selfReview.concurrentReview}</p>
                </div>
                <div className="pt-2">
                  <div className="font-bold">
                    2. Nhận xét, đánh giá của tập thể lãnh đạo nơi kiêm nhiệm:
                  </div>
                  <p className="mt-1 text-justify">
                    Đồng chí {profile.fullName} đã phát huy tốt tinh thần trách nhiệm, hoàn thành xuất sắc 100% chỉ tiêu nhiệm vụ kiêm nhiệm năm 2026. Đề xuất mức xếp loại tại nơi kiêm nhiệm: <strong>Hoàn thành xuất sắc nhiệm vụ</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT TYPE 5: MẪU 01 (BẢN KIỂM ĐIỂM TẬP THỂ LÃNH ĐẠO, QUẢN LÝ) */}
          {effectiveDocId === 'mau01' && (
            <div className="space-y-5">
              <div className="text-right font-bold text-xs">
                Mẫu 01 (Theo Quy định số 366-QĐ/TW và Hướng dẫn 02)
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="font-bold uppercase">ĐẢNG BỘ TỈNH MINH HÒA</div>
                  <div className="font-bold uppercase underline">ĐẢNG ỦY XÃ MINH HÒA</div>
                </div>
                <div>
                  <div className="font-bold uppercase underline">ĐẢNG CỘNG SẢN VIỆT NAM</div>
                  <div className="italic text-xs mt-1.5">
                    Minh Hòa, ngày 26 tháng 12 năm 2026
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BẢN KIỂM ĐIỂM, TỰ ĐÁNH GIÁ, XẾP LOẠI CỦA TẬP THỂ LÃNH ĐẠO, QUẢN LÝ
                </h2>
                <div className="font-bold">
                  Tập thể: {profile.department} — {profile.agencyName} (Năm 2026)
                </div>
              </div>

              <div className="space-y-3 text-justify">
                <p>
                  Căn cứ Quy định số 366-QĐ/TW của Bộ Chính trị và Hướng dẫn số 02 về việc kiểm điểm và đánh giá, xếp loại chất lượng hằng năm đối với tập thể, cá nhân trong hệ thống chính trị; Tập thể lãnh đạo <strong>{profile.department} ({profile.agencyName})</strong> tiến hành kiểm điểm công tác lãnh đạo, chỉ đạo năm 2026 như sau:
                </p>

                <div>
                  <div className="font-bold">I. ƯU ĐIỂM, KẾT QUẢ ĐẠT ĐƯỢC</div>
                  <p className="mt-1">
                    1. <strong>Về việc quán triệt, cụ thể hóa và thực hiện chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước:</strong> Tập thể lãnh đạo đơn vị luôn giữ vững nguyên tắc tập trung dân chủ, đoàn kết nội bộ; ban hành kịp thời 100% kế hoạch chuyên môn và quy chế phân công nhiệm vụ gắn với chỉ tiêu định량 KPI.
                  </p>
                  <p className="mt-1">
                    2. <strong>Kết quả thực hiện các chỉ tiêu, nhiệm vụ chính trị được giao trong năm 2026:</strong> Toàn đơn vị hoàn thành 100% nhiệm vụ trọng tâm và đột xuất; tỷ lệ giải quyết hồ sơ hành chính đúng và trước hạn đạt <strong>98,5%</strong>; điểm KPI trung bình toàn đơn vị đạt <strong>94,10 / 100 điểm</strong>.
                  </p>
                </div>

                <div>
                  <div className="font-bold">II. HẠN CHẾ, KHUYẾT ĐIỂM VÀ NGUYÊN NHÂN</div>
                  <p className="mt-1">
                    Công tác phối hợp liên thông dữ liệu số hóa với một số bộ phận chuyên môn trong những đợt cao điểm đầu Quý II còn có thời điểm chậm nhịp; nguyên nhân chủ yếu do khối lượng hồ sơ phát sinh tăng đột biến.
                  </p>
                </div>

                <div>
                  <div className="font-bold">III. KẾT QUẢ KIỂM PHIẾU TÍN NHIỆM VÀ TỰ ĐÁNH GIÁ XẾP LOẠI TẬP THỂ</div>
                  <p className="mt-1">
                    Tại hội nghị kiểm điểm cuối năm ngày 26/12/2026 (15/15 đại biểu có mặt), kết quả bỏ phiếu đề xuất mức xếp loại đối với tập thể và cán bộ chủ chốt đạt tỷ lệ tín nhiệm <strong>93,33% - 100%</strong>.
                  </p>
                  <p className="mt-1">
                    Tập thể lãnh đạo {profile.department} thống nhất tự nhận mức xếp loại năm 2026:{' '}
                    <strong className="uppercase">HOÀN THÀNH XUẤT SẮC NHIỆM VỤ</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                <div>
                  <div className="font-bold uppercase text-xs">XÁC NHẬN CỦA THỦ TRƯỞNG CƠ QUAN</div>
                  <div className="italic text-xs">(Ký, đóng dấu)</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-xs">TM. TẬP THỂ LÃNH ĐẠO ĐƠN VỊ</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>
                  <div className="font-bold mt-12">{profile.fullName}</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT TYPE 6: BIÊN BẢN HỌP CHI BỘ & KIỂM PHIẾU TÍN NHIỆM */}
          {effectiveDocId === 'minutes' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="font-bold uppercase">ĐẢNG ỦY XÃ MINH HÒA</div>
                  <div className="font-bold uppercase underline">{profile.partyBranch.toUpperCase()}</div>
                </div>
                <div>
                  <div className="font-bold uppercase underline">ĐẢNG CỘNG SẢN VIỆT NAM</div>
                  <div className="italic text-xs mt-1.5">
                    Minh Hòa, ngày 26 tháng 12 năm 2026
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  BIÊN BẢN HỌP KIỂM ĐIỂM, ĐÁNH GIÁ XẾP LOẠI CHẤT LƯỢNG
                  <br />
                  VÀ KIỂM PHIẾU TÍN NHIỆM TẬP THỂ, CÁ NHÂN NĂM 2026
                </h2>
              </div>

              <div className="space-y-2 text-justify">
                <div>
                  <strong>I. Thời gian, địa điểm:</strong> Bắt đầu lúc 14 giờ 00 ngày 26/12/2026 tại Phòng họp số 1 — {profile.agencyName}.
                </div>
                <div>
                  <strong>II. Thành phần tham dự:</strong> Tổng số đảng viên/cán bộ được triệu tập: <strong>15 đồng chí</strong> (Có mặt: 15/15 đồng chí, đạt 100%).
                </div>
                <div>
                  <strong>Chủ trì hội nghị:</strong> Đồng chí <strong>Phạm Quốc Tuấn</strong> — Bí thư Đảng ủy.
                </div>
                <div>
                  <strong>Thư ký hội nghị:</strong> Đồng chí <strong>Trần Thị Thu Hà</strong> — Chi ủy viên, Công chức Văn phòng - Thống kê.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold">
                  III. KẾT QUẢ TỔNG HỢP KIỂM PHIẾU TÍN NHIỆM VÀ ĐỀ XUẤT XẾP LOẠI NĂM 2026:
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 py-1.5 px-2">TT</th>
                      <th className="border border-slate-900 py-1.5 px-2">Tập thể / Cá nhân được lấy phiếu</th>
                      <th className="border border-slate-900 py-1.5 px-2">Phiếu Xuất sắc</th>
                      <th className="border border-slate-900 py-1.5 px-2">Phiếu HTT</th>
                      <th className="border border-slate-900 py-1.5 px-2">Tỷ lệ Xuất sắc</th>
                      <th className="border border-slate-900 py-1.5 px-2">Kết luận Hội nghị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectiveVotes.map((v, idx) => {
                      const valid =
                        v.votesExcellent + v.votesGood + v.votesCompleted + v.votesFailed;
                      const rate = valid > 0 ? (v.votesExcellent / valid) * 100 : 0;
                      return (
                        <tr key={v.id}>
                          <td className="border border-slate-900 py-1.5 px-2 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-900 py-1.5 px-2">
                            <div className="font-bold">{v.fullName}</div>
                            <div className="text-[11px] italic">{v.position}</div>
                          </td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                            {v.votesExcellent}/{v.totalVoters}
                          </td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-mono">
                            {v.votesGood}/{v.totalVoters}
                          </td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold">
                            {formatVnNumber(rate)}%
                          </td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">
                            {v.meetingResolutionNote}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-justify">
                Biên bản kết thúc vào lúc 17 giờ 00 cùng ngày, đã được thông qua trước toàn thể hội nghị với tỷ lệ biểu quyết tán thành 100%.
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                <div>
                  <div className="font-bold uppercase text-xs">THƯ KÝ HỘI NGHỊ</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>
                  <div className="font-bold mt-12">Trần Thị Thu Hà</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-xs">CHỦ TRÌ HỘI NGHỊ</div>
                  <div className="italic text-xs">(Ký, đóng dấu)</div>
                  <div className="font-bold mt-12">Phạm Quốc Tuấn</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT TYPE 7: PHIẾU ĐÁNH GIÁ VIÊN CHỨC & NGƯỜI LAO ĐỘNG (QUY CHẾ TRUNG TÂM DỊCH VỤ TỔNG HỢP - ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP) */}
          {effectiveDocId === 'public_service_eval' && (
            <div className="space-y-5">
              <div className="text-right font-bold text-xs">
                Quy chế đánh giá Viên chức & NLĐ ({profile.legalBasisDocNumber || 'QĐ-108/QĐ-TTDVTH'} · Liên thông Mẫu 05)
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="font-bold uppercase">UBND XÃ MINH HÒA</div>
                  <div className="font-bold uppercase underline">
                    TRUNG TÂM DỊCH VỤ TỔNG HỢP
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold underline">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="italic text-xs mt-1.5">
                    Minh Hòa, ngày 26 tháng 12 năm 2026
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <h2 className="text-base sm:text-lg font-bold uppercase">
                  PHIẾU ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG VIÊN CHỨC VÀ NGƯỜI LAO ĐỘNG
                </h2>
                <div className="font-bold">Năm 2026</div>
                <div className="italic text-xs mt-0.5">
                  (Ban hành kèm theo Quy chế đánh giá Viên chức & NLĐ số{' '}
                  {profile.legalBasisDocNumber || 'QĐ-108/QĐ-TTDVTH'} của Trung tâm Dịch vụ tổng hợp — Đơn vị sự nghiệp công lập)
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    Họ và tên viên chức / NLĐ: <strong>{profile.fullName}</strong>
                  </div>
                  <div>
                    Mã hồ sơ: <strong className="font-mono">{profile.employeeCode}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    Chức danh nghề nghiệp / Vị trí: <strong>{profile.govRole}</strong>
                  </div>
                  <div>
                    Loại hình hợp đồng:{' '}
                    <strong>{profile.contractType || 'Hợp đồng làm việc Viên chức'}</strong>
                  </div>
                </div>
                <div>
                  Đơn vị công tác: <strong>{profile.department} — {profile.agencyName}</strong>
                </div>
              </div>

              <div className="space-y-2 text-justify">
                <div className="font-bold">
                  I. KẾT QUẢ THỰC HIỆN ĐỊNH MỨC DỊCH VỤ SỰ NGHIỆP CÔNG (LIÊN THÔNG TỪ BIỂU MẪU 05):
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 py-1.5 px-2 w-8">TT</th>
                      <th className="border border-slate-900 py-1.5 px-2">
                        Nhiệm vụ & Sản phẩm dịch vụ sự nghiệp công
                      </th>
                      <th className="border border-slate-900 py-1.5 px-2 w-24">
                        Căn cứ QĐ / Quy chế
                      </th>
                      <th className="border border-slate-900 py-1.5 px-2 w-16">Giao / Đạt</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-14">Điểm KPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t, idx) => (
                      <tr key={t.id}>
                        <td className="border border-slate-900 py-1 px-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-900 py-1 px-2">
                          <div className="font-bold">{t.title}</div>
                          <div className="text-[11px] italic">{t.productName}</div>
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono text-[11px]">
                          {t.legalBasisDocNumber || profile.legalBasisDocNumber || 'QĐ-108/QĐ-TTDVTH'}
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                          {t.completedQty}/{t.assignedQty}
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono font-bold">
                          {formatVnNumber(calculateTaskCriteriaAverage(t))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-justify">
                <div className="font-bold">
                  II. ĐÁNH GIÁ THEO QUY CHẾ RIÊNG CỦA ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP & CƠ CHẾ TỰ CHỦ:
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-slate-900 py-1.5 px-3 font-semibold">
                        1. Điểm chấp hành kỷ luật, đạo đức nghề nghiệp & thái độ phục vụ nhân dân (Tối đa 30đ)
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-center font-mono font-bold w-36">
                        {formatVnNumber(generalScore)} / 30,00
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 py-1.5 px-3 font-semibold">
                        2. Điểm kết quả cung ứng dịch vụ sự nghiệp công quy đổi từ Mẫu 05 (Tối đa 70đ)
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-center font-mono font-bold">
                        {formatVnNumber(kpiPillarScore)} / 70,00
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 py-1.5 px-3 font-semibold">
                        3. Chỉ số hài lòng của người dân / tổ chức sử dụng dịch vụ tại Trung tâm (Yêu cầu ≥ 95% cho mức Xuất sắc)
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-center font-mono font-bold text-emerald-800">
                        {formatVnNumber(publicServiceEval.satisfactionRate, 1)}%
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-900 py-2 px-3">
                        TỔNG ĐIỂM ĐÁNH GIÁ VIÊN CHỨC & MỨC XẾP LOẠI THEO QUY CHẾ TRUNG TÂM
                      </td>
                      <td className="border border-slate-900 py-2 px-3 text-center font-mono text-[#7A1C24]">
                        {formatVnNumber(totalScore)}đ — {publicServiceEval.effectiveClassification}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-900 py-1.5 px-3 font-semibold">
                        4. Hệ số chi trả thu nhập tăng thêm theo cơ chế tự chủ tài chính (Nghị định 60/2021/NĐ-CP)
                      </td>
                      <td className="border border-slate-900 py-1.5 px-3 text-center font-mono font-bold text-[#7A1C24]">
                        Hệ số {formatVnNumber(publicServiceEval.bonusCoefficient, 1)}x
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs italic">{publicServiceEval.autonomyNote}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                <div>
                  <div className="font-bold uppercase text-xs">
                    GIÁM ĐỐC TRUNG TÂM DỊCH VỤ TỔNG HỢP
                  </div>
                  <div className="italic text-xs">(Ký, đóng dấu xác nhận xếp loại)</div>
                  <div className="font-bold mt-12">Lê Văn Hùng</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-xs">VIÊN CHỨC / NGƯỜI LAO ĐỘNG</div>
                  <div className="italic text-xs">(Ký, ghi rõ họ và tên)</div>
                  <div className="font-bold mt-12">{profile.fullName}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
