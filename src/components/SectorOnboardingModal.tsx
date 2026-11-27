import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  X,
  Info,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Wrench,
  Award,
} from 'lucide-react';
import type {
  UserProfile,
  UnitGovernanceType,
  PublicServiceUnitSubtype,
} from '../utils/kpiEngine';

interface SectorOnboardingModalProps {
  isOpen: boolean;
  initialTab?: 'sector' | 'guide';
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PUBLIC_SERVICE_SUBTYPES: {
  id: PublicServiceUnitSubtype;
  label: string;
  defaultAgency: string;
  defaultDoc: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'trung_tam_dich_vu_tong_hop',
    label: 'Trung tâm Dịch vụ tổng hợp / Sự nghiệp kinh tế',
    defaultAgency: 'Trung tâm Dịch vụ tổng hợp xã Minh Hòa',
    defaultDoc: 'QĐ-108/QĐ-TTDVTH',
    desc: 'Cung ứng dịch vụ sự nghiệp công, hạ tầng kỹ thuật, khuyến nông, dịch vụ đô thị.',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 'truong_hoc_giao_duc',
    label: 'Trường học / Cơ sở Giáo dục công lập',
    defaultAgency: 'Trường Trung học cơ sở Minh Hòa',
    defaultDoc: 'QĐ-223/QĐ-SNCL',
    desc: 'Đánh giá Giáo viên, Viên chức giáo dục theo chuẩn nghề nghiệp & KPI tháng/quý (có nút KPH).',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: 'y_te_benh_vien',
    label: 'Bệnh viện / Trung tâm Y tế công lập',
    defaultAgency: 'Trung tâm Y tế khu vực Minh Hòa',
    defaultDoc: 'QĐ-310/QĐ-TTYT',
    desc: 'Đánh giá Y bác sĩ, Viên chức y tế gắn với chỉ số hài lòng người bệnh & tự chủ tài chính.',
    icon: <HeartPulse className="w-4 h-4" />,
  },
  {
    id: 'van_hoa_the_thao',
    label: 'Trung tâm Văn hóa - Thông tin - Thể thao',
    defaultAgency: 'Trung tâm Văn hóa - Thông tin và Thể thao Minh Hòa',
    defaultDoc: 'QĐ-95/QĐ-TTVHTT',
    desc: 'Đánh giá Viên chức tuyên truyền, văn hóa cơ sở, truyền thanh và sự kiện.',
    icon: <Award className="w-4 h-4" />,
  },
  {
    id: 'ban_qlda_su_nghiep_khac',
    label: 'Ban Quản lý dự án / Đơn vị sự nghiệp khác',
    defaultAgency: 'Ban Quản lý Dự án Đầu tư Xây dựng Minh Hòa',
    defaultDoc: 'QĐ-156/QĐ-BQLDA',
    desc: 'Đánh giá Viên chức quản lý dự án, giải ngân đầu tư công, giám sát công trình.',
    icon: <Briefcase className="w-4 h-4" />,
  },
];

