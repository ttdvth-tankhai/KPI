export type FormTemplateType = '02A' | '02B' | '02D';

export type ClassificationLevel =
  | 'Hoàn thành xuất sắc nhiệm vụ'
  | 'Hoàn thành tốt nhiệm vụ'
  | 'Hoàn thành nhiệm vụ'
  | 'Không hoàn thành nhiệm vụ';

export type UserRole = 'staff' | 'manager' | 'director' | 'admin';

export type QuarterCode = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface DigitalEvidenceFile {
  fileName: string;
  fileSize: string;
  eOfficeCode: string;
  signedAuthority: string;
  issuedDate: string;
  summaryExcerpt: string;
  verifiedSignature: boolean;
}

export type UnitGovernanceType =
  | 'party_org' // Khối Đảng, Mặt trận & Đoàn thể (Quy định 366-QĐ/TW & Hướng dẫn 02)
  | 'state_admin' // Cơ quan Hành chính Nhà nước (Liên thông QĐ 366 & Nghị định 90/2020/NĐ-CP)
  | 'public_service_center'; // Đơn vị sự nghiệp công lập / Trung tâm Dịch vụ tổng hợp (Quy chế đánh giá Viên chức & NLĐ riêng)

export type LegalBasisDocType =
  | 'Quyet_dinh_phan_cong'
  | 'Quy_che_danh_gia_vien_chuc'
  | 'Chuong_trinh_cong_tac'
  | 'Hop_dong_lam_viec';

export interface LegalBasisDocument {
  id: string;
  docNumber: string;
  docType: LegalBasisDocType;
  title: string;
  signedBy: string;
  issuedDate: string;
  governanceScope: UnitGovernanceType;
  fileName: string;
  fileSize: string;
  ocrConfidence: number;
  summaryText: string;
  extractedTasks: {
    taskTitle: string;
    productName: string;
    unitName: string;
    defaultWeight: number;
  }[];
}

export interface OcrExtractionResult {
  docNumber: string;
  eOfficeCode: string;
  issuedDate: string;
  signedAuthority: string;
  detectedDocType: LegalBasisDocType;
  governanceScope: UnitGovernanceType;
  summaryExcerpt: string;
  confidence: number;
  extractedTasks: {
    taskTitle: string;
    productName: string;
    unitName: string;
    defaultWeight: number;
  }[];
}

export interface KpiTask {
  id: string;
  title: string;
  category: 'Nhiệm vụ trọng tâm' | 'Theo kế hoạch' | 'Nhiệm vụ đột xuất' | 'Chuyển đổi số & CCHC';
  productName: string;
  unitName: string;
  quarter: QuarterCode;
  assignedQty: number;
  completedQty: number;
  weight: number; // Hệ số công việc: 1.0, 1.5, 2.0
  dueDate: string;
  completedDate: string;
  status: 'completed' | 'in_progress' | 'overdue';
  criteriaA: number; // A. Số lượng sản phẩm (0 - 1.0)
  criteriaB: number; // B. Chất lượng sản phẩm (0 - 1.0)
  criteriaC: number; // C. Tiến độ hoàn thành (0 - 1.0)
  criteriaD: number; // D. Năng lực điều hành / phối hợp (0 - 1.0)
  evidenceDoc: string;
  selfScored: boolean;
  digitalEvidence?: DigitalEvidenceFile;
  legalBasisDocNumber?: string; // Căn cứ QĐ phân công nhiệm vụ / Quy chế đơn vị sự nghiệp
}

export interface GeneralCriterion {
  id: string;
  code: string;
  group:
    | 'I. Chính trị, tư tưởng'
    | 'II. Đạo đức, lối sống'
    | 'III. Tác phong, lề lối làm việc'
    | 'IV. Ý thức tổ chức kỷ luật'
    | 'V. Kết quả khắc phục hạn chế';
  title: string;
  maxScore: number;
  selfScore: number;
  appraisedScore: number;
  passed: boolean;
  note: string;
}

export interface QuarterSummaryRecord {
  quarter: QuarterCode;
  mode: 'auto' | 'manual';
  manualScore: number;
  manualKpiPercent: number;
  manualClassification: ClassificationLevel;
}

export interface UserProfile {
  fullName: string;
  dob: string;
  employeeCode: string;
  agencyName: string;
  department: string;
  partyBranch: string;
  partyCommittee: string;
  partyRole: string;
  govRole: string;
  unionRole: string;
  concurrentRole: string;
  hasConcurrentRole: boolean;
  templateType: FormTemplateType;
  jobPositionId: string;
  email: string;
  phone: string;
  governanceType?: UnitGovernanceType;
  legalBasisDocNumber?: string;
  citizenSatisfactionRate?: number;
  contractType?:
    | 'Biên chế công chức'
    | 'Hợp đồng làm việc Viên chức'
    | 'Hợp đồng lao động (NĐ 111/2022)';
}

