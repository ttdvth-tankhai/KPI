import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTaskCriteriaAverage,
  calculateWeightedQuarterKpi,
  calculateGeneralCriteriaScore,
  suggestClassification,
  aggregateFourQuarters,
  getAllowedFormsForProfile,
  calculateExcellenceQuota,
  evaluateEmulationTitles,
  formatVnNumber,
  exportTasksToCsvString,
  extractAdministrativeDocumentOcr,
  calculatePublicServiceEvaluation,
  type KpiTask,
  type GeneralCriterion,
  type ApprovalRecord,
} from './kpiEngine';

test('calculateTaskCriteriaAverage computes 4-column A/B/C/D average accurately (Video 2 formula)', () => {
  const avg = calculateTaskCriteriaAverage({
    criteriaA: 1.0,
    criteriaB: 0.75,
    criteriaC: 1.0,
    criteriaD: 1.0,
  });
  assert.equal(avg, 0.9375);
});

test('calculateWeightedQuarterKpi weights tasks by complexity coefficient (1.0, 1.5, 2.0) and converts to 70-point pillar', () => {
  const sampleTasks: KpiTask[] = [
    {
      id: 'CV-01',
      title: 'Báo cáo tháng định kỳ',
      category: 'Theo kế hoạch',
      productName: 'Báo cáo tổng hợp tháng',
      unitName: 'Báo cáo',
      quarter: 'Q4',
      assignedQty: 3,
      completedQty: 3,
      weight: 1.0,
      dueDate: '2026-12-10',
      completedDate: '2026-12-09',
      status: 'completed',
      criteriaA: 1.0,
      criteriaB: 1.0,
      criteriaC: 1.0,
      criteriaD: 1.0,
      evidenceDoc: 'BC-102/VP',
      selfScored: true,
    },
    {
      id: 'CV-02',
      title: 'Trình dự thảo quy định đánh giá cán bộ',
      category: 'Nhiệm vụ trọng tâm',
      productName: 'Tờ trình & Dự thảo Quy định',
      unitName: 'Dự thảo',
      quarter: 'Q4',
      assignedQty: 1,
      completedQty: 1,
      weight: 2.0,
      dueDate: '2026-12-20',
      completedDate: '2026-12-18',
      status: 'completed',
      criteriaA: 1.0,
      criteriaB: 0.75,
      criteriaC: 1.0,
      criteriaD: 1.0,
      evidenceDoc: 'TTr-88/TCB',
      selfScored: true,
    },
  ];

  const result = calculateWeightedQuarterKpi(sampleTasks, 70);
  assert.equal(result.totalTasks, 2);
  assert.equal(result.completedTasks, 2);
  assert.equal(result.totalWeight, 3.0);
  assert.equal(result.kpiPercentage, 95.83);
  assert.equal(result.kpiPillarScore, 67.08);
});

test('calculateGeneralCriteriaScore sums 30-point pillar and caps at maxGeneralPillar', () => {
  const criteria: GeneralCriterion[] = [
    {
      id: 'c1',
      code: '1.1',
      group: 'I. Chính trị, tư tưởng',
      title: 'Chấp hành chủ trương, đường lối của Đảng',
      maxScore: 6,
      selfScore: 6,
      appraisedScore: 6,
      passed: true,
      note: '',
    },
    {
      id: 'c2',
      code: '1.2',
      group: 'II. Đạo đức, lối sống',
      title: 'Giữ gìn đạo đức công vụ',
      maxScore: 6,
      selfScore: 5.5,
      appraisedScore: 5.5,
      passed: true,
      note: '',
    },
  ];

  const res = calculateGeneralCriteriaScore(criteria, 30);
  assert.equal(res.selfTotal, 11.5);
  assert.equal(res.appraisedTotal, 11.5);
});

