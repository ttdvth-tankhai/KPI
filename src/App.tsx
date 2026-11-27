import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  FileText,
  UserCheck,
  Briefcase,
  User,
  History,
  ShieldAlert,
  Menu,
  X,
  RotateCcw,
  Users,
  Building2,
  HelpCircle,
} from 'lucide-react';
import {
  calculateWeightedQuarterKpi,
  calculateGeneralCriteriaScore,
  suggestClassification,
  aggregateFourQuarters,
  exportTasksToCsvString,
  formatVnNumber,
  type UserProfile,
  type KpiTask,
  type GeneralCriterion,
  type QuarterSummaryRecord,
  type SelfReviewContent,
  type JobPositionTemplate,
  type ApprovalRecord,
  type HistoricalArchiveItem,
  type NotificationRule,
  type UserRole,
  type RemediationCommitmentItem,
  type CollectiveVoteRecord,
  type AllowedFormTab,
  type LegalBasisDocument,
} from './utils/kpiEngine';
import {
  INITIAL_USER_PROFILE,
  INITIAL_KPI_TASKS,
  INITIAL_GENERAL_CRITERIA,
  INITIAL_QUARTER_RECORDS,
  INITIAL_SELF_REVIEW,
  INITIAL_JOB_POSITIONS,
  INITIAL_APPROVAL_QUEUE,
  INITIAL_HISTORICAL_ARCHIVE,
  INITIAL_NOTIFICATION_RULES,
  INITIAL_REMEDIATION_COMMITMENTS,
  INITIAL_COLLECTIVE_VOTES,
  INITIAL_LEGAL_BASIS_DOCS,
  DEMO_ACCOUNTS,
} from './data/mockKpiData';
import { OverviewTab, type NavTabId } from './components/OverviewTab';
import { PersonalTasksTab } from './components/PersonalTasksTab';
import { SelfEvaluationTab } from './components/SelfEvaluationTab';
import { FormsExportTab } from './components/FormsExportTab';
import { ApprovalsTab } from './components/ApprovalsTab';
import { CollectiveEmulationTab } from './components/CollectiveEmulationTab';
import { JobPositionsTab } from './components/JobPositionsTab';
import { PersonalProfileTab } from './components/PersonalProfileTab';
import { HistoryArchiveTab } from './components/HistoryArchiveTab';
import { AdminPermissionsTab } from './components/AdminPermissionsTab';
import { OfflineIndicator } from './components/DesktopInstallerModal';
import { SectorOnboardingModal } from './components/SectorOnboardingModal';

const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Cán bộ / Công chức',
  manager: 'Trưởng phòng / Chi bộ',
  director: 'Thủ trưởng / Lãnh đạo',
  admin: 'Quản trị hệ thống',
};

const STORAGE_KEY = 'ekpi_tankhai_state_v1';