export interface RemediationCommitmentItem {
  id: string;
  limitationGroup: 'Chuyên môn & Tiến độ KPI' | 'Tác phong & Phối hợp' | 'Chuyển đổi số & CCHC';
  limitationDescription: string;
  actionPlan2027: string;
  targetQuarter2027: 'Quý I/2027' | 'Quý II/2027' | 'Quý III/2027' | 'Quý IV/2027';
  supervisor: string;
  status: 'cam_ket' | 'dang_khac_phuc' | 'hoan_thanh';
}

export interface ExplanationMessage {
  id: string;
  senderName: string;
  senderRole: 'Cán bộ giải trình' | 'Lãnh đạo thẩm định' | 'Hội đồng thi đua';
  createdAt: string;
  type: 'giai_trinh' | 'bao_luu_y_kien' | 'phan_hoi_tham_dinh';
  content: string;
}

export interface SelfReviewContent {
  advantages: string;
  limitations: string;
  remediationResults: string;
  futureDirections: string;
  concurrentReview: string;
  classificationReason: string;
  hasBreakthroughProduct: boolean;
  noDisciplinaryViolation: boolean;
  proposedLevel: ClassificationLevel;
}

export interface JobPositionTemplate {
  id: string;
  title: string;
  code: string;
  departmentType: string;
  defaultTemplate: FormTemplateType;
  generalMaxScore: number;
  kpiMaxScore: number;
  governanceType?: UnitGovernanceType;
  regulationDocNumber?: string;
  standardNorms: {
    taskName: string;
    unit: string;
    defaultWeight: number;
    qualityRequirement: string;
  }[];
}

export interface ApprovalRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  templateType: FormTemplateType;
  hasConcurrentRole: boolean;
  period: string;
  selfGeneralScore: number;
  selfKpiScore: number;
  selfTotalScore: number;
  kpiPercent: number;
  appraisedGeneralScore: number;
  appraisedKpiScore: number;
  appraisedTotalScore: number;
  proposedClassification: ClassificationLevel;
  approvedClassification: ClassificationLevel;
  status: 'pending_manager' | 'pending_director' | 'approved' | 'revision_requested';
  submittedAt: string;
  managerComment: string;
  directorComment: string;
  signedBy?: string;
  signedAt?: string;
  hasRecognizedInitiative?: boolean;
  initiativeTitle?: string;
  explanations?: ExplanationMessage[];
}

export interface CollectiveVoteRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  templateType: FormTemplateType;
  totalVoters: number;
  votesExcellent: number;
  votesGood: number;
  votesCompleted: number;
  votesFailed: number;
  meetingResolutionNote: string;
  userVoted?: boolean;
}

export type EmulationTitleType =
  | 'Chiến sĩ thi đua cơ sở'
  | 'Lao động tiên tiến'
  | 'Đảng viên Hoàn thành xuất sắc nhiệm vụ (Giấy khen Đảng ủy)'
  | 'Không xét danh hiệu';

export interface EmulationEvaluationResult {
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  appraisedTotalScore: number;
  kpiPercent: number;
  approvedClassification: ClassificationLevel;
  hasRecognizedInitiative: boolean;
  initiativeTitle: string;
  recommendedTitles: EmulationTitleType[];
  isCstdEligible: boolean;
  isLdttEligible: boolean;
}

export interface HistoricalArchiveItem {
  id: string;
  year: number;
  periodLabel: string;
  fullName: string;
  position: string;
  department: string;
  templateType: FormTemplateType;
  generalScore: number;
  kpiScore: number;
  totalScore: number;
  kpiPercent: number;
  finalClassification: ClassificationLevel;
  approverName: string;
  archivedDate: string;
  digitalSignatureHash: string;
}

export interface NotificationRule {
  id: string;
  title: string;
  triggerType: 'periodic_quarter' | 'deadline_warning' | 'approval_alert' | 'year_end_review';
  scheduleText: string;
  channels: {
    email: boolean;
    mobilePush: boolean;
    zaloOa: boolean;
  };
  targetRole: string;
  enabled: boolean;
  lastSentAt: string;
  sentCount: number;
}

/**
 * Calculates the 4-criteria average ratio (0 to 1.0) for a single KPI task
 * according to Hướng dẫn 02 (A: Số lượng, B: Chất lượng, C: Tiến độ, D: Năng lực điều hành).
 */