export const SectorOnboardingModal: React.FC<SectorOnboardingModalProps> = ({
  isOpen,
  initialTab = 'sector',
  profile,
  onUpdateProfile,
  onClose,
  onShowToast,
}) => {
  const [modalTab, setModalTab] = useState<'sector' | 'guide'>(initialTab);
  const currentGov: UnitGovernanceType = profile.governanceType || 'party_org';
  const currentSubtype: PublicServiceUnitSubtype =
    profile.publicServiceSubtype || 'trung_tam_dich_vu_tong_hop';

  if (!isOpen) return null;

  const handleSelectSector = (govType: UnitGovernanceType) => {
    if (govType === 'party_org') {
      onUpdateProfile({
        ...profile,
        governanceType: 'party_org',
        legalBasisDocNumber: profile.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU',
        contractType: 'Biên chế công chức',
      });
      onShowToast(
        'Đã chuyển sang Khối Đảng - Mặt trận - Đoàn thể (Áp dụng chuẩn Quy định 366-QĐ/TW & Hướng dẫn 02).'
      );
    } else if (govType === 'state_admin') {
      onUpdateProfile({
        ...profile,
        governanceType: 'state_admin',
        legalBasisDocNumber: profile.legalBasisDocNumber || 'QĐ-89/QĐ-UBND',
        contractType: 'Biên chế công chức',
      });
      onShowToast(
        'Đã chuyển sang Khối Cơ quan Hành chính Nhà nước (Áp dụng Nghị định 90/2020/NĐ-CP & Hướng dẫn 02).'
      );
    } else {
      const sub =
        PUBLIC_SERVICE_SUBTYPES.find((s) => s.id === currentSubtype) ||
        PUBLIC_SERVICE_SUBTYPES[0];
      onUpdateProfile({
        ...profile,
        governanceType: 'public_service_center',
        publicServiceSubtype: sub.id,
        legalBasisDocNumber: sub.defaultDoc,
        contractType: 'Hợp đồng làm việc Viên chức',
        citizenSatisfactionRate: profile.citizenSatisfactionRate ?? 96.8,
      });
      onShowToast(
        `Đã chuyển sang Khối Đơn vị Sự nghiệp công lập (${sub.label}) — Đã bật chế độ chấm 6 mức (1 · 0,75 · 0,5 · 0,25 · 0 · KPH).`
      );
    }
  };

  const handleSelectPublicSubtype = (subId: PublicServiceUnitSubtype) => {
    const sub =
      PUBLIC_SERVICE_SUBTYPES.find((s) => s.id === subId) || PUBLIC_SERVICE_SUBTYPES[0];
    onUpdateProfile({
      ...profile,
      governanceType: 'public_service_center',
      publicServiceSubtype: sub.id,
      agencyName: sub.defaultAgency,
      legalBasisDocNumber: sub.defaultDoc,
      contractType: 'Hợp đồng làm việc Viên chức',
      citizenSatisfactionRate: profile.citizenSatisfactionRate ?? 96.8,
    });
    onShowToast(
      `Đã áp dụng cấu hình Đơn vị Sự nghiệp công lập: ${sub.defaultAgency} (${sub.defaultDoc}).`
    );
  };

  return (
    <div
      data-testid="sector-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-[#541218] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Chọn Khối Cơ Quan & Cẩm Nang Tự Đánh Giá KPI (4 Bước · 10 Phút)
              </h2>
              <p className="text-xs text-rose-200/90">
                Hệ thống tự động điều chỉnh thang chấm, công thức quy đổi KPH và bộ mẫu biểu theo đúng khối cơ quan của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-3">
          <button
            type="button"
            data-testid="modal-tab-sector"
            onClick={() => setModalTab('sector')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-t border-x transition-colors cursor-pointer flex items-center gap-2 ${
              modalTab === 'sector'
                ? 'bg-white text-[#7A1C24] border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. Chọn Khối Cơ Quan (Đảng · Nhà nước · Đơn vị Sự nghiệp công lập)
          </button>
          <button
            type="button"
            data-testid="modal-tab-guide"
            onClick={() => setModalTab('guide')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-t border-x transition-colors cursor-pointer flex items-center gap-2 ${
              modalTab === 'guide'
                ? 'bg-white text-[#7A1C24] border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            2. ? Hướng dẫn Tự đánh giá KPI (4 bước & Lưu ý KPH khác Mức 0)
          </button>
        </div>

        {/* Tab 1: Sector & Unit Subtype Selector */}
        {modalTab === 'sector' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Block 1: Party Org */}
              <button
                type="button"
                data-testid="select-sector-party"
                onClick={() => handleSelectSector('party_org')}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  currentGov === 'party_org'
                    ? 'border-[#7A1C24] bg-rose-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7A1C24] text-white text-[11px] font-extrabold">
                      <Landmark className="w-3.5 h-3.5" /> 1. KHỐI ĐẢNG - ĐOÀN THỂ
                    </span>
                    {currentGov === 'party_org' && (
                      <CheckCircle2 className="w-4 h-4 text-[#7A1C24]" />
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Cơ quan Đảng, MTTQ & Đoàn thể chính trị - xã hội
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Áp dụng chuẩn <strong>Quy định 366-QĐ/TW, Hướng dẫn 02 & Quy định 227</strong>. Phần I (30đ) chấm theo chuẩn <em>Đảm bảo / Không đảm bảo</em>; xuất <strong>Mẫu 02A, 02B, 02C, Mẫu 05</strong>.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] font-bold text-[#7A1C24]">
                  {currentGov === 'party_org' ? '● Đang áp dụng khối này' : 'Bấm để chọn Khối Đảng →'}
                </div>
              </button>

              {/* Block 2: State Admin */}
              <button
                type="button"
                data-testid="select-sector-state"
                onClick={() => handleSelectSector('state_admin')}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  currentGov === 'state_admin'
                    ? 'border-amber-700 bg-amber-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-700 text-white text-[11px] font-extrabold">
                      <Building2 className="w-3.5 h-3.5" /> 2. KHỐI NHÀ NƯỚC
                    </span>
                    {currentGov === 'state_admin' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Cơ quan Hành chính Nhà nước (Sở, Phòng, UBND)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Liên thông <strong>Nghị định 90/2020/NĐ-CP, 48/2023/NĐ-CP & Hướng dẫn 02</strong>. Chấm 4 tiêu chí A·B·C·D theo trọng số công việc; xuất <strong>Mẫu 02D (hoặc 02A/02B nếu là Đảng viên)</strong>.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] font-bold text-amber-800">
                  {currentGov === 'state_admin'
                    ? '● Đang áp dụng khối này'
                    : 'Bấm để chọn Khối Nhà nước →'}
                </div>
              </button>

              {/* Block 3: Public Service Units (All types) */}
              <button
                type="button"
                data-testid="select-sector-public-service"
                onClick={() => handleSelectSector('public_service_center')}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  currentGov === 'public_service_center'
                    ? 'border-emerald-700 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-extrabold">
                      <Briefcase className="w-3.5 h-3.5" /> 3. ĐƠN VỊ SỰ NGHIỆP
                    </span>
                    {currentGov === 'public_service_center' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Các Đơn vị Sự nghiệp công lập (Trường học, Trung tâm, Y tế...)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mở khóa thanh chấm 1 chạm <strong>6 mức (1 · 0,75 · 0,5 · 0,25 · 0 · KPH tự quy về thang 30)</strong>, tính hệ số tự chủ tài chính (NĐ 60/2021) và xuất <strong>Phiếu ĐG Viên chức & NLĐ</strong>.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] font-bold text-emerald-800">
                  {currentGov === 'public_service_center'
                    ? '● Đang áp dụng khối này'
                    : 'Bấm để chọn Khối Sự nghiệp →'}
                </div>
              </button>
            </div>

            {/* Subtype configuration when Block 3 (Public Service Unit) is selected */}
            {currentGov === 'public_service_center' && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase text-emerald-800">
                      TÙY CHỌN LOẠI HÌNH ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP (ÁP DỤNG CHO MỌI ĐƠN VỊ)
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Chọn mô hình Đơn vị sự nghiệp công lập của bạn (hoặc tự nhập tên đơn vị):
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold">
                    Đã bật nút KPH (Tự quy về thang 30)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PUBLIC_SERVICE_SUBTYPES.map((sub) => {
                    const active = currentSubtype === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectPublicSubtype(sub.id)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? 'border-emerald-700 bg-white shadow-xs ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-white/80 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                          {sub.icon}
                          <span>{sub.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{sub.desc}</p>
                        <div className="mt-1.5 text-[10px] font-mono text-emerald-700 font-bold">
                          Mẫu căn cứ: {sub.defaultDoc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80">
                  <div>
                    <label
                      htmlFor="modal-agency-name"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Tên Đơn vị sự nghiệp công lập (In trên Quốc hiệu / Tiêu đề phiếu):
                    </label>
                    <input
                      id="modal-agency-name"
                      type="text"
                      value={profile.agencyName}
                      onChange={(e) =>
                        onUpdateProfile({ ...profile, agencyName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="modal-regulation-doc"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Số hiệu Quy chế đánh giá Viên chức & NLĐ của Đơn vị:
                    </label>
                    <input
                      id="modal-regulation-doc"
                      type="text"
                      value={profile.legalBasisDocNumber || ''}
                      onChange={(e) =>
                        onUpdateProfile({ ...profile, legalBasisDocNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 4-Step Guide & KPH vs 0 Explanation (From Video 3) */}
        {modalTab === 'guide' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="rounded-xl bg-rose-50/70 border border-rose-200 p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#7A1C24] text-white text-[10px] font-extrabold uppercase">
                  <Sparkles className="w-3 h-3" /> Cẩm nang có sẵn ngay trong phần mềm
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Lần đầu tự đánh giá KPI — Bắt đầu từ đâu? (4 bước · Khoảng 10 phút)
                </h3>
                <p className="text-xs text-slate-600">
                  Hướng dẫn từng bước từ lúc mở phiếu đến khi xuất Bản kiểm điểm & Phiếu đánh giá A4 trình ký.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C24] text-white text-xs font-extrabold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Bước 1: Chọn Khối cơ quan & Thiết lập Hồ sơ
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Chọn đúng Khối cơ quan (<strong>Đảng</strong>, <strong>Hành chính Nhà nước</strong> hoặc <strong>Đơn vị Sự nghiệp công lập</strong>) và mẫu biểu (02A, 02B, 02D). Phần mềm tự lọc đúng bộ mẫu của bạn.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C24] text-white text-xs font-extrabold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Bước 2: Phần I — Rà soát Tiêu chí chung (Tối đa 30 điểm)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Bấm <strong>ⓘ Cách chấm</strong> ở từng tiêu chí để đọc nội dung đánh giá. Chạm 1 mức điểm (hoặc <em>Đảm bảo / Không đảm bảo</em>), tên mức và số điểm sẽ hiện ngay bên dưới.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C24] text-white text-xs font-extrabold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Bước 3: Phần II — Chấm từng đầu việc KPI (Tối đa 70 điểm)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Mỗi đầu việc có Hệ số độ khó (<code>1,0 · 1,5 · 2,0</code>) và 4 tiêu chí <em>A. Số lượng, B. Chất lượng, C. Tiến độ, D. Điều hành</em>. Chạm mức <code>1 · 0,75 · 0,5 · 0,25 · 0</code> để tự tính điểm B.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C24] text-white text-xs font-extrabold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Bước 4: Lưu bản tự đánh giá → Xuất Word / PDF A4 trình ký
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Kiểm tra thanh trạng thái đầu phiếu báo <strong>Đã chấm đủ (Còn 0 ô)</strong>, bấm Lưu và chuyển sang mục <strong>Mẫu biểu</strong> để xuất ngay file Word/PDF chuẩn thể thức.
                </p>
              </div>
            </div>

            {/* KPH vs 0 Comparison Card matching Video 3 */}
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-950">
                <Info className="w-4 h-4 text-amber-700" />
                <span>
                  LƯU Ý QUAN TRỌNG CHO ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP: PHÂN BIỆT "KPH" KHÁC MỨC "0"
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-extrabold">
                      KPH
                    </span>
                    <span className="font-bold text-amber-300">
                      Không phát sinh / Không thuộc nhiệm vụ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    → <strong>Không trừ điểm, không tính vào mẫu số</strong>. Phần mềm tự động quy đổi tổng điểm các tiêu chí còn lại về đúng thang 30 điểm (Ví dụ: <code>27,5 / 28 × 30 = 29,46 / 30 điểm</code>).
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-950 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-extrabold">
                      Mức 0
                    </span>
                    <span className="font-bold text-red-800">Không đạt / Vi phạm tiêu chí</span>
                  </div>
                  <p className="text-[11px] text-red-800 leading-relaxed">
                    → <strong>Nhận 0 điểm và VẪN TÍNH VÀO MẪU SỐ</strong>. Chỉ chọn mức 0 khi tiêu chí đó thuộc nhiệm vụ bắt buộc nhưng cá nhân không thực hiện hoặc có vi phạm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Đang áp dụng:{' '}
            <strong className="text-slate-900">
              {currentGov === 'party_org'
                ? '1. Khối Đảng - Đoàn thể (Quy định 366-QĐ/TW)'
                : currentGov === 'state_admin'
                ? '2. Khối Hành chính Nhà nước (Nghị định 90 & HD 02)'
                : '3. Khối Đơn vị Sự nghiệp công lập (Chấm 6 mức có KPH & Tự chủ)'}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#7A1C24] text-white text-xs font-bold hover:bg-[#61151C] cursor-pointer"
          >
            Áp dụng & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
