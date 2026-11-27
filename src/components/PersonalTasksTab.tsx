import React, { useState } from 'react';
import {
  Plus,
  Download,
  Upload,
  Search,
  Edit3,
  Trash2,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  Paperclip,
  ShieldCheck,
  Eye,
  FileCheck,
  ScanText,
  BookOpenCheck,
  Sparkles,
  Building2,
} from 'lucide-react';
import {
  calculateTaskCriteriaAverage,
  calculateWeightedQuarterKpi,
  extractAdministrativeDocumentOcr,
  formatVnNumber,
  type KpiTask,
  type QuarterCode,
  type DigitalEvidenceFile,
  type LegalBasisDocument,
  type UnitGovernanceType,
} from '../utils/kpiEngine';

interface PersonalTasksTabProps {
  tasks: KpiTask[];
  onAddTask: (task: KpiTask) => void;
  onUpdateTask: (task: KpiTask) => void;
  onDeleteTask: (taskId: string) => void;
  onExportCsv: () => void;
  onImportNormTasks: () => void;
  legalBasisDocs?: LegalBasisDocument[];
  onAddLegalBasisDoc?: (doc: LegalBasisDocument) => void;
}

const CRITERIA_OPTIONS = [
  { value: 1.0, label: '1,00 — Đạt chuẩn / Đúng hạn' },
  { value: 0.75, label: '0,75 — Sửa nhiều lần / Trễ nhẹ' },
  { value: 0.5, label: '0,50 — Chưa đạt / Quá hạn' },
  { value: 0.25, label: '0,25 — Kém' },
];

const WEIGHT_OPTIONS = [
  { value: 1.0, label: '1,0 (Chuẩn / Thường xuyên)' },
  { value: 1.5, label: '1,5 (Khó / Chuyên đề)' },
  { value: 2.0, label: '2,0 (Trọng tâm / Quy mô lớn)' },
];

const GOVERNANCE_LABELS: Record<UnitGovernanceType, string> = {
  party_org: 'Khối Đảng - Đoàn thể (QĐ 366-QĐ/TW)',
  state_admin: 'Hành chính Nhà nước (NĐ 90/2020 & QĐ 366)',
  public_service_center: 'Đơn vị Sự nghiệp công lập — Trung tâm Dịch vụ tổng hợp',
};