export function calculateTaskCriteriaAverage(
  task: Pick<KpiTask, 'criteriaA' | 'criteriaB' | 'criteriaC' | 'criteriaD'>
): number {
  const sum =
    Number(task.criteriaA || 0) +
    Number(task.criteriaB || 0) +
    Number(task.criteriaC || 0) +
    Number(task.criteriaD || 0);
  return Math.round((sum / 4) * 10000) / 10000;
}

/**
 * Calculates the weighted KPI score and summary metrics for a list of tasks.
 */
export function calculateWeightedQuarterKpi(
  tasks: KpiTask[],
  maxKpiPillar = 70
): {
  totalTasks: number;
  completedTasks: number;
  selfScoredTasks: number;
  onTimeTasks: number;
  onTimePercent: number;
  totalWeight: number;
  weightedRatio: number;
  kpiPercentage: number;
  kpiPillarScore: number;
} {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      selfScoredTasks: 0,
      onTimeTasks: 0,
      onTimePercent: 0,
      totalWeight: 0,
      weightedRatio: 0,
      kpiPercentage: 0,
      kpiPillarScore: 0,
    };
  }

  let totalWeight = 0;
  let weightedSum = 0;
  let completedTasks = 0;
  let selfScoredTasks = 0;
  let onTimeTasks = 0;

  for (const task of tasks) {
    const w = Math.max(0.1, Number(task.weight) || 1);
    const avg = calculateTaskCriteriaAverage(task);
    totalWeight += w;
    weightedSum += avg * w;

    if (task.status === 'completed') {
      completedTasks += 1;
    }
    if (task.selfScored) {
      selfScoredTasks += 1;
    }
    if (
      task.criteriaC >= 1.0 ||
      (task.completedDate && task.dueDate && task.completedDate <= task.dueDate)
    ) {
      onTimeTasks += 1;
    }
  }

  const weightedRatio = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const kpiPercentage = Math.round((weightedRatio * 100 + 1e-9) * 100) / 100;
  const kpiPillarScore =
    Math.round(((kpiPercentage / 100) * maxKpiPillar + 1e-9) * 100) / 100;
  const onTimePercent = Math.round((onTimeTasks / tasks.length) * 100);

  return {
    totalTasks: tasks.length,
    completedTasks,
    selfScoredTasks,
    onTimeTasks,
    onTimePercent,
    totalWeight: Math.round(totalWeight * 100) / 100,
    weightedRatio: Math.round(weightedRatio * 10000) / 10000,
    kpiPercentage,
    kpiPillarScore,
  };
}

/**
 * Sums the general criteria scores (max 30 points by default under QĐ 366).
 */
export function calculateGeneralCriteriaScore(
  criteria: GeneralCriterion[],
  maxGeneralPillar = 30
): {
  selfTotal: number;
  appraisedTotal: number;
  maxTotal: number;
} {
  let selfSum = 0;
  let appraisedSum = 0;
  let maxSum = 0;

  for (const item of criteria) {
    maxSum += Number(item.maxScore) || 0;
    selfSum += item.passed
      ? Math.min(Number(item.selfScore) || 0, Number(item.maxScore) || 0)
      : 0;
    appraisedSum += item.passed
      ? Math.min(Number(item.appraisedScore) || 0, Number(item.maxScore) || 0)
      : 0;
  }

  return {
    selfTotal: Math.min(maxGeneralPillar, Math.round(selfSum * 100) / 100),
    appraisedTotal: Math.min(maxGeneralPillar, Math.round(appraisedSum * 100) / 100),
    maxTotal: Math.min(maxGeneralPillar, Math.round(maxSum * 100) / 100),
  };
}

/**
 * Suggests official classification level according to Hướng dẫn 02, QĐ 366, CV 2772 & QĐ 227.
 */
export function suggestClassification(
  totalScore: number,
  kpiPercentage: number,
  hasBreakthroughProduct = true,
  noDisciplinaryViolation = true
): ClassificationLevel {
  if (!noDisciplinaryViolation || totalScore < 50 || kpiPercentage < 50) {
    return 'Không hoàn thành nhiệm vụ';
  }
  if (totalScore >= 90 && kpiPercentage >= 90 && hasBreakthroughProduct) {
    return 'Hoàn thành xuất sắc nhiệm vụ';
  }
  if (totalScore >= 75 && kpiPercentage >= 70) {
    return 'Hoàn thành tốt nhiệm vụ';
  }
  return 'Hoàn thành nhiệm vụ';
}

/**
 * Aggregates all 4 quarters into the year-end summary.
 */