test('suggestClassification follows Hướng dẫn 02 & Quy định 366 thresholds', () => {
  assert.equal(
    suggestClassification(90.94, 91.34, true, true),
    'Hoàn thành xuất sắc nhiệm vụ'
  );
  assert.equal(
    suggestClassification(92.0, 93.0, false, true),
    'Hoàn thành tốt nhiệm vụ'
  );
  assert.equal(
    suggestClassification(92.0, 93.0, true, false),
    'Không hoàn thành nhiệm vụ'
  );
  assert.equal(
    suggestClassification(68.0, 65.0, false, true),
    'Hoàn thành nhiệm vụ'
  );
});

test('aggregateFourQuarters summarizes all 4 quarters and counts ratings accurately', () => {
  const summary = aggregateFourQuarters(
    [
      { quarter: 'Q1', score: 89.5, kpiPercent: 89.0, classification: 'Hoàn thành tốt nhiệm vụ' },
      { quarter: 'Q2', score: 91.2, kpiPercent: 92.0, classification: 'Hoàn thành xuất sắc nhiệm vụ' },
      { quarter: 'Q3', score: 92.1, kpiPercent: 93.0, classification: 'Hoàn thành xuất sắc nhiệm vụ' },
      { quarter: 'Q4', score: 90.94, kpiPercent: 91.34, classification: 'Hoàn thành xuất sắc nhiệm vụ' },
    ],
    true,
    true
  );

  assert.equal(summary.averageScore, 90.94);
  assert.equal(summary.excellentQuartersCount, 3);
  assert.equal(summary.goodQuartersCount, 1);
  assert.equal(summary.suggestedYearClassification, 'Hoàn thành xuất sắc nhiệm vụ');
});

test('getAllowedFormsForProfile returns strictly the matching form (02A, 02B, or 02D) plus Mẫu 05, Bảng điểm, Mẫu 01 and Biên bản', () => {
  const forms02A = getAllowedFormsForProfile({ templateType: '02A', hasConcurrentRole: true });
  assert.deepEqual(
    forms02A.map((f) => f.id),
    ['scorecard', 'mau05', '02A', '02C', 'mau01', 'minutes']
  );

  const forms02D = getAllowedFormsForProfile({ templateType: '02D', hasConcurrentRole: false });
  assert.deepEqual(
    forms02D.map((f) => f.id),
    ['scorecard', 'mau05', '02D', 'mau01', 'minutes']
  );
});