export const PersonalTasksTab: React.FC<PersonalTasksTabProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onExportCsv,
  onImportNormTasks,
  legalBasisDocs = [],
  onAddLegalBasisDoc,
}) => {
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | QuarterCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KpiTask | null>(null);
  const [viewingEvidenceTask, setViewingEvidenceTask] = useState<KpiTask | null>(null);
  const [formError, setFormError] = useState('');

  // OCR & Legal Basis Repository State
  const [showLegalBasisPanel, setShowLegalBasisPanel] = useState(true);
  const [governanceFilter, setGovernanceFilter] = useState<'ALL' | UnitGovernanceType>('ALL');
  const [ocrScanStatus, setOcrScanStatus] = useState('');
  const [ocrCustomHint, setOcrCustomHint] = useState('');
  const [selectedGovernanceForUpload, setSelectedGovernanceForUpload] =
    useState<UnitGovernanceType>('public_service_center');

  // Form state for add/edit modal
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KpiTask['category']>('Nhiệm vụ trọng tâm');
  const [productName, setProductName] = useState('');
  const [unitName, setUnitName] = useState('Báo cáo');
  const [quarter, setQuarter] = useState<QuarterCode>('Q4');
  const [assignedQty, setAssignedQty] = useState(1);
  const [completedQty, setCompletedQty] = useState(1);
  const [weight, setWeight] = useState(1.0);
  const [dueDate, setDueDate] = useState('2026-12-25');
  const [completedDate, setCompletedDate] = useState('2026-12-22');
  const [criteriaA, setCriteriaA] = useState(1.0);
  const [criteriaB, setCriteriaB] = useState(1.0);
  const [criteriaC, setCriteriaC] = useState(1.0);
  const [criteriaD, setCriteriaD] = useState(1.0);
  const [evidenceDoc, setEvidenceDoc] = useState('');
  const [eOfficeCode, setEOfficeCode] = useState('VNPT-iOffice #HS-2026-1680');
  const [evidenceFileName, setEvidenceFileName] = useState('Minh_chung_San_pham_KySo.pdf');
  const [evidenceSigner, setEvidenceSigner] = useState(
    'Văn phòng Đảng ủy - UBND (Đã xác thực chữ ký số VGCA)'
  );
  const [evidenceExcerpt, setEvidenceExcerpt] = useState(
    'Văn bản đã được ký số ban hành đúng hạn trên Trục liên thông văn bản quốc gia.'
  );
  const [legalBasisDocNumber, setLegalBasisDocNumber] = useState('QĐ-15/QĐ-ĐU');
  const [modalOcrNotice, setModalOcrNotice] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchesQuarter = quarterFilter === 'ALL' || t.quarter === quarterFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.productName.toLowerCase().includes(q) ||
      t.evidenceDoc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.digitalEvidence?.eOfficeCode || '').toLowerCase().includes(q) ||
      (t.legalBasisDocNumber || '').toLowerCase().includes(q);
    return matchesQuarter && matchesSearch;
  });

  const filteredLegalDocs = legalBasisDocs.filter(
    (doc) => governanceFilter === 'ALL' || doc.governanceScope === governanceFilter
  );

  const kpiSummary = calculateWeightedQuarterKpi(filteredTasks, 70);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Nhiệm vụ trọng tâm');
    setProductName('');
    setUnitName('Văn bản / Báo cáo');
    setQuarter('Q4');
    setAssignedQty(1);
    setCompletedQty(1);
    setWeight(1.5);
    setDueDate('2026-12-25');
    setCompletedDate('2026-12-23');
    setCriteriaA(1.0);
    setCriteriaB(1.0);
    setCriteriaC(1.0);
    setCriteriaD(1.0);
    setEvidenceDoc('BC-168/VP ngày 23/12/2026');
    setEOfficeCode('VNPT-iOffice #HS-2026-1680');
    setEvidenceFileName('BC_168_VP_Minh_chung_KySo.pdf');
    setEvidenceSigner('Đ/c Nguyễn Minh An — Chánh Văn phòng (Ký số VGCA)');
    setEvidenceExcerpt(
      'Văn bản hoàn thành đúng tiến độ, đã được thẩm định và ký số VGCA lưu hồ sơ công việc điện tử.'
    );
    setLegalBasisDocNumber(legalBasisDocs[0]?.docNumber || 'QĐ-15/QĐ-ĐU');
    setModalOcrNotice('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: KpiTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setProductName(task.productName);
    setUnitName(task.unitName);
    setQuarter(task.quarter);
    setAssignedQty(task.assignedQty);
    setCompletedQty(task.completedQty);
    setWeight(task.weight);
    setDueDate(task.dueDate);
    setCompletedDate(task.completedDate);
    setCriteriaA(task.criteriaA);
    setCriteriaB(task.criteriaB);
    setCriteriaC(task.criteriaC);
    setCriteriaD(task.criteriaD);
    setEvidenceDoc(task.evidenceDoc);
    setEOfficeCode(task.digitalEvidence?.eOfficeCode || 'VNPT-iOffice #HS-2026-1500');
    setEvidenceFileName(task.digitalEvidence?.fileName || 'Minh_chung_KySo.pdf');
    setEvidenceSigner(
      task.digitalEvidence?.signedAuthority ||
        'Văn phòng Đảng ủy - UBND (Đã xác thực chữ ký số VGCA)'
    );
    setEvidenceExcerpt(
      task.digitalEvidence?.summaryExcerpt ||
        'Hồ sơ công việc điện tử đã được xác thực chữ ký số trên hệ thống Quản lý văn bản.'
    );
    setLegalBasisDocNumber(task.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU');
    setModalOcrNotice('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Run Automated OCR Extraction on Evidence File inside Task Modal
  const handleRunModalOcrExtraction = (fileNameToScan: string, rawHint = '') => {
    const ocr = extractAdministrativeDocumentOcr(fileNameToScan, rawHint);
    const vnDate = ocr.issuedDate.split('-').reverse().join('/');
    setEvidenceFileName(fileNameToScan);
    setEvidenceDoc(`${ocr.docNumber} ngày ${vnDate}`);
    setEOfficeCode(ocr.eOfficeCode);
    setCompletedDate(ocr.issuedDate);
    setEvidenceSigner(ocr.signedAuthority);
    setEvidenceExcerpt(ocr.summaryExcerpt);
    if (!title.trim() && ocr.extractedTasks.length > 0) {
      setTitle(ocr.extractedTasks[0].taskTitle);
      setProductName(ocr.extractedTasks[0].productName);
      setUnitName(ocr.extractedTasks[0].unitName);
      setWeight(ocr.extractedTasks[0].defaultWeight);
    }
    setModalOcrNotice(
      `OCR hoàn tất (Độ chính xác ${formatVnNumber(ocr.confidence, 1)}%): Đã tự động trích xuất Số hiệu "${ocr.docNumber}", Ngày ban hành "${vnDate}", Người ký "${ocr.signedAuthority}" và Trích yếu văn bản.`
    );
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRunModalOcrExtraction(file.name);
    }
  };

  // Upload & OCR Scan an Assignment Decision / Public Service Center Regulation into Legal Basis Repository
  const handleUploadLegalBasisOcr = (
    fileNameInput: string,
    fileSizeInput: string,
    hintInput: string,
    scopeOverride?: UnitGovernanceType
  ) => {
    if (!onAddLegalBasisDoc) return;
    const scopeHint =
      scopeOverride === 'public_service_center'
        ? 'Trung tâm Dịch vụ tổng hợp Quy chế đánh giá viên chức '
        : scopeOverride === 'party_org'
          ? 'Đảng ủy Quyết định phân công 366 '
          : 'UBND Quyết định phân công công chức ';
    const ocr = extractAdministrativeDocumentOcr(fileNameInput, `${scopeHint} ${hintInput}`);
    const finalScope = scopeOverride || ocr.governanceScope;

    const newDoc: LegalBasisDocument = {
      id: `LEGAL-${Date.now()}`,
      docNumber: ocr.docNumber,
      docType: ocr.detectedDocType,
      title:
        hintInput.trim() ||
        (finalScope === 'public_service_center'
          ? `Quy chế đánh giá Viên chức & NLĐ Trung tâm Dịch vụ tổng hợp (${ocr.docNumber})`
          : finalScope === 'party_org'
            ? `Quyết định phân công nhiệm vụ của Đảng ủy (${ocr.docNumber})`
            : `Quyết định phân công nhiệm vụ công chức UBND (${ocr.docNumber})`),
      signedBy: ocr.signedAuthority,
      issuedDate: ocr.issuedDate,
      governanceScope: finalScope,
      fileName: fileNameInput,
      fileSize: fileSizeInput,
      ocrConfidence: ocr.confidence,
      summaryText: ocr.summaryExcerpt,
      extractedTasks: ocr.extractedTasks,
    };

    onAddLegalBasisDoc(newDoc);
    setOcrCustomHint('');
    setOcrScanStatus(
      `Đã quét OCR thành công tệp "${fileNameInput}" (Độ tin cậy ${formatVnNumber(ocr.confidence, 1)}%) → Bóc tách Số hiệu: ${ocr.docNumber} (${GOVERNANCE_LABELS[finalScope]}).`
    );
    setTimeout(() => setOcrScanStatus(''), 5500);
  };

  const handleLegalBasisFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kb = Math.max(120, Math.round(file.size / 1024));
    handleUploadLegalBasisOcr(
      file.name,
      `${kb} KB`,
      ocrCustomHint,
      selectedGovernanceForUpload
    );
  };

  // Convert extracted clauses from an uploaded Assignment Decision / Public Service Regulation directly into KPI Tasks
  const handleGenerateTasksFromLegalDoc = (doc: LegalBasisDocument) => {
    doc.extractedTasks.forEach((item, index) => {
      const created: KpiTask = {
        id: `CV-2026-0${tasks.length + index + 1}`,
        title: `${item.taskTitle} (Căn cứ ${doc.docNumber})`,
        category:
          doc.governanceScope === 'public_service_center'
            ? 'Theo kế hoạch'
            : 'Nhiệm vụ trọng tâm',
        productName: item.productName,
        unitName: item.unitName,
        quarter: 'Q4',
        assignedQty: 1,
        completedQty: 1,
        weight: item.defaultWeight,
        dueDate: '2026-12-28',
        completedDate: '2026-12-26',
        status: 'completed',
        criteriaA: 1.0,
        criteriaB: 1.0,
        criteriaC: 1.0,
        criteriaD: 1.0,
        evidenceDoc: `${doc.docNumber} ngày ${doc.issuedDate.split('-').reverse().join('/')}`,
        selfScored: true,
        legalBasisDocNumber: doc.docNumber,
        digitalEvidence: {
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          eOfficeCode: `EOFFICE-OCR-${doc.docNumber.replace(/[^A-Z0-9]/gi, '')}`,
          signedAuthority: doc.signedBy,
          issuedDate: doc.issuedDate.split('-').reverse().join('/'),
          summaryExcerpt: doc.summaryText,
          verifiedSignature: true,
        },
      };
      onAddTask(created);
    });
    setOcrScanStatus(
      `Đã tự động giao ${doc.extractedTasks.length} đầu việc KPI từ văn bản căn cứ "${doc.docNumber}" vào Bảng tính KPI cá nhân.`
    );
    setTimeout(() => setOcrScanStatus(''), 4500);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên nhiệm vụ công việc.');
      return;
    }
    if (!productName.trim()) {
      setFormError('Vui lòng nhập tên sản phẩm đầu ra (dùng để kết chuyển sang Mẫu 05).');
      return;
    }

    const digitalEvidence: DigitalEvidenceFile = {
      fileName: evidenceFileName.trim() || 'Minh_chung_KySo.pdf',
      fileSize: editingTask?.digitalEvidence?.fileSize || '1.45 MB',
      eOfficeCode: eOfficeCode.trim() || 'VNPT-iOffice #HS-2026-1680',
      signedAuthority:
        evidenceSigner.trim() ||
        'Văn phòng Đảng ủy - UBND (Đã xác thực chữ ký số VGCA)',
      issuedDate: completedDate.split('-').reverse().join('/'),
      summaryExcerpt:
        evidenceExcerpt.trim() ||
        'Hồ sơ sản phẩm công việc đã được kiểm tra chéo và lưu trữ trên hệ thống E-Office.',
      verifiedSignature: true,
    };

    const newTask: KpiTask = {
      id: editingTask ? editingTask.id : `CV-2026-0${tasks.length + 1}`,
      title: title.trim(),
      category,
      productName: productName.trim(),
      unitName: unitName.trim() || 'Sản phẩm',
      quarter,
      assignedQty: Math.max(1, Number(assignedQty) || 1),
      completedQty: Math.max(0, Number(completedQty) || 0),
      weight: Number(weight) || 1.0,
      dueDate,
      completedDate,
      status: completedQty >= assignedQty ? 'completed' : 'in_progress',
      criteriaA: Number(criteriaA),
      criteriaB: Number(criteriaB),
      criteriaC: Number(criteriaC),
      criteriaD: Number(criteriaD),
      evidenceDoc: evidenceDoc.trim() || 'Đang cập nhật số hiệu',
      selfScored: true,
      digitalEvidence,
      legalBasisDocNumber: legalBasisDocNumber || 'QĐ-15/QĐ-ĐU',
    };

    if (editingTask) {
      onUpdateTask(newTask);
    } else {
      onAddTask(newTask);
    }
    setIsModalOpen(false);
  };

  const handleInlineCriterionChange = (
    task: KpiTask,
    field: 'criteriaA' | 'criteriaB' | 'criteriaC' | 'criteriaD' | 'weight',
    val: number
  ) => {
    onUpdateTask({
      ...task,
      [field]: val,
      selfScored: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Công việc cá nhân, Trích xuất OCR & Căn cứ Phân công Nhiệm vụ
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tải lên Quyết định phân công (Đảng / Nhà nước) hoặc Quy chế đánh giá riêng (Đơn vị sự nghiệp công lập), tự động bóc tách văn bản bằng OCR và chấm KPI Mẫu 05
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLegalBasisPanel(!showLegalBasisPanel)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ScanText className="w-3.5 h-3.5" />
            {showLegalBasisPanel
              ? 'Ẩn Kho QĐ Phân công & OCR'
              : 'Mở Kho QĐ Phân công & Quét OCR'}
          </button>
          <button
            type="button"
            onClick={onImportNormTasks}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Nạp từ Định mức vị trí
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel / CSV
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm mới công việc
          </button>
        </div>
      </div>

      {/* NEW SECTION: OCR Document Extraction & Legal Basis / Assignment Decisions Repository (Đảng · Nhà nước · Đơn vị sự nghiệp công lập) */}
      {showLegalBasisPanel && (
        <div
          data-testid="ocr-legal-basis-panel"
          className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
                <BookOpenCheck className="w-4 h-4" />
                <span>
                  KHO VĂN BẢN CĂN CỨ PHÂN CÔNG NHIỆM VỤ & QUY CHẾ ĐÁNH GIÁ RIÊNG (TÍCH HỢP BÓC TÁCH OCR TỰ ĐỘNG)
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Hỗ trợ liên thông 3 mô hình: Khối Đảng (QĐ 366) · Hành chính Nhà nước (NĐ 90) · Đơn vị Sự nghiệp công lập (Trung tâm Dịch vụ tổng hợp)
              </h2>
            </div>

            {/* Governance Model Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'Tất cả khối (3)' },
                  { id: 'party_org', label: '1. Khối Đảng - Đoàn thể' },
                  { id: 'state_admin', label: '2. Hành chính Nhà nước' },
                  {
                    id: 'public_service_center',
                    label: '3. Đơn vị Sự nghiệp (TT Dịch vụ tổng hợp)',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGovernanceFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    governanceFilter === tab.id
                      ? 'bg-[#7A1C24] text-white border-[#7A1C24]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {ocrScanStatus && (
            <div
              data-testid="ocr-scan-status-banner"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ocrScanStatus}</span>
            </div>
          )}

          {/* Upload & OCR Extraction Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs">
            <div className="lg:col-span-3">
              <label
                htmlFor="ocr-governance-select"
                className="block font-semibold text-slate-700 mb-1"
              >
                Khối cơ quan / Quy chế áp dụng:
              </label>
              <select
                id="ocr-governance-select"
                value={selectedGovernanceForUpload}
                onChange={(e) =>
                  setSelectedGovernanceForUpload(e.target.value as UnitGovernanceType)
                }
                className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-[#7A1C24]"
              >
                <option value="public_service_center">
                  Đơn vị Sự nghiệp — Trung tâm Dịch vụ tổng hợp (Quy chế riêng)
                </option>
                <option value="party_org">
                  Khối Đảng - Đoàn thể (QĐ phân công theo QĐ 366-QĐ/TW)
                </option>
                <option value="state_admin">
                  Cơ quan Hành chính Nhà nước (QĐ phân công công chức)
                </option>
              </select>
            </div>

            <div className="lg:col-span-4">
              <label
                htmlFor="ocr-hint-input"
                className="block font-semibold text-slate-700 mb-1"
              >
                Nội dung / Số hiệu văn bản scan (hoặc để OCR tự đọc từ file):
              </label>
              <input
                id="ocr-hint-input"
                type="text"
                value={ocrCustomHint}
                onChange={(e) => setOcrCustomHint(e.target.value)}
                placeholder="VD: Số: QĐ-125/QĐ-TTDVTH ngày 20/12/2026 Quy chế đánh giá viên chức..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2 pt-4 lg:pt-5">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                <ScanText className="w-3.5 h-3.5" />
                <span>Tải ảnh/PDF & Quét OCR tự động</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleLegalBasisFileInput}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                data-testid="quick-ocr-demo-btn"
                onClick={() =>
                  handleUploadLegalBasisOcr(
                    'Scan_QD_125_TTDVTH_Quy_che_Danh_gia_Vien_chuc_NLD_2026.pdf',
                    '1.78 MB',
                    ocrCustomHint ||
                      'Số: QĐ-125/QĐ-TTDVTH ngày 22 tháng 12 năm 2026 Quy chế đánh giá Viên chức và Người lao động Trung tâm Dịch vụ tổng hợp',
                    selectedGovernanceForUpload
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quét OCR mẫu Quy chế / QĐ phân công
              </button>
            </div>
          </div>

          {/* List of Uploaded Legal Basis Documents & Extracted Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredLegalDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 text-xs hover:border-[#7A1C24]/60 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#7A1C24] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {doc.docNumber}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                      OCR: {formatVnNumber(doc.ocrConfidence, 1)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{GOVERNANCE_LABELS[doc.governanceScope]}</span>
                  </div>

                  <div className="font-bold text-slate-900 leading-snug">{doc.title}</div>

                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {doc.summaryText}
                  </p>

                  <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                    <div>
                      <strong>Người ký:</strong> {doc.signedBy}
                    </div>
                    <div>
                      <strong>Ngày ban hành:</strong>{' '}
                      <span className="font-mono">
                        {doc.issuedDate.split('-').reverse().join('/')}
                      </span>{' '}
                      · <span className="font-mono">{doc.fileName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Bóc tách: <strong>{doc.extractedTasks.length} nhiệm vụ</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGenerateTasksFromLegalDoc(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Giao vào Bảng KPI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formula & Methodology Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
            <Calculator className="w-4 h-4" />
            <span>CÔNG THỨC CHẤM KPI THEO HƯỚNG DẪN 02 & KIỂM TRA CHÉO MINH CHỨNG SỐ</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mỗi đầu việc gắn <strong>Căn cứ Quyết định phân công / Quy chế đơn vị sự nghiệp</strong>, chấm trên 4 tiêu chí{' '}
            <strong>A. Số lượng · B. Chất lượng · C. Tiến độ · D. Điều hành</strong> theo hệ số độ khó và liên kết trực tiếp với{' '}
            <strong>Minh chứng OCR / E-Office</strong> để kết chuyển sang Mẫu 05.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-6">
          <div>
            <div className="text-[11px] text-slate-500">Tỷ lệ % KPI (Có trọng số)</div>
            <div
              data-testid="tasks-kpi-percentage"
              className="text-xl font-extrabold font-mono text-[#7A1C24] tabular-nums"
            >
              {formatVnNumber(kpiSummary.kpiPercentage)}%
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Điểm trụ KPI (Tối đa 70đ)</div>
            <div
              data-testid="tasks-kpi-pillar-score"
              className="text-xl font-extrabold font-mono text-slate-900 tabular-nums"
            >
              {formatVnNumber(kpiSummary.kpiPillarScore)} / 70
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-lg w-fit">
          {(['ALL', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuarterFilter(q)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                quarterFilter === q
                  ? 'bg-[#7A1C24] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {q === 'ALL' ? 'Tất cả' : `Quý ${q.replace('Q', '')}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Tìm kiếm nhiệm vụ hoặc sản phẩm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhiệm vụ, số QĐ phân công, mã E-Office..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
          />
        </div>
      </div>

      {/* Automated KPI Spreadsheet Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-800">
              Chưa có đầu việc KPI nào trong bộ lọc này
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy bấm &ldquo;Thêm mới công việc&rdquo; hoặc &ldquo;Giao vào Bảng KPI&rdquo; từ Kho Quyết định phân công / Quy chế đánh giá phía trên.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
            >
              + Thêm công việc đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                  <th className="py-3.5 px-4 min-w-[280px]">
                    Nhiệm vụ, Căn cứ Giao việc & Hồ sơ Minh chứng số (Mẫu 05)
                  </th>
                  <th className="py-3.5 px-2.5 text-center">Quý</th>
                  <th className="py-3.5 px-2.5 text-center">Giao / Đạt</th>
                  <th className="py-3.5 px-3 text-center">Hệ số CV</th>
                  <th className="py-3.5 px-3 text-center">Hạn / Ngày xong</th>
                  <th className="py-3.5 px-3 text-center">
                    4 Tiêu chí Hướng dẫn 02 (A · B · C · D)
                  </th>
                  <th className="py-3.5 px-3 text-right">Điểm KPI</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {filteredTasks.map((task) => {
                  const avgScore = calculateTaskCriteriaAverage(task);
                  const percentScore = Math.round(avgScore * 10000) / 100;
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Column 1: Task title, product, legal basis & digital evidence */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 leading-snug">{task.title}</div>
                        <div className="text-xs text-slate-600 mt-1">
                          <span className="font-medium text-slate-700">Sản phẩm Mẫu 05:</span>{' '}
                          {task.productName}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                          <span>{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700">
                            Căn cứ: {task.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700">{task.evidenceDoc}</span>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={() => setViewingEvidenceTask(task)}
                            className="inline-flex items-center gap-1 font-semibold text-[#7A1C24] hover:underline cursor-pointer"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>
                              {task.digitalEvidence
                                ? `Xem minh chứng (${task.digitalEvidence.eOfficeCode})`
                                : 'Xem văn bản minh chứng'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Quarter */}
                      <td className="py-3.5 px-2.5 align-top text-center font-mono font-bold text-slate-700">
                        {task.quarter}
                      </td>

                      {/* Column 3: Assigned / Completed */}
                      <td className="py-3.5 px-2.5 align-top text-center font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{task.completedQty}</span> /{' '}
                        <span className="text-slate-500">{task.assignedQty}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{task.unitName}</div>
                      </td>

                      {/* Column 4: Weight Coefficient */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <select
                          aria-label={`Hệ số công việc ${task.id}`}
                          value={task.weight}
                          onChange={(e) =>
                            handleInlineCriterionChange(task, 'weight', Number(e.target.value))
                          }
                          className="px-2 py-1 text-xs font-mono font-bold text-[#7A1C24] bg-rose-50/60 border border-rose-200 rounded-md focus:outline-none focus:border-[#7A1C24] cursor-pointer tabular-nums"
                        >
                          <option value={1.0}>x1,0</option>
                          <option value={1.5}>x1,5</option>
                          <option value={2.0}>x2,0</option>
                        </select>
                      </td>

                      {/* Column 5: Dates & Status */}
                      <td className="py-3.5 px-3 align-top text-center font-mono text-[11px] tabular-nums">
                        <div className="text-slate-500">Hạn: {task.dueDate}</div>
                        <div className="text-slate-900 font-semibold mt-0.5">
                          Xong: {task.completedDate}
                        </div>
                        <div className="text-emerald-700 font-sans font-semibold mt-1 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hoàn thành đúng hạn</span>
                        </div>
                      </td>

                      {/* Column 6: 4 Criteria A/B/C/D inline quick selectors */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="grid grid-cols-2 gap-1.5 min-w-[210px]">
                          {(
                            [
                              { key: 'criteriaA', label: 'A.SL' },
                              { key: 'criteriaB', label: 'B.CL' },
                              { key: 'criteriaC', label: 'C.TĐ' },
                              { key: 'criteriaD', label: 'D.ĐH' },
                            ] as const
                          ).map((crit) => (
                            <div
                              key={crit.key}
                              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-1.5 py-1"
                            >
                              <span className="text-[10px] font-semibold text-slate-600">
                                {crit.label}
                              </span>
                              <select
                                aria-label={`${crit.label} cho ${task.id}`}
                                value={task[crit.key]}
                                onChange={(e) =>
                                  handleInlineCriterionChange(
                                    task,
                                    crit.key,
                                    Number(e.target.value)
                                  )
                                }
                                className="text-[11px] font-mono font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer tabular-nums"
                              >
                                <option value={1.0}>1,00</option>
                                <option value={0.75}>0,75</option>
                                <option value={0.5}>0,50</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Column 7: Calculated Task KPI Score */}
                      <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums">
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatVnNumber(avgScore)}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Đạt {formatVnNumber(percentScore)}%
                        </div>
                      </td>

                      {/* Column 8: Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingEvidenceTask(task)}
                            title="Kiểm tra hồ sơ minh chứng số"
                            className="p-1.5 text-slate-600 hover:text-[#7A1C24] rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#7A1C24] rounded-md hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Cập nhật
                          </button>
                          <button
                            type="button"
                            aria-label={`Xóa công việc ${task.title}`}
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-xs text-slate-800">
                  <td className="py-3.5 px-4" colSpan={3}>
                    TỔNG HỢP BẢNG TÍNH KPI ({kpiSummary.totalTasks} đầu việc ·{' '}
                    {kpiSummary.completedTasks} hoàn thành · 100% có căn cứ & minh chứng số)
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                    Σ Hệ số: {formatVnNumber(kpiSummary.totalWeight, 1)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    Đúng hạn: {kpiSummary.onTimePercent}%
                  </td>
                  <td className="py-3.5 px-3 text-right">Tỷ lệ hoàn thành KPI:</td>
                  <td className="py-3.5 px-3 text-right font-mono font-extrabold text-sm text-[#7A1C24] tabular-nums">
                    {formatVnNumber(kpiSummary.kpiPercentage)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm text-slate-900 tabular-nums">
                    {formatVnNumber(kpiSummary.kpiPillarScore)} / 70đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Digital Evidence Inspector Modal (Kho Minh Chứng Số E-Office) */}
      {viewingEvidenceTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="evidence-viewer-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#7A1C24] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KHO MINH CHỨNG SỐ & LIÊN THÔNG TRỤC VĂN BẢN E-OFFICE / OCR</span>
                </div>
                <h2 id="evidence-viewer-title" className="text-base font-bold text-slate-900 mt-0.5">
                  Hồ sơ minh chứng đầu việc: {viewingEvidenceTask.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvidenceTask(null)}
                className="px-3 py-1.5 font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {viewingEvidenceTask.productName}
                  </div>
                  <div className="text-slate-600 mt-0.5">{viewingEvidenceTask.title}</div>
                </div>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded shrink-0">
                  Đã xác thực VGCA & OCR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500">Số hiệu văn bản kết quả:</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {viewingEvidenceTask.evidenceDoc}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Căn cứ QĐ phân công / Quy chế:</span>{' '}
                  <strong className="font-mono text-[#7A1C24]">
                    {viewingEvidenceTask.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã hồ sơ E-Office:</span>{' '}
                  <strong className="font-mono text-[#7A1C24]">
                    {viewingEvidenceTask.digitalEvidence?.eOfficeCode ||
                      'VNPT-iOffice #HS-2026-1450'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Tệp đính kèm:</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {viewingEvidenceTask.digitalEvidence?.fileName || 'Minh_chung_KySo.pdf'} (
                    {viewingEvidenceTask.digitalEvidence?.fileSize || '1.5 MB'})
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Cơ quan ký ban hành:</span>{' '}
                  <strong className="text-slate-900">
                    {viewingEvidenceTask.digitalEvidence?.signedAuthority ||
                      'Đảng ủy - UBND Phường Tân Khai'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Simulated Document Preview */}
            <div className="p-5 rounded-xl border border-slate-300 bg-white font-serif-doc space-y-3 text-slate-900">
              <div className="text-xs font-sans font-bold text-slate-500 uppercase">
                TRÍCH YẾU NỘI DUNG VĂN BẢN / SẢN PHẨM ĐẦU RA (BÓC TÁCH OCR TRÊN MẪU 05):
              </div>
              <p className="text-sm leading-relaxed">
                {viewingEvidenceTask.digitalEvidence?.summaryExcerpt ||
                  'Sản phẩm đã được hoàn thành đúng tiến độ, đạt yêu cầu chất lượng chuyên môn và lưu trữ hồ sơ công việc điện tử theo quy định.'}
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-sans text-xs">
                <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>
                    Điểm KPI đầu việc: {formatVnNumber(calculateTaskCriteriaAverage(viewingEvidenceTask))} (Hệ số x{formatVnNumber(viewingEvidenceTask.weight, 1)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const taskToEdit = viewingEvidenceTask;
                    setViewingEvidenceTask(null);
                    openEditModal(taskToEdit);
                  }}
                  className="font-bold text-[#7A1C24] hover:underline cursor-pointer"
                >
                  Cập nhật / Quét OCR tệp khác →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal with Built-in OCR Scanner */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-task-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="modal-task-title" className="text-lg font-bold text-slate-900">
                {editingTask
                  ? `Cập nhật đầu việc KPI & Quét OCR Minh chứng (${editingTask.id})`
                  : 'Thêm mới đầu việc KPI & Trích xuất OCR Minh chứng Mẫu 05'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              {/* Digital Evidence & OCR Auto-Extraction Box */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="font-bold text-[#7A1C24] flex items-center gap-1.5">
                    <ScanText className="w-4 h-4" />
                    <span>TRÍCH XUẤT VĂN BẢN TỰ ĐỘNG BẰNG OCR & ĐÍNH KÈM MINH CHỨNG MẪU 05</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleRunModalOcrExtraction(
                        'Scan_BC_182_TTDVTH_Nghiem_thu_Dich_vu_cong_2026.pdf',
                        'Số: BC-182/BC-TTDVTH ngày 24 tháng 12 năm 2026 Báo cáo nghiệm thu khối lượng cung ứng dịch vụ sự nghiệp công Quý IV/2026'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#7A1C24] bg-white border border-rose-300 rounded-md hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Chạy thử bóc tách OCR tự động
                  </button>
                </div>

                {modalOcrNotice && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
                    {modalOcrNotice}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="task-file-input" className="block text-slate-700 font-medium mb-1">
                      Tải ảnh chụp / Bản scan PDF văn bản để OCR tự đọc:
                    </label>
                    <input
                      id="task-file-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileUploadChange}
                      className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#7A1C24] file:text-white cursor-pointer"
                    />
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                      Tệp: {evidenceFileName}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="task-legal-basis-select"
                      className="block text-slate-700 font-medium mb-1"
                    >
                      Căn cứ Quyết định phân công / Quy chế đơn vị:
                    </label>
                    <select
                      id="task-legal-basis-select"
                      value={legalBasisDocNumber}
                      onChange={(e) => setLegalBasisDocNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-800"
                    >
                      {legalBasisDocs.map((d) => (
                        <option key={d.id} value={d.docNumber}>
                          {d.docNumber} — {d.title.slice(0, 48)}...
                        </option>
                      ))}
                      <option value="QĐ-15/QĐ-ĐU">QĐ-15/QĐ-ĐU — Phân công nhiệm vụ Đảng ủy</option>
                      <option value="QĐ-89/QĐ-UBND">QĐ-89/QĐ-UBND — Phân công công chức UBND</option>
                      <option value="QĐ-108/QĐ-TTDVTH">
                        QĐ-108/QĐ-TTDVTH — Quy chế đánh giá Viên chức TT Dịch vụ tổng hợp
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="task-evidence-input" className="block text-slate-700 font-medium mb-1">
                      Số hiệu & Ngày ban hành (OCR tự điền)
                    </label>
                    <input
                      id="task-evidence-input"
                      type="text"
                      value={evidenceDoc}
                      onChange={(e) => setEvidenceDoc(e.target.value)}
                      placeholder="Ví dụ: KH-105/UBND ngày 20/12/2026"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="task-eoffice-input" className="block text-slate-700 font-medium mb-1">
                      Mã hồ sơ điện tử (E-Office / OCR Code)
                    </label>
                    <input
                      id="task-eoffice-input"
                      type="text"
                      value={eOfficeCode}
                      onChange={(e) => setEOfficeCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="task-excerpt-input" className="block text-slate-700 font-medium mb-1">
                    Trích yếu nội dung văn bản bóc tách từ OCR:
                  </label>
                  <textarea
                    id="task-excerpt-input"
                    rows={2}
                    value={evidenceExcerpt}
                    onChange={(e) => setEvidenceExcerpt(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="task-title-input" className="block font-semibold text-slate-700 mb-1">
                  Tên nhiệm vụ / Đầu việc được giao *
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Tham mưu xây dựng Kế hoạch cải cách hành chính năm 2027..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
                />
              </div>

              <div>
                <label htmlFor="task-product-input" className="block font-semibold text-slate-700 mb-1">
                  Sản phẩm đầu ra (Kết chuyển sang Mẫu 05) *
                </label>
                <input
                  id="task-product-input"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ví dụ: Tờ trình & Dự thảo Kế hoạch CCHC..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="task-quarter-select" className="block font-semibold text-slate-700 mb-1">
                    Kỳ Quý
                  </label>
                  <select
                    id="task-quarter-select"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value as QuarterCode)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Q1">Quý 1</option>
                    <option value="Q2">Quý 2</option>
                    <option value="Q3">Quý 3</option>
                    <option value="Q4">Quý 4</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-category-select" className="block font-semibold text-slate-700 mb-1">
                    Nhóm nhiệm vụ
                  </label>
                  <select
                    id="task-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as KpiTask['category'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Nhiệm vụ trọng tâm">Nhiệm vụ trọng tâm</option>
                    <option value="Theo kế hoạch">Theo kế hoạch</option>
                    <option value="Chuyển đổi số & CCHC">Chuyển đổi số & CCHC</option>
                    <option value="Nhiệm vụ đột xuất">Nhiệm vụ đột xuất</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-assigned-input" className="block font-semibold text-slate-700 mb-1">
                    Số lượng giao
                  </label>
                  <input
                    id="task-assigned-input"
                    type="number"
                    min={1}
                    value={assignedQty}
                    onChange={(e) => setAssignedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="task-completed-input" className="block font-semibold text-slate-700 mb-1">
                    Số lượng hoàn thành
                  </label>
                  <input
                    id="task-completed-input"
                    type="number"
                    min={0}
                    value={completedQty}
                    onChange={(e) => setCompletedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="task-weight-select" className="block font-semibold text-slate-700 mb-1">
                    Hệ số độ khó công việc
                  </label>
                  <select
                    id="task-weight-select"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-[#7A1C24]"
                  >
                    {WEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="task-due-input" className="block font-semibold text-slate-700 mb-1">
                    Hạn hoàn thành
                  </label>
                  <input
                    id="task-due-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="task-done-input" className="block font-semibold text-slate-700 mb-1">
                    Ngày hoàn thành thực tế
                  </label>
                  <input
                    id="task-done-input"
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* 4 Criteria Scoring Panel */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">
                  Chấm điểm 4 tiêu chí đầu việc theo Hướng dẫn 02:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="crit-a" className="block text-slate-600 font-medium mb-1">
                      A. Số lượng sản phẩm
                    </label>
                    <select
                      id="crit-a"
                      value={criteriaA}
                      onChange={(e) => setCriteriaA(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    >
                      {CRITERIA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="crit-b" className="block text-slate-600 font-medium mb-1">
                      B. Chất lượng sản phẩm
                    </label>
                    <select
                      id="crit-b"
                      value={criteriaB}
                      onChange={(e) => setCriteriaB(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    >
                      {CRITERIA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="crit-c" className="block text-slate-600 font-medium mb-1">
                      C. Tiến độ hoàn thành
                    </label>
                    <select
                      id="crit-c"
                      value={criteriaC}
                      onChange={(e) => setCriteriaC(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    >
                      {CRITERIA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="crit-d" className="block text-slate-600 font-medium mb-1">
                      D. Năng lực điều hành & Phối hợp
                    </label>
                    <select
                      id="crit-d"
                      value={criteriaD}
                      onChange={(e) => setCriteriaD(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    >
                      {CRITERIA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] cursor-pointer"
                >
                  Lưu công việc & Minh chứng OCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