export function aggregateFourQuarters(
  quarters: {
    quarter: QuarterCode;
    score: number;
    kpiPercent: number;
    classification: ClassificationLevel;
  }[],
  hasBreakthroughProduct = true,
  noDisciplinaryViolation = true
): {
  averageScore: number;
  averageKpiPercent: number;
  excellentQuartersCount: number;
  goodQuartersCount: number;
  completedQuartersCount: number;
  failedQuartersCount: number;
  suggestedYearClassification: ClassificationLevel;
} {
  if (!quarters || quarters.length === 0) {
    return {
      averageScore: 0,
      averageKpiPercent: 0,
      excellentQuartersCount: 0,
      goodQuartersCount: 0,
      completedQuartersCount: 0,
      failedQuartersCount: 0,
      suggestedYearClassification: 'Không hoàn thành nhiệm vụ',
    };
  }

  let totalScore = 0;
  let totalKpi = 0;
  let excellentQuartersCount = 0;
  let goodQuartersCount = 0;
  let completedQuartersCount = 0;
  let failedQuartersCount = 0;

  for (const q of quarters) {
    totalScore += Number(q.score) || 0;
    totalKpi += Number(q.kpiPercent) || 0;
    if (q.classification === 'Hoàn thành xuất sắc nhiệm vụ') excellentQuartersCount++;
    else if (q.classification === 'Hoàn thành tốt nhiệm vụ') goodQuartersCount++;
    else if (q.classification === 'Hoàn thành nhiệm vụ') completedQuartersCount++;
    else failedQuartersCount++;
  }

  const averageScore =
    Math.round((totalScore / quarters.length + 1e-9) * 100) / 100;
  const averageKpiPercent =
    Math.round((totalKpi / quarters.length + 1e-9) * 100) / 100;

  let suggestedYearClassification = suggestClassification(
    averageScore,
    averageKpiPercent,
    hasBreakthroughProduct,
    noDisciplinaryViolation
  );

  if (
    failedQuartersCount > 0 &&
    suggestedYearClassification === 'Hoàn thành xuất sắc nhiệm vụ'
  ) {
    suggestedYearClassification = 'Hoàn thành nhiệm vụ';
  }

  return {
    averageScore,
    averageKpiPercent,
    excellentQuartersCount,
    goodQuartersCount,
    completedQuartersCount,
    failedQuartersCount,
    suggestedYearClassification,
  };
}

/**
 * Controls the 20% (or 25% for outstanding agencies) cap on "Hoàn thành xuất sắc nhiệm vụ"
 * according to Quy định 366-QĐ/TW and Nghị định 90/2020/NĐ-CP.
 */
export function calculateExcellenceQuota(
  approvals: ApprovalRecord[],
  quotaLimitPercent: 20 | 25 = 20
): {
  totalStaff: number;
  goodOrBetterCount: number;
  maxAllowedExcellent: number;
  currentExcellentCount: number;
  currentExcellentPercent: number;
  isExceeded: boolean;
  remainingSlots: number;
  rankedCandidates: (ApprovalRecord & { rank: number; withinQuotaRank: boolean })[];
} {
  if (!approvals || approvals.length === 0) {
    return {
      totalStaff: 0,
      goodOrBetterCount: 0,
      maxAllowedExcellent: 0,
      currentExcellentCount: 0,
      currentExcellentPercent: 0,
      isExceeded: false,
      remainingSlots: 0,
      rankedCandidates: [],
    };
  }

  const goodOrBetterCount = approvals.filter(
    (a) =>
      a.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ' ||
      a.approvedClassification === 'Hoàn thành tốt nhiệm vụ'
  ).length;

  // Under QĐ 366: max 20% (or 25%) of those rated "Hoàn thành tốt nhiệm vụ" or above (minimum 1 if unit has >= 1 good staff)
  const rawMax = (goodOrBetterCount * quotaLimitPercent) / 100;
  const maxAllowedExcellent =
    goodOrBetterCount > 0 ? Math.max(1, Math.round(rawMax + 1e-9)) : 0;

  const currentExcellentCount = approvals.filter(
    (a) => a.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ'
  ).length;

  const currentExcellentPercent =
    goodOrBetterCount > 0
      ? Math.round(((currentExcellentCount / goodOrBetterCount) * 100 + 1e-9) * 10) / 10
      : 0;

  const isExceeded = currentExcellentCount > maxAllowedExcellent;
  const remainingSlots = maxAllowedExcellent - currentExcellentCount;

  const sorted = [...approvals].sort(
    (a, b) => b.appraisedTotalScore - a.appraisedTotalScore
  );

  const rankedCandidates = sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    withinQuotaRank: idx < maxAllowedExcellent && item.appraisedTotalScore >= 90,
  }));

  return {
    totalStaff: approvals.length,
    goodOrBetterCount,
    maxAllowedExcellent,
    currentExcellentCount,
    currentExcellentPercent,
    isExceeded,
    remainingSlots,
    rankedCandidates,
  };
}