test('calculateExcellenceQuota enforces 20% cap on Hoàn thành xuất sắc nhiệm vụ under Quy định 366-QĐ/TW', () => {
  const sampleApprovals: ApprovalRecord[] = [
    {
      id: '1',
      employeeCode: 'CB-01',
      fullName: 'Nguyễn Minh An',
      department: 'Văn phòng',
      position: 'Chánh Văn phòng',
      templateType: '02A',
      hasConcurrentRole: true,
      period: '2026',
      selfGeneralScore: 27,
      selfKpiScore: 63.94,
      selfTotalScore: 90.94,
      kpiPercent: 91.34,
      appraisedGeneralScore: 27,
      appraisedKpiScore: 63.94,
      appraisedTotalScore: 90.94,
      proposedClassification: 'Hoàn thành xuất sắc nhiệm vụ',
      approvedClassification: 'Hoàn thành xuất sắc nhiệm vụ',
      status: 'approved',
      submittedAt: '2026-12-24',
      managerComment: '',
      directorComment: '',
      hasRecognizedInitiative: true,
    },
    {
      id: '2',
      employeeCode: 'CB-02',
      fullName: 'Lê Hoàng Nam',
      department: 'Một cửa',
      position: 'Công chức',
      templateType: '02D',
      hasConcurrentRole: false,
      period: '2026',
      selfGeneralScore: 28,
      selfKpiScore: 64.4,
      selfTotalScore: 92.4,
      kpiPercent: 92.0,
      appraisedGeneralScore: 28,
      appraisedKpiScore: 64.4,
      appraisedTotalScore: 92.4,
      proposedClassification: 'Hoàn thành xuất sắc nhiệm vụ',
      approvedClassification: 'Hoàn thành xuất sắc nhiệm vụ',
      status: 'approved',
      submittedAt: '2026-12-22',
      managerComment: '',
      directorComment: '',
      hasRecognizedInitiative: true,
    },
    {
      id: '3',
      employeeCode: 'CB-03',
      fullName: 'Trần Thị Thu Hà',
      department: 'Nội vụ',
      position: 'Chuyên viên',
      templateType: '02B',
      hasConcurrentRole: false,
      period: '2026',
      selfGeneralScore: 26.5,
      selfKpiScore: 61.6,
      selfTotalScore: 88.1,
      kpiPercent: 88.0,
      appraisedGeneralScore: 26.5,
      appraisedKpiScore: 61.6,
      appraisedTotalScore: 88.1,
      proposedClassification: 'Hoàn thành tốt nhiệm vụ',
      approvedClassification: 'Hoàn thành tốt nhiệm vụ',
      status: 'approved',
      submittedAt: '2026-12-23',
      managerComment: '',
      directorComment: '',
    },
    {
      id: '4',
      employeeCode: 'CB-04',
      fullName: 'Phạm Văn Dũng',
      department: 'Tài chính',
      position: 'Chuyên viên',
      templateType: '02B',
      hasConcurrentRole: false,
      period: '2026',
      selfGeneralScore: 24,
      selfKpiScore: 53.9,
      selfTotalScore: 77.9,
      kpiPercent: 77.0,
      appraisedGeneralScore: 24,
      appraisedKpiScore: 53.9,
      appraisedTotalScore: 77.9,
      proposedClassification: 'Hoàn thành tốt nhiệm vụ',
      approvedClassification: 'Hoàn thành tốt nhiệm vụ',
      status: 'approved',
      submittedAt: '2026-12-21',
      managerComment: '',
      directorComment: '',
    },
  ];

  const quota = calculateExcellenceQuota(sampleApprovals, 20);
  // 4 staff rated Good or Better -> 20% of 4 = 0.8 -> maxAllowedExcellent = 1
  assert.equal(quota.goodOrBetterCount, 4);
  assert.equal(quota.maxAllowedExcellent, 1);
  assert.equal(quota.currentExcellentCount, 2);
  assert.equal(quota.isExceeded, true);
  assert.equal(quota.rankedCandidates[0].fullName, 'Lê Hoàng Nam');

  const emulation = evaluateEmulationTitles(sampleApprovals);
  assert.equal(emulation.ldttCount, 4);
  assert.equal(emulation.cstdCount, 2);
});

test('formatVnNumber and exportTasksToCsvString format data cleanly', () => {
  assert.equal(formatVnNumber(90.94), '90,94');
  const csv = exportTasksToCsvString([]);
  assert.ok(csv.includes('Nhiệm vụ và sản phẩm'));
});

test('extractAdministrativeDocumentOcr extracts docNumber, date, governanceScope and tasks for Party, State and Public Service Center', () => {
  const partyDoc = extractAdministrativeDocumentOcr(
    'Scan_QD-227_DU_Phan_cong_nhiem_vu_Dang_uy_2026.pdf',
    'Số: QĐ-227/QĐ-ĐU ngày 15 tháng 01 năm 2026 của Đảng ủy xã Minh Hòa'
  );
  assert.equal(partyDoc.docNumber, 'QĐ-227/QĐ-ĐU');
  assert.equal(partyDoc.issuedDate, '2026-01-15');
  assert.equal(partyDoc.governanceScope, 'party_org');
  assert.ok(partyDoc.extractedTasks.length >= 1);

  const publicServiceDoc = extractAdministrativeDocumentOcr(
    'Quy_che_danh_gia_vien_chuc_Trung_tam_Dich_vu_tong_hop_QD-88_TTDVTH.pdf',
    'Quy chế đánh giá viên chức và người lao động Trung tâm Dịch vụ tổng hợp ngày 20/02/2026'
  );
  assert.equal(publicServiceDoc.docNumber, 'QĐ-88');
  assert.equal(publicServiceDoc.issuedDate, '2026-02-20');
  assert.equal(publicServiceDoc.governanceScope, 'public_service_center');
  assert.equal(publicServiceDoc.detectedDocType, 'Quy_che_danh_gia_vien_chuc');
  assert.equal(publicServiceDoc.extractedTasks.length, 2);
});