function loadSavedState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[key] !== undefined ? parsed[key] : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [requestedFormDocId, setRequestedFormDocId] = useState<
    AllowedFormTab['id'] | undefined
  >(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() =>
    loadSavedState('currentRole', 'director')
  );

  // Core Application State with localStorage persistence
  const [profile, setProfile] = useState<UserProfile>(() =>
    loadSavedState('profile', INITIAL_USER_PROFILE)
  );
  const [tasks, setTasks] = useState<KpiTask[]>(() =>
    loadSavedState('tasks', INITIAL_KPI_TASKS)
  );
  const [generalCriteria, setGeneralCriteria] = useState<GeneralCriterion[]>(() =>
    loadSavedState('generalCriteria', INITIAL_GENERAL_CRITERIA)
  );
  const [quarterRecords, setQuarterRecords] = useState<QuarterSummaryRecord[]>(() =>
    loadSavedState('quarterRecords', INITIAL_QUARTER_RECORDS)
  );
  const [selfReview, setSelfReview] = useState<SelfReviewContent>(() =>
    loadSavedState('selfReview', INITIAL_SELF_REVIEW)
  );
  const [remediationPlan, setRemediationPlan] = useState<RemediationCommitmentItem[]>(() =>
    loadSavedState('remediationPlan', INITIAL_REMEDIATION_COMMITMENTS)
  );
  const [jobPositions, setJobPositions] = useState<JobPositionTemplate[]>(() =>
    loadSavedState('jobPositions', INITIAL_JOB_POSITIONS)
  );
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(() =>
    loadSavedState('approvals', INITIAL_APPROVAL_QUEUE)
  );
  const [collectiveVotes, setCollectiveVotes] = useState<CollectiveVoteRecord[]>(() =>
    loadSavedState('collectiveVotes', INITIAL_COLLECTIVE_VOTES)
  );
  const [archiveItems, setArchiveItems] = useState<HistoricalArchiveItem[]>(() =>
    loadSavedState('archiveItems', INITIAL_HISTORICAL_ARCHIVE)
  );
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(() =>
    loadSavedState('notificationRules', INITIAL_NOTIFICATION_RULES)
  );
  const [legalBasisDocs, setLegalBasisDocs] = useState<LegalBasisDocument[]>(() =>
    loadSavedState('legalBasisDocs', INITIAL_LEGAL_BASIS_DOCS)
  );
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [sectorModalTab, setSectorModalTab] = useState<'sector' | 'guide'>('sector');
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenSectorModal = (tab: 'sector' | 'guide') => {
    setSectorModalTab(tab);
    setSectorModalOpen(true);
  };

  // Auto-save to localStorage whenever state updates
  useEffect(() => {
    try {
      const payload = {
        currentRole,
        profile,
        tasks,
        generalCriteria,
        quarterRecords,
        selfReview,
        remediationPlan,
        jobPositions,
        approvals,
        collectiveVotes,
        archiveItems,
        notificationRules,
        legalBasisDocs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [
    currentRole,
    profile,
    tasks,
    generalCriteria,
    quarterRecords,
    selfReview,
    remediationPlan,
    jobPositions,
    approvals,
    collectiveVotes,
    archiveItems,
    notificationRules,
    legalBasisDocs,
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3800);
  };

  // Switch active user account quickly (Demo Multi-Account Switcher)
  const handleSwitchDemoAccount = (employeeCode: string) => {
    const found = DEMO_ACCOUNTS.find((a) => a.profile.employeeCode === employeeCode);
    if (!found) return;
    setProfile(found.profile);
    setCurrentRole(found.role);
    showToast(
      `Đã chuyển sang tài khoản: ${found.profile.fullName} (Mẫu ${found.profile.templateType} — Quyền: ${ROLE_LABELS[found.role]})`
    );
  };

  // Real-time KPI & General Pillar Calculations
  const activePosition = useMemo(
    () =>
      jobPositions.find((p) => p.id === profile.jobPositionId) ||
      jobPositions[0] || { generalMaxScore: 30, kpiMaxScore: 70 },
    [jobPositions, profile.jobPositionId]
  );

  const kpiCalc = useMemo(
    () => calculateWeightedQuarterKpi(tasks, activePosition.kpiMaxScore),
    [tasks, activePosition.kpiMaxScore]
  );

  const generalCalc = useMemo(
    () => calculateGeneralCriteriaScore(generalCriteria, activePosition.generalMaxScore),
    [generalCriteria, activePosition.generalMaxScore]
  );

  const totalScore = useMemo(
    () => Math.round((generalCalc.selfTotal + kpiCalc.kpiPillarScore) * 100) / 100,
    [generalCalc.selfTotal, kpiCalc.kpiPillarScore]
  );

  const suggestedQ4Classification = useMemo(
    () =>
      suggestClassification(
        totalScore,
        kpiCalc.kpiPercentage,
        selfReview.hasBreakthroughProduct,
        selfReview.noDisciplinaryViolation
      ),
    [
      totalScore,
      kpiCalc.kpiPercentage,
      selfReview.hasBreakthroughProduct,
      selfReview.noDisciplinaryViolation,
    ]
  );

  const quarterSummaryList = useMemo(() => {
    return quarterRecords.map((rec) => {
      if (rec.quarter === 'Q4') {
        return {
          quarter: 'Q4' as const,
          score: totalScore,
          kpiPercent: kpiCalc.kpiPercentage,
          classification: suggestedQ4Classification,
        };
      }
      return {
        quarter: rec.quarter,
        score: rec.manualScore,
        kpiPercent: rec.manualKpiPercent,
        classification: rec.manualClassification,
      };
    });
  }, [quarterRecords, totalScore, kpiCalc.kpiPercentage, suggestedQ4Classification]);

  const yearSummary = useMemo(
    () =>
      aggregateFourQuarters(
        quarterSummaryList,
        selfReview.hasBreakthroughProduct,
        selfReview.noDisciplinaryViolation
      ),
    [
      quarterSummaryList,
      selfReview.hasBreakthroughProduct,
      selfReview.noDisciplinaryViolation,
    ]
  );

  const criteriaBreakdown = useMemo(() => {
    if (tasks.length === 0) {
      return { avgA: 0, avgB: 0, avgC: 0, avgD: 0 };
    }
    let sumA = 0;
    let sumB = 0;
    let sumC = 0;
    let sumD = 0;
    for (const t of tasks) {
      sumA += t.criteriaA;
      sumB += t.criteriaB;
      sumC += t.criteriaC;
      sumD += t.criteriaD;
    }
    const n = tasks.length;
    return {
      avgA: Math.round((sumA / n) * 100) / 100,
      avgB: Math.round((sumB / n) * 100) / 100,
      avgC: Math.round((sumC / n) * 100) / 100,
      avgD: Math.round((sumD / n) * 100) / 100,
    };
  }, [tasks]);

  // Handlers
  const handleAddTask = (newTask: KpiTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Đã thêm công việc "${newTask.title}" và cập nhật điểm KPI tự động.`);
  };

  const handleUpdateTask = (updatedTask: KpiTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Đã xóa đầu việc và tính lại tỷ lệ hoàn thành KPI.');
  };

  const handleImportNormTasks = () => {
    const pos = jobPositions.find((p) => p.id === profile.jobPositionId) || jobPositions[0];
    if (!pos || pos.standardNorms.length === 0) return;
    const normToImport = pos.standardNorms[0];
    const importedTask: KpiTask = {
      id: `CV-2026-0${tasks.length + 1}`,
      title: `${normToImport.taskName} (Bổ sung theo định mức ${pos.code})`,
      category: 'Nhiệm vụ trọng tâm',
      productName: `${normToImport.qualityRequirement}`,
      unitName: normToImport.unit,
      quarter: 'Q4',
      assignedQty: 1,
      completedQty: 1,
      weight: normToImport.defaultWeight,
      dueDate: '2026-12-28',
      completedDate: '2026-12-26',
      status: 'completed',
      criteriaA: 1.0,
      criteriaB: 1.0,
      criteriaC: 1.0,
      criteriaD: 1.0,
      evidenceDoc: `NQ-227/ĐU ngày 26/12/2026`,
      selfScored: true,
      digitalEvidence: {
        fileName: `Minh_chung_${pos.code}_2026.pdf`,
        fileSize: '512 KB',
        issuedDate: '2026-12-26',
        eOfficeCode: 'EOFFICE-TK-2026-0999',
        signedAuthority: `${profile.fullName} — ${profile.govRole}`,
        summaryExcerpt: `Hồ sơ minh chứng hoàn thành định mức vị trí việc làm ${pos.title} theo Quy định 366-QĐ/TW.`,
        verifiedSignature: true,
      },
    };
    setTasks((prev) => [importedTask, ...prev]);
    showToast(`Đã nạp đầu việc chuẩn từ định mức vị trí "${pos.title}".`);
  };

  const handleExportCsv = () => {
    const csvContent = exportTasksToCsvString(tasks);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eKPI_TanKhai_Bang_Tinh_KPI_${profile.employeeCode}_2026.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(
      `Đã xuất dữ liệu bảng tính KPI ra file Excel/CSV: eKPI_TanKhai_Bang_Tinh_KPI_${profile.employeeCode}_2026.csv`
    );
  };

  const handleExportDatabaseJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      systemVersion: 'e-KPI TÂN KHAI v2.5',
      currentRole,
      profile,
      tasks,
      generalCriteria,
      quarterRecords,
      selfReview,
      remediationPlan,
      jobPositions,
      approvals,
      collectiveVotes,
      archiveItems,
      notificationRules,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eKPI_TanKhai_CSDL_Backup_${profile.employeeCode}_2026.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã xuất toàn bộ Cơ sở dữ liệu cơ quan ra file dự phòng (.JSON) thành công.');
  };

  const handleImportDatabaseJson = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.generalCriteria) setGeneralCriteria(parsed.generalCriteria);
      if (parsed.quarterRecords) setQuarterRecords(parsed.quarterRecords);
      if (parsed.selfReview) setSelfReview(parsed.selfReview);
      if (parsed.remediationPlan) setRemediationPlan(parsed.remediationPlan);
      if (parsed.jobPositions) setJobPositions(parsed.jobPositions);
      if (parsed.approvals) setApprovals(parsed.approvals);
      if (parsed.collectiveVotes) setCollectiveVotes(parsed.collectiveVotes);
      if (parsed.archiveItems) setArchiveItems(parsed.archiveItems);
      if (parsed.notificationRules) setNotificationRules(parsed.notificationRules);
      showToast('Đã khôi phục toàn bộ Cơ sở dữ liệu từ file JSON thành công!');
    } catch {
      showToast('File JSON không hợp lệ. Vui lòng kiểm tra lại định dạng bản sao lưu.');
    }
  };

  const handleArchiveCurrentYear = () => {
    if (archiveItems.some((i) => i.year === 2026)) return;
    const newArchive: HistoricalArchiveItem = {
      id: 'ARC-2026-AN',
      year: 2026,
      periodLabel: 'Cả năm 2026 (4 Quý)',
      fullName: profile.fullName,
      position: profile.govRole,
      department: profile.department,
      templateType: profile.templateType,
      generalScore: generalCalc.selfTotal,
      kpiScore: kpiCalc.kpiPillarScore,
      totalScore,
      kpiPercent: kpiCalc.kpiPercentage,
      finalClassification: selfReview.proposedLevel,
      approverName: 'Phạm Quốc Tuấn (Bí thư Đảng ủy)',
      archivedDate: '2026-12-26',
      digitalSignatureHash: 'SHA256-9E71A3C85F2D4019-VGCA',
    };
    setArchiveItems((prev) => [newArchive, ...prev]);
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(INITIAL_USER_PROFILE);
    setCurrentRole('director');
    setTasks(INITIAL_KPI_TASKS);
    setGeneralCriteria(INITIAL_GENERAL_CRITERIA);
    setQuarterRecords(INITIAL_QUARTER_RECORDS);
    setSelfReview(INITIAL_SELF_REVIEW);
    setRemediationPlan(INITIAL_REMEDIATION_COMMITMENTS);
    setJobPositions(INITIAL_JOB_POSITIONS);
    setApprovals(INITIAL_APPROVAL_QUEUE);
    setCollectiveVotes(INITIAL_COLLECTIVE_VOTES);
    setArchiveItems(INITIAL_HISTORICAL_ARCHIVE);
    setNotificationRules(INITIAL_NOTIFICATION_RULES);
    showToast('Đã khôi phục dữ liệu mẫu mặc định.');
  };

  const navGroups: {
    groupTitle: string;
    items: { id: NavTabId; label: string; icon: React.ReactNode; badge?: string }[];
  }[] = [
    {
      groupTitle: 'TỔNG QUAN & CÔNG VIỆC',
      items: [
        {
          id: 'overview',
          label: 'Tổng quan KPI',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'tasks',
          label: 'Công việc & Căn cứ OCR',
          icon: <ClipboardList className="w-4 h-4" />,
          badge: `${tasks.length}`,
        },
      ],
    },
    {
      groupTitle: 'ĐÁNH GIÁ KPI & KIỂM ĐIỂM',
      items: [
        {
          id: 'self_eval',
          label: 'Tự đánh giá & Chấm điểm',
          icon: <CheckSquare className="w-4 h-4" />,
        },
        {
          id: 'forms',
          label: 'Mẫu biểu & In báo cáo',
          icon: <FileText className="w-4 h-4" />,
          badge: `Mẫu ${profile.templateType}`,
        },
        {
          id: 'approvals',
          label: 'Thẩm định & Phê duyệt',
          icon: <UserCheck className="w-4 h-4" />,
          badge: `${approvals.length}`,
        },
        {
          id: 'collective',
          label: 'Họp Chi bộ & Thi đua',
          icon: <Users className="w-4 h-4" />,
          badge: '20% XS',
        },
      ],
    },
    {
      groupTitle: 'HỒ SƠ & QUẢN TRỊ ĐƠN VỊ',
      items: [
        {
          id: 'profile',
          label: 'Hồ sơ & Quy chế đơn vị',
          icon: <User className="w-4 h-4" />,
        },
        {
          id: 'positions',
          label: 'Định mức Vị trí việc làm',
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          id: 'history',
          label: 'Lịch sử & Lưu trữ số',
          icon: <History className="w-4 h-4" />,
        },
        {
          id: 'admin',
          label: 'Phân quyền & Hệ thống',
          icon: <ShieldAlert className="w-4 h-4" />,
        },
      ],
    },
  ];

  const activeTabTitle: Record<NavTabId, string> = {
    overview: 'Tổng quan KPI 4 Quý & Kiểm điểm cuối năm',
    tasks: 'Công việc cá nhân, Trích xuất OCR & Kho minh chứng số',
    self_eval: 'Tự đánh giá KPI, Chấm điểm 1 chạm & Kế hoạch khắc phục 2027',
    forms: `Chữ ký số & In mẫu biểu chuẩn A4 (Mẫu ${profile.templateType}, Mẫu 05 & Mẫu 01)`,
    approvals: 'Thẩm định trực tuyến, Phê duyệt & Giải trình 2 chiều',
    collective: 'Khống chế 20% Xuất sắc, Họp Chi bộ & Xét Thi đua - Khen thưởng',
    positions: 'Danh mục Vị trí việc làm & Định mức chuẩn',
    profile: 'Hồ sơ cán bộ & Thiết lập Quy chế đơn vị',
    history: 'Kho lưu trữ lịch sử đánh giá nhiều năm',
    admin: 'Quản trị phân quyền, Nhắc việc & Sao lưu CSDL',
  };

  return (
    <div className="min-h-screen flex bg-[#F7F4F0] text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden no-print"
        />
      )}

      {/* Left Crimson Administrative Sidebar matching Video 1 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#541218] text-rose-50 flex flex-col justify-between transition-transform duration-200 shrink-0 no-print ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                  e-KPI TÂN KHAI
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-300/40 text-[9px] font-extrabold text-amber-200 uppercase">
                  TP. Đồng Nai
                </span>
              </div>
              <div className="text-[10px] text-rose-200/80 font-medium mt-0.5">
                Hệ thống Đánh giá & Kiểm điểm Liên thông
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng menu"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-rose-200 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav aria-label="Điều hướng chính" className="p-3.5 space-y-5 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-rose-300/75 uppercase">
                  {group.groupTitle}
                </div>
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#821D26] text-white shadow-xs border border-white/15'
                          : 'text-rose-100/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono text-amber-200 shrink-0 ml-1">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile, Multi-Account Switcher & Quick Actions in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-[#460E13] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-xs font-extrabold text-amber-200 shrink-0">
              {profile.fullName
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{profile.fullName}</div>
              <div className="text-[11px] text-rose-200/80 truncate">{profile.govRole}</div>
              <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                Hồ sơ: Mẫu {profile.templateType} · {formatVnNumber(totalScore)}đ
              </div>
            </div>
          </div>

          {/* Multi-Account Demo Switcher (02A / 02B / 02D / Leader) */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <label
              htmlFor="sidebar-account-switcher"
              className="block text-[10px] font-bold text-rose-300/90 uppercase"
            >
              Chuyển đổi tài khoản cán bộ:
            </label>
            <select
              id="sidebar-account-switcher"
              data-testid="sidebar-account-switcher"
              value={profile.employeeCode}
              onChange={(e) => handleSwitchDemoAccount(e.target.value)}
              className="w-full px-2 py-1.5 rounded bg-[#5D131A] border border-white/15 text-[11px] font-semibold text-white focus:outline-none cursor-pointer"
            >
              {DEMO_ACCOUNTS.map((acc) => (
                <option key={acc.profile.employeeCode} value={acc.profile.employeeCode}>
                  {acc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-200/80">
            <span className="truncate">Quyền: {ROLE_LABELS[currentRole]}</span>
            <button
              type="button"
              onClick={handleResetDemo}
              title="Khôi phục dữ liệu mẫu"
              className="inline-flex items-center gap-1 text-rose-200 hover:text-white shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header following SaaS Top Bar Contract */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 no-print">
          {/* Left Zone: Mobile toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Mở menu điều hướng"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-semibold text-slate-700 whitespace-nowrap">
                {profile.agencyName}
              </span>
              <span aria-hidden="true">/</span>
              <span className="font-bold text-[#7A1C24] truncate">
                {activeTabTitle[activeTab]}
              </span>
            </div>
          </div>

          {/* Right Zone: Primary action buttons (Clean, non-duplicated) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="topbar-open-sector-btn"
              onClick={() => handleOpenSectorModal('sector')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#7A1C24]" />
              <span>Cấu hình Loại hình Đơn vị</span>
            </button>
            <button
              type="button"
              data-testid="topbar-open-guide-btn"
              onClick={() => handleOpenSectorModal('guide')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>? Hướng dẫn 4 bước</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRequestedFormDocId(profile.templateType);
                setActiveTab('forms');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              In Mẫu {profile.templateType} & PDF
            </button>
          </div>
        </header>

        {/* Global 3-Sector Quick Switcher Bar right under Top Header */}
        <div
          data-testid="global-sector-switcher-bar"
          className="bg-slate-900 text-slate-100 px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800 no-print"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
              Chọn nhanh Khối cơ quan áp dụng:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  {
                    id: 'party_org',
                    label: '1. Khối Đảng - Đoàn thể (QĐ 366)',
                  },
                  {
                    id: 'state_admin',
                    label: '2. Khối Hành chính Nhà nước (NĐ 90 & HD 02)',
                  },
                  {
                    id: 'public_service_center',
                    label: '3. Khối Đơn vị Sự nghiệp công lập (Trường học · Trung tâm · Y tế · KPH)',
                  },
                ] as const
              ).map((sec) => {
                const isActive = (profile.governanceType || 'party_org') === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    data-testid={`quick-sector-btn-${sec.id}`}
                    onClick={() => {
                      setProfile((prev) => ({
                        ...prev,
                        governanceType: sec.id,
                        contractType:
                          sec.id === 'public_service_center'
                            ? 'Hợp đồng làm việc Viên chức'
                            : 'Biên chế công chức',
                        legalBasisDocNumber:
                          sec.id === 'public_service_center'
                            ? prev.legalBasisDocNumber?.includes('SNCL') ||
                              prev.legalBasisDocNumber?.includes('TTDVTH')
                              ? prev.legalBasisDocNumber
                              : 'QĐ-108/QĐ-TTDVTH'
                            : sec.id === 'state_admin'
                            ? 'QĐ-89/QĐ-UBND'
                            : 'QĐ-15/QĐ-ĐU',
                      }));
                      showToast(`Đã chuyển chế độ đánh giá sang: ${sec.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#7A1C24] text-amber-200 border border-amber-300/40 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] font-medium text-slate-300 hidden xl:inline">
            Phường Tân Khai · TP. Đồng Nai ({profile.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU'})
          </span>
        </div>

        {/* Global Toast Feedback */}
        {toastMsg && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between no-print">
            <span>{toastMsg}</span>
            <button
              type="button"
              onClick={() => setToastMsg('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Active View Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              profile={profile}
              totalScore={totalScore}
              generalScore={generalCalc.selfTotal}
              kpiPillarScore={kpiCalc.kpiPillarScore}
              kpiPercentage={kpiCalc.kpiPercentage}
              totalTasks={kpiCalc.totalTasks}
              completedTasks={kpiCalc.completedTasks}
              selfScoredTasks={kpiCalc.selfScoredTasks}
              onTimeTasks={kpiCalc.onTimeTasks}
              onTimePercent={kpiCalc.onTimePercent}
              suggestedLevel={yearSummary.suggestedYearClassification}
              quarterSummaryList={quarterSummaryList}
              criteriaBreakdown={criteriaBreakdown}
              onNavigate={setActiveTab}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'tasks' && (
            <PersonalTasksTab
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onExportCsv={handleExportCsv}
              onImportNormTasks={handleImportNormTasks}
              legalBasisDocs={legalBasisDocs}
              onAddLegalBasisDoc={(newDoc) =>
                setLegalBasisDocs((prev) => [newDoc, ...prev])
              }
            />
          )}

          {activeTab === 'self_eval' && (
            <SelfEvaluationTab
              profile={profile}
              generalCriteria={generalCriteria}
              onUpdateCriterion={(updated) =>
                setGeneralCriteria((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                )
              }
              quarterRecords={quarterRecords}
              onUpdateQuarterRecord={(updated) =>
                setQuarterRecords((prev) =>
                  prev.map((q) => (q.quarter === updated.quarter ? updated : q))
                )
              }
              q4AutoScore={totalScore}
              q4AutoKpiPercent={kpiCalc.kpiPercentage}
              q4AutoClassification={suggestedQ4Classification}
              yearSummary={yearSummary}
              generalScore={generalCalc.selfTotal}
              kpiPillarScore={kpiCalc.kpiPillarScore}
              totalScore={totalScore}
              selfReview={selfReview}
              onUpdateSelfReview={setSelfReview}
              remediationPlan={remediationPlan}
              onUpdateRemediationPlan={setRemediationPlan}
              unscoredTasksCount={Math.max(0, kpiCalc.totalTasks - kpiCalc.selfScoredTasks)}
              onOpenSectorModal={handleOpenSectorModal}
              onProceedToForms={() => {
                setRequestedFormDocId(profile.templateType);
                setActiveTab('forms');
              }}
            />
          )}

          {activeTab === 'forms' && (
            <FormsExportTab
              profile={profile}
              tasks={tasks}
              generalCriteria={generalCriteria}
              selfReview={selfReview}
              remediationPlan={remediationPlan}
              collectiveVotes={collectiveVotes}
              initialDocId={requestedFormDocId}
              generalScore={generalCalc.selfTotal}
              kpiPillarScore={kpiCalc.kpiPillarScore}
              kpiPercentage={kpiCalc.kpiPercentage}
              totalScore={totalScore}
              quarterSummaryList={quarterSummaryList}
              yearAverageScore={yearSummary.averageScore}
              onNavigateProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsTab
              approvals={approvals}
              currentRole={currentRole}
              onUpdateApproval={(updated) => {
                setApprovals((prev) =>
                  prev.map((a) => (a.id === updated.id ? updated : a))
                );
                showToast(
                  `Đã cập nhật kết quả thẩm định & phê duyệt cho hồ sơ ${updated.fullName}.`
                );
              }}
              onNavigateCollective={() => setActiveTab('collective')}
            />
          )}

          {activeTab === 'collective' && (
            <CollectiveEmulationTab
              approvals={approvals}
              onUpdateApproval={(updated) =>
                setApprovals((prev) =>
                  prev.map((a) => (a.id === updated.id ? updated : a))
                )
              }
              onBatchUpdateApprovals={setApprovals}
              collectiveVotes={collectiveVotes}
              onUpdateVoteRecord={(updated) =>
                setCollectiveVotes((prev) =>
                  prev.map((v) => (v.id === updated.id ? updated : v))
                )
              }
              onOpenFormPreview={(docId) => {
                setRequestedFormDocId(docId);
                setActiveTab('forms');
              }}
            />
          )}

          {activeTab === 'positions' && (
            <JobPositionsTab
              jobPositions={jobPositions}
              onUpdateJobPosition={(updated) =>
                setJobPositions((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                )
              }
              onAddJobPosition={(created) => {
                setJobPositions((prev) => [...prev, created]);
                showToast(`Đã tạo vị trí việc làm mới: ${created.title}`);
              }}
            />
          )}

          {activeTab === 'profile' && (
            <PersonalProfileTab
              profile={profile}
              jobPositions={jobPositions}
              onUpdateProfile={setProfile}
              onNavigateForms={() => {
                setRequestedFormDocId(profile.templateType);
                setActiveTab('forms');
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryArchiveTab
              archiveItems={archiveItems}
              profile={profile}
              currentYearScore={totalScore}
              currentYearGeneral={generalCalc.selfTotal}
              currentYearKpi={kpiCalc.kpiPillarScore}
              currentYearKpiPercent={kpiCalc.kpiPercentage}
              currentYearLevel={selfReview.proposedLevel}
              onArchiveCurrentYear={handleArchiveCurrentYear}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPermissionsTab
              currentRole={currentRole}
              onChangeRole={(role) => {
                setCurrentRole(role);
                showToast(`Đã chuyển giao diện phân quyền sang cấp: ${ROLE_LABELS[role]}`);
              }}
              notificationRules={notificationRules}
              onUpdateNotificationRule={(updated) =>
                setNotificationRules((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                )
              }
              onExportDatabaseJson={handleExportDatabaseJson}
              onImportDatabaseJson={handleImportDatabaseJson}
            />
          )}
        </main>
      </div>

      {/* Sector Selection & 4-Step Guide Modal */}
      <SectorOnboardingModal
        isOpen={sectorModalOpen}
        initialTab={sectorModalTab}
        profile={profile}
        onUpdateProfile={setProfile}
        onClose={() => setSectorModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />
    </div>
  );
}