/**
 * Evaluates year-end Emulation & Commendation (Thi đua - Khen thưởng) titles from KPI & appraisal results.
 */
export function evaluateEmulationTitles(
  approvals: ApprovalRecord[]
): {
  results: EmulationEvaluationResult[];
  cstdCount: number;
  ldttCount: number;
  partyCommendationCount: number;
} {
  let cstdCount = 0;
  let ldttCount = 0;
  let partyCommendationCount = 0;

  const results: EmulationEvaluationResult[] = approvals.map((a) => {
    const isLdttEligible =
      a.appraisedTotalScore >= 75 &&
      (a.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ' ||
        a.approvedClassification === 'Hoàn thành tốt nhiệm vụ');

    const hasInitiative = Boolean(a.hasRecognizedInitiative);
    const isCstdEligible =
      isLdttEligible &&
      a.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ' &&
      a.appraisedTotalScore >= 90 &&
      hasInitiative;

    const recommendedTitles: EmulationTitleType[] = [];
    if (isLdttEligible) {
      recommendedTitles.push('Lao động tiên tiến');
      ldttCount++;
    }
    if (isCstdEligible) {
      recommendedTitles.push('Chiến sĩ thi đua cơ sở');
      cstdCount++;
    }
    if (
      a.approvedClassification === 'Hoàn thành xuất sắc nhiệm vụ' &&
      a.templateType !== '02D'
    ) {
      recommendedTitles.push(
        'Đảng viên Hoàn thành xuất sắc nhiệm vụ (Giấy khen Đảng ủy)'
      );
      partyCommendationCount++;
    }
    if (recommendedTitles.length === 0) {
      recommendedTitles.push('Không xét danh hiệu');
    }

    return {
      employeeCode: a.employeeCode,
      fullName: a.fullName,
      department: a.department,
      position: a.position,
      appraisedTotalScore: a.appraisedTotalScore,
      kpiPercent: a.kpiPercent,
      approvedClassification: a.approvedClassification,
      hasRecognizedInitiative: hasInitiative,
      initiativeTitle:
        a.initiativeTitle || 'Chưa đăng ký đề tài / sáng kiến cấp cơ sở',
      recommendedTitles,
      isCstdEligible,
      isLdttEligible,
    };
  });

  return {
    results,
    cstdCount,
    ldttCount,
    partyCommendationCount,
  };
}

export interface AllowedFormTab {
  id:
    | 'scorecard'
    | 'mau05'
    | '02A'
    | '02B'
    | '02D'
    | '02C'
    | 'mau01'
    | 'minutes'
    | 'public_service_eval';
  code: string;
  label: string;
  subtitle: string;
}

/**
 * Returns the exact filtered set of forms allowed for a user profile so users never pick the wrong template,
 * plus collective review Mẫu 01 and Meeting Minutes for Party Branch / Unit meetings.
 */
export function getAllowedFormsForProfile(
  profile: Pick<UserProfile, 'templateType' | 'hasConcurrentRole' | 'governanceType'>
): AllowedFormTab[] {
  const tabs: AllowedFormTab[] = [
    {
      id: 'scorecard',
      code: 'Bảng điểm KPI',
      label: '1. Bảng tính điểm cá nhân',
      subtitle: 'Bản tự đánh giá, chấm điểm và xếp loại quý / năm (30đ chung + 70đ KPI)',
    },
    {
      id: 'mau05',
      code: 'Mẫu 05',
      label: '2. Biểu thống kê sản phẩm (Mẫu 05)',
      subtitle: 'Phụ lục thống kê khối lượng, chất lượng, tiến độ sản phẩm công việc cả năm',
    },
  ];

  if (profile.templateType === '02A') {
    tabs.push({
      id: '02A',
      code: 'Mẫu 02A',
      label: '3. Bản kiểm điểm cá nhân (Mẫu 02A)',
      subtitle: 'Dành cho cán bộ lãnh đạo, quản lý (Theo Hướng dẫn 02 & Quy định 366)',
    });
  } else if (profile.templateType === '02B') {
    tabs.push({
      id: '02B',
      code: 'Mẫu 02B',
      label: '3. Bản kiểm điểm đảng viên (Mẫu 02B)',
      subtitle: 'Dành cho đảng viên không giữ chức vụ lãnh đạo, quản lý',
    });
  } else {
    tabs.push({
      id: '02D',
      code: 'Mẫu 02D',
      label: '3. Bản kiểm điểm công chức, viên chức (Mẫu 02D)',
      subtitle: 'Dành cho công chức, viên chức không phải là đảng viên (ngoài Đảng)',
    });
  }

  if (profile.hasConcurrentRole) {
    tabs.push({
      id: '02C',
      code: 'Mẫu 02C',
      label: '4. Mẫu 02C (Kiêm nhiệm)',
      subtitle: 'Bản nhận xét, đánh giá tại nơi giữ chức vụ kiêm nhiệm',
    });
  }

  if (profile.governanceType === 'public_service_center') {
    tabs.push({
      id: 'public_service_eval',
      code: 'Phiếu ĐG Viên chức & NLĐ',
      label: `${tabs.length + 1}. Phiếu ĐG Viên chức (Quy chế TT Dịch vụ tổng hợp)`,
      subtitle:
        'Phiếu đánh giá, xếp loại Viên chức & NLĐ theo Quy chế riêng của Đơn vị sự nghiệp công lập',
    });
  }

  tabs.push(
    {
      id: 'mau01',
      code: 'Mẫu 01 (Tập thể)',
      label: `${tabs.length + 1}. Mẫu 01 (Kiểm điểm Tập thể)`,
      subtitle: 'Bản kiểm điểm, tự đánh giá, xếp loại của Tập thể Lãnh đạo, Quản lý',
    },
    {
      id: 'minutes',
      code: 'Biên bản họp',
      label: `${tabs.length + 2}. Biên bản họp & Kiểm phiếu`,
      subtitle: 'Biên bản họp Chi bộ / Cơ quan kiểm điểm và bỏ phiếu tín nhiệm cuối năm',
    }
  );

  return tabs;
}

export interface PublicServiceEvaluationResult {
  effectiveClassification: ClassificationLevel;
  bonusCoefficient: number;
  satisfactionRate: number;
  satisfactionQualifiedForExcellence: boolean;
  autonomyNote: string;
}

/**
 * Evaluates Viên chức & Người lao động under a Public Service Unit's internal regulation
 * (e.g., Trung tâm Dịch vụ tổng hợp — Quy chế QĐ-108/QĐ-TTDVTH & Nghị định 60/2021/NĐ-CP):
 * - Requires citizen/customer satisfaction >= 95% for "Hoàn thành xuất sắc nhiệm vụ" (Hệ số thu nhập tăng thêm 1.5x).
 * - Requires citizen/customer satisfaction >= 85% for "Hoàn thành tốt nhiệm vụ" (Hệ số thu nhập tăng thêm 1.2x).
 */
export function calculatePublicServiceEvaluation(
  totalScore: number,
  kpiPercentage: number,
  citizenSatisfactionRate: number,
  baseClassification: ClassificationLevel
): PublicServiceEvaluationResult {
  const cleanSatisfaction = Math.min(100, Math.max(0, Number(citizenSatisfactionRate) || 0));
  const satisfactionQualifiedForExcellence = cleanSatisfaction >= 95;

  let effectiveClassification: ClassificationLevel = baseClassification;

  if (
    baseClassification === 'Hoàn thành xuất sắc nhiệm vụ' &&
    (!satisfactionQualifiedForExcellence || totalScore < 90 || kpiPercentage < 90)
  ) {
    effectiveClassification = 'Hoàn thành tốt nhiệm vụ';
  } else if (
    baseClassification === 'Hoàn thành tốt nhiệm vụ' &&
    cleanSatisfaction < 85
  ) {
    effectiveClassification = 'Hoàn thành nhiệm vụ';
  }

  let bonusCoefficient = 1.0;
  let autonomyNote = 'Hưởng hệ số thu nhập tăng thêm 1,0x theo Quy chế chi tiêu nội bộ Trung tâm.';

  if (effectiveClassification === 'Hoàn thành xuất sắc nhiệm vụ') {
    bonusCoefficient = 1.5;
    autonomyNote =
      'Đạt chuẩn Xuất sắc & Hài lòng người dân ≥ 95%: Hưởng hệ số thu nhập tăng thêm tối đa 1,5x (Nghị định 60/2021/NĐ-CP).';
  } else if (effectiveClassification === 'Hoàn thành tốt nhiệm vụ') {
    bonusCoefficient = 1.2;
    autonomyNote =
      'Đạt mức Hoàn thành tốt theo Quy chế Trung tâm: Hưởng hệ số thu nhập tăng thêm 1,2x.';
  } else if (effectiveClassification === 'Không hoàn thành nhiệm vụ') {
    bonusCoefficient = 0;
    autonomyNote = 'Không đủ điều kiện hưởng quỹ thu nhập tăng thêm cuối năm.';
  }

  return {
    effectiveClassification,
    bonusCoefficient,
    satisfactionRate: cleanSatisfaction,
    satisfactionQualifiedForExcellence,
    autonomyNote,
  };
}

/**
 * Formats Vietnamese decimal numbers with comma separator (e.g. 90,94).
 */
export function formatVnNumber(value: number, decimals = 2): string {
  if (Number.isNaN(value) || value === null || value === undefined) return '0,00';
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Generates a UTF-8 CSV string with BOM for Excel export.
 */
export function exportTasksToCsvString(tasks: KpiTask[]): string {
  const headers = [
    'Mã CV',
    'Quý',
    'Nhiệm vụ và sản phẩm',
    'Phân loại',
    'Đơn vị tính',
    'Số lượng giao',
    'Số lượng hoàn thành',
    'Hệ số công việc',
    'Hạn hoàn thành',
    'Ngày hoàn thành',
    'Tiêu chí A (Số lượng)',
    'Tiêu chí B (Chất lượng)',
    'Tiêu chí C (Tiến độ)',
    'Tiêu chí D (Điều hành)',
    'Điểm TB 4 tiêu chí',
    'Điểm quy đổi theo hệ số',
    'Minh chứng',
    'Mã hồ sơ E-Office',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = tasks.map((t) => {
    const avg = calculateTaskCriteriaAverage(t);
    const weighted = Math.round(avg * t.weight * 100) / 100;
    return [
      t.id,
      t.quarter,
      t.title,
      t.category,
      t.unitName,
      t.assignedQty,
      t.completedQty,
      t.weight,
      t.dueDate,
      t.completedDate,
      t.criteriaA,
      t.criteriaB,
      t.criteriaC,
      t.criteriaD,
      avg,
      weighted,
      t.evidenceDoc,
      t.digitalEvidence?.eOfficeCode || 'Chưa gắn mã',
    ]
      .map(escapeCsv)
      .join(',');
  });

  return '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
}

/**
 * Pure deterministic OCR extraction engine for Vietnamese administrative documents
 * (Bóc tách tự động Số hiệu văn bản, Ngày ban hành, Người ký, Trích yếu & Nhiệm vụ được phân công
 * từ tên file scan/PDF hoặc văn bản thô nhận dạng được).
 */
export function extractAdministrativeDocumentOcr(
  fileName: string,
  rawTextOrHint = ''
): OcrExtractionResult {
  const combined = `${rawTextOrHint} ${fileName}`.trim();
  const lower = combined.toLowerCase();

  // 1. Detect Governance Scope & Document Type
  let governanceScope: UnitGovernanceType = 'state_admin';
  let detectedDocType: LegalBasisDocType = 'Quyet_dinh_phan_cong';

  if (
    lower.includes('trung tâm') ||
    lower.includes('ttdvth') ||
    lower.includes('sự nghiệp') ||
    lower.includes('viên chức') ||
    lower.includes('quy chế') ||
    lower.includes('quy_che')
  ) {
    governanceScope = 'public_service_center';
    detectedDocType =
      lower.includes('hợp đồng') || lower.includes('hop_dong')
        ? 'Hop_dong_lam_viec'
        : 'Quy_che_danh_gia_vien_chuc';
  } else if (
    lower.includes('đảng') ||
    lower.includes('đu') ||
    lower.includes('chi bộ') ||
    lower.includes('366') ||
    lower.includes('nq-')
  ) {
    governanceScope = 'party_org';
    detectedDocType =
      lower.includes('chương trình') || lower.includes('kế hoạch') || lower.includes('kh-')
        ? 'Chuong_trinh_cong_tac'
        : 'Quyet_dinh_phan_cong';
  } else if (lower.includes('kh-') || lower.includes('kế hoạch') || lower.includes('chương trình')) {
    detectedDocType = 'Chuong_trinh_cong_tac';
  }

  // 2. Extract Document Number (Số hiệu văn bản)
  const docNumMatch = combined.match(
    /(?:Số:\s*)?((?:QĐ|QD|BC|KH|NQ|CV|TB|HD|TTr)[-/A-Z0-9ĐƯ]+)/i
  );
  let docNumber = docNumMatch
    ? docNumMatch[1].toUpperCase().replace(/^QD-/, 'QĐ-')
    : '';
  if (!docNumber) {
    if (governanceScope === 'public_service_center') {
      docNumber = 'QĐ-108/QĐ-TTDVTH';
    } else if (governanceScope === 'party_org') {
      docNumber = 'QĐ-227/QĐ-ĐU';
    } else {
      docNumber = 'QĐ-315/QĐ-UBND';
    }
  }

  // 3. Extract Issued Date (Ngày ban hành)
  let issuedDate = '2026-12-26';
  const vnDateMatch = combined.match(
    /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i
  );
  const slashDateMatch = combined.match(/(\d{1,2})[/-](\d{1,2})[/-](20\d{2})/);
  const isoDateMatch = combined.match(/(20\d{2})-(\d{2})-(\d{2})/);

  if (isoDateMatch) {
    issuedDate = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
  } else if (vnDateMatch) {
    const d = vnDateMatch[1].padStart(2, '0');
    const m = vnDateMatch[2].padStart(2, '0');
    issuedDate = `${vnDateMatch[3]}-${m}-${d}`;
  } else if (slashDateMatch) {
    const d = slashDateMatch[1].padStart(2, '0');
    const m = slashDateMatch[2].padStart(2, '0');
    issuedDate = `${slashDateMatch[3]}-${m}-${d}`;
  }

  // 4. Extract Signer / Authority
  let signedAuthority = 'Phạm Quốc Tuấn — Bí thư Đảng ủy, Chủ tịch UBND';
  if (governanceScope === 'public_service_center') {
    signedAuthority = 'Lê Văn Hùng — Giám đốc Trung tâm Dịch vụ tổng hợp';
  } else if (lower.includes('văn phòng') || lower.includes('bc-')) {
    signedAuthority = 'Nguyễn Minh An — Chánh Văn phòng Đảng ủy - UBND';
  }

  // 5. Build Summary Excerpt & Extracted Tasks
  let summaryExcerpt = '';
  let extractedTasks: OcrExtractionResult['extractedTasks'] = [];

  if (governanceScope === 'public_service_center') {
    summaryExcerpt = `Văn bản ${docNumber} ban hành ngày ${issuedDate.split('-').reverse().join('/')}: Quy chế đánh giá, xếp loại chất lượng Viên chức và Người lao động tại Trung tâm Dịch vụ tổng hợp (Đơn vị sự nghiệp công lập) theo định mức sản phẩm dịch vụ công và mức độ hài lòng của người dân/doanh nghiệp.`;
    extractedTasks = [
      {
        taskTitle: 'Thực hiện cung ứng dịch vụ sự nghiệp công & Vận hành hạ tầng kỹ thuật địa phương theo Quy chế Trung tâm',
        productName: 'Hồ sơ nghiệm thu dịch vụ sự nghiệp công đạt chuẩn',
        unitName: 'Hồ sơ/Đợt',
        defaultWeight: 2.0,
      },
      {
        taskTitle: 'Đảm bảo chỉ số hài lòng của tổ chức, cá nhân sử dụng dịch vụ tại Trung tâm Dịch vụ tổng hợp (≥ 95%)',
        productName: 'Báo cáo khảo sát hài lòng & biên bản nghiệm thu',
        unitName: 'Báo cáo',
        defaultWeight: 1.5,
      },
    ];
  } else if (governanceScope === 'party_org') {
    summaryExcerpt = `Văn bản ${docNumber} ban hành ngày ${issuedDate.split('-').reverse().join('/')}: Quyết định của Ban Thường vụ Đảng ủy về phân công nhiệm vụ trọng tâm công tác xây dựng Đảng, kiểm tra giám sát và chuyển đổi số các cơ quan Đảng năm 2026 theo Quy định 366-QĐ/TW.`;
    extractedTasks = [
      {
        taskTitle: 'Tham mưu chương trình kiểm tra, giám sát và sinh hoạt chuyên đề Chi bộ định kỳ theo QĐ phân công của Đảng ủy',
        productName: 'Kế hoạch & Báo cáo kết quả kiểm tra giám sát',
        unitName: 'Văn bản',
        defaultWeight: 2.0,
      },
    ];
  } else {
    summaryExcerpt = `Văn bản ${docNumber} ban hành ngày ${issuedDate.split('-').reverse().join('/')}: Quyết định phân công nhiệm vụ công chức chuyên môn và giao chỉ tiêu tiến độ xử lý hồ sơ hành chính công trực tuyến năm 2026.`;
    extractedTasks = [
      {
        taskTitle: 'Chủ trì giải quyết hồ sơ thủ tục hành chính đúng và trước hạn theo Quyết định phân công nhiệm vụ của UBND',
        productName: 'Hồ sơ giải quyết TTHC trên cổng DVC',
        unitName: 'Hồ sơ',
        defaultWeight: 1.5,
      },
    ];
  }

  if (rawTextOrHint.trim().length > 25) {
    summaryExcerpt = `${rawTextOrHint.trim()} (Bóc tách OCR tự động từ tệp ${fileName} — Số hiệu: ${docNumber}).`;
  }

  const cleanNum = docNumber.replace(/[^A-Z0-9]/gi, '').slice(0, 8) || '2026';
  const eOfficeCode = `EOFFICE-OCR-${cleanNum}`;

  return {
    docNumber,
    eOfficeCode,
    issuedDate,
    signedAuthority,
    detectedDocType,
    governanceScope,
    summaryExcerpt,
    confidence: 98.8,
    extractedTasks,
  };
}

