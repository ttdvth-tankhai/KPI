import React, { useState } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  Building2,
  Shield,
  FileCheck,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';
import {
  calculatePublicServiceEvaluation,
  formatVnNumber,
  type UserProfile,
  type FormTemplateType,
  type JobPositionTemplate,
  type UnitGovernanceType,
} from '../utils/kpiEngine';

interface PersonalProfileTabProps {
  profile: UserProfile;
  jobPositions: JobPositionTemplate[];
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateForms: () => void;
}

export const PersonalProfileTab: React.FC<PersonalProfileTabProps> = ({
  profile,
  jobPositions,
  onUpdateProfile,
  onNavigateForms,
}) => {
  const [savedBanner, setSavedBanner] = useState(false);

  const handleFieldChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    onUpdateProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleGovernanceTypeSelect = (govType: UnitGovernanceType) => {
    let defaultDoc = profile.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU';
    let defaultContract = profile.contractType || 'Biên chế công chức';
    let defaultPosId = profile.jobPositionId;

    if (govType === 'public_service_center') {
      defaultDoc = 'QĐ-108/QĐ-TTDVTH';
      defaultContract = 'Hợp đồng làm việc Viên chức';
      defaultPosId = 'pos-public-service-center';
    } else if (govType === 'party_org') {
      defaultDoc = 'QĐ-15/QĐ-ĐU';
      defaultContract = 'Biên chế công chức';
    } else {
      defaultDoc = 'QĐ-89/QĐ-UBND';
      defaultContract = 'Biên chế công chức';
    }

    onUpdateProfile({
      ...profile,
      governanceType: govType,
      legalBasisDocNumber: defaultDoc,
      contractType: defaultContract,
      jobPositionId: defaultPosId,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const activeGovernance: UnitGovernanceType = profile.governanceType || 'party_org';
  const publicServicePreview = calculatePublicServiceEvaluation(
    91.5,
    92.0,
    profile.citizenSatisfactionRate ?? 96.8,
    'Hoàn thành xuất sắc nhiệm vụ'
  );

  return (
    <div className="space-y-6">
      {/* Header matching Video 1 (0:58) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hồ sơ cá nhân & Thiết lập Khung Quy chế Liên thông (Đảng · Nhà nước · Sự nghiệp)
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            1 Nền tảng Liên thông — 3 Khung Quy chế: Dùng chung 1 bảng sản phẩm Mẫu 05 để xuất đồng thời Mẫu kiểm điểm Đảng và Phiếu đánh giá Công chức / Viên chức
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateForms}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Mở Mẫu {profile.templateType} & Phiếu liên thông</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedBanner && (
        <div
          data-testid="profile-saved-banner"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Đã lưu hồ sơ cán bộ. Hệ thống đã đồng bộ Khung quy chế và bộ lọc Mẫu biểu sang{' '}
            <strong>Mẫu {profile.templateType}</strong>{' '}
            {profile.hasConcurrentRole ? '+ Mẫu 02C (Kiêm nhiệm)' : ''} + Mẫu 05{' '}
            {activeGovernance === 'public_service_center'
              ? '+ Phiếu ĐG Viên chức & NLĐ (Quy chế TT Dịch vụ tổng hợp)'
              : ''}.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#7A1C24]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Thiết lập Mô hình Cơ quan, Căn cứ Giao việc và Nhóm đối tượng kiểm điểm
              </h2>
              <p className="text-xs text-slate-500">
                Chỉ cần nhập bảng kê sản phẩm (Mẫu 05) 1 lần để sử dụng liên thông cho cả đánh giá Đảng viên và đánh giá Công chức / Viên chức
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#7A1C24] bg-rose-50 border border-rose-200 px-3 py-1 rounded-md">
            1 NỀN TẢNG — 3 KHUNG QUY CHẾ
          </span>
        </div>

        {/* NEW SECTION: 1 Platform - 3 Governance Frameworks Selector */}
        <div
          data-testid="governance-framework-selector"
          className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A1C24]">
                <Layers className="w-4 h-4" />
                <span>KHUNG QUY CHẾ QUẢN LÝ & CĂN CỨ ĐÁNH GIÁ CỦA ĐƠN VỊ</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Lựa chọn mô hình đơn vị để phần mềm áp dụng đúng quy chế chấm điểm, chỉ số hài lòng và biểu mẫu đầu ra
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(
              [
                {
                  id: 'party_org' as UnitGovernanceType,
                  title: '1. Khối Đảng - Đoàn thể',
                  basis: 'Quy định 366-QĐ/TW & Hướng dẫn 02',
                  desc: 'Áp dụng cho cơ quan chuyên trách tham mưu giúp việc của Đảng, MTTQ và các đoàn thể chính trị - xã hội.',
                },
                {
                  id: 'state_admin' as UnitGovernanceType,
                  title: '2. Cơ quan Hành chính Nhà nước',
                  basis: 'Liên thông QĐ 366 & Nghị định 90/2020/NĐ-CP',
                  desc: 'Áp dụng cho công chức UBND, phòng chuyên môn, Bộ phận Một cửa; liên thông đánh giá công chức & kiểm điểm Đảng viên.',
                },
                {
                  id: 'public_service_center' as UnitGovernanceType,
                  title: '3. Đơn vị Sự nghiệp công lập (TT Dịch vụ tổng hợp)',
                  basis: 'Quy chế đánh giá Viên chức & NLĐ riêng + NĐ 60/2021',
                  desc: 'Áp dụng cho Trung tâm Dịch vụ tổng hợp: gắn định mức sản phẩm dịch vụ công, chỉ số hài lòng người dân (≥95%) & hệ số thu nhập tăng thêm.',
                },
              ] as const
            ).map((fw) => {
              const isSelected = activeGovernance === fw.id;
              return (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => handleGovernanceTypeSelect(fw.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-[#7A1C24] shadow-xs'
                      : 'bg-white/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{fw.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7A1C24] shrink-0" />}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#7A1C24] mt-1">
                    {fw.basis}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{fw.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Specific fields for Legal Basis Decision, Contract Type & Public Service Citizen Satisfaction */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label
                htmlFor="prof-legal-basis"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Văn bản Căn cứ Phân công / Quy chế gốc:
              </label>
              <input
                id="prof-legal-basis"
                type="text"
                value={profile.legalBasisDocNumber || 'QĐ-15/QĐ-ĐU'}
                onChange={(e) => handleFieldChange('legalBasisDocNumber', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="prof-contract-type"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Loại hình Biên chế / Hợp đồng làm việc:
              </label>
              <select
                id="prof-contract-type"
                value={profile.contractType || 'Biên chế công chức'}
                onChange={(e) =>
                  handleFieldChange(
                    'contractType',
                    e.target.value as UserProfile['contractType']
                  )
                }
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
              >
                <option value="Biên chế công chức">Biên chế Cán bộ / Công chức</option>
                <option value="Hợp đồng làm việc Viên chức">
                  Hợp đồng làm việc Viên chức (Đơn vị sự nghiệp)
                </option>
                <option value="Hợp đồng lao động (NĐ 111/2022)">
                  Người lao động Hợp đồng (Nghị định 111/2022/NĐ-CP)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="prof-satisfaction"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Chỉ số hài lòng người dân / tổ chức (%):
              </label>
              <input
                id="prof-satisfaction"
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={profile.citizenSatisfactionRate ?? 96.8}
                onChange={(e) =>
                  handleFieldChange('citizenSatisfactionRate', Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {activeGovernance === 'public_service_center' && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950">
                <Award className="w-4 h-4 text-[#7A1C24] shrink-0" />
                <span>
                  <strong>Cơ chế tự chủ Trung tâm Dịch vụ tổng hợp ({profile.legalBasisDocNumber || 'QĐ-108/QĐ-TTDVTH'}):</strong>{' '}
                  {publicServicePreview.autonomyNote}
                </span>
              </div>
              <span className="font-mono font-bold text-[#7A1C24] shrink-0">
                Hệ số thu nhập tăng thêm: {formatVnNumber(publicServicePreview.bonusCoefficient, 1)}x
              </span>
            </div>
          )}
        </div>

        {/* Highlight Box: Nhóm đối tượng áp dụng mẫu kiểm điểm cuối năm matching Video 1 (1:00) */}
        <div className="p-5 rounded-xl bg-rose-50/50 border-2 border-[#7A1C24]/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <label
                htmlFor="profile-template-select"
                className="block text-sm font-bold text-[#7A1C24]"
              >
                Nhóm đối tượng áp dụng mẫu kiểm điểm cuối năm (Quy định 366 & Hướng dẫn 02) *
              </label>
              <p className="text-xs text-slate-600 mt-0.5">
                Viên chức Trung tâm Dịch vụ tổng hợp là Đảng viên chọn Mẫu 02A/02B; Viên chức và Người lao động ngoài Đảng chọn Mẫu 02D
              </p>
            </div>
            <span
              data-testid="active-profile-template-badge"
              className="text-xs font-mono font-bold text-white bg-[#7A1C24] px-3 py-1.5 rounded-lg shrink-0"
            >
              Đang áp dụng: Mẫu {profile.templateType}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(
              [
                {
                  code: '02A' as FormTemplateType,
                  title: 'Mẫu 02A — Cán bộ lãnh đạo, quản lý',
                  desc: 'Dành cho cán bộ giữ chức vụ lãnh đạo, quản lý trong cấp ủy, chính quyền, Giám đốc/Phó Giám đốc Trung tâm sự nghiệp.',
                },
                {
                  code: '02B' as FormTemplateType,
                  title: 'Mẫu 02B — Đảng viên không giữ chức vụ',
                  desc: 'Dành cho đảng viên là công chức, viên chức chuyên môn không giữ chức vụ lãnh đạo, quản lý.',
                },
                {
                  code: '02D' as FormTemplateType,
                  title: 'Mẫu 02D — Công chức, Viên chức & NLĐ ngoài Đảng',
                  desc: 'Dành cho công chức, viên chức sự nghiệp và người lao động không phải là đảng viên.',
                },
              ] as const
            ).map((opt) => {
              const isSelected = profile.templateType === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleFieldChange('templateType', opt.code)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-[#7A1C24] shadow-xs'
                      : 'bg-white/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#7A1C24]">{opt.title}</span>
                    {isSelected && <FileCheck className="w-4 h-4 text-[#7A1C24]" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="profile-template-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Hoặc chọn nhanh từ danh sách biểu mẫu quy định:
              </label>
              <select
                id="profile-template-select"
                value={profile.templateType}
                onChange={(e) =>
                  handleFieldChange('templateType', e.target.value as FormTemplateType)
                }
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              >
                <option value="02A">Mẫu 02A — Cán bộ giữ chức vụ lãnh đạo, quản lý</option>
                <option value="02B">Mẫu 02B — Đảng viên không giữ chức vụ lãnh đạo, quản lý</option>
                <option value="02D">Mẫu 02D — Công chức, viên chức, NLĐ không phải là đảng viên</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hasConcurrentRole}
                  onChange={(e) => handleFieldChange('hasConcurrentRole', e.target.checked)}
                  className="rounded border-slate-300 text-[#7A1C24] focus:ring-[#7A1C24]"
                />
                <span>Có giữ chức vụ kiêm nhiệm (Tự động bật thêm Mẫu 02C)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Fields Grid matching Video 1 (1:00) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label htmlFor="prof-fullname" className="block font-semibold text-slate-700 mb-1">
              Họ và tên cán bộ / viên chức *
            </label>
            <input
              id="prof-fullname"
              type="text"
              value={profile.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24] font-semibold"
            />
          </div>

          <div>
            <label htmlFor="prof-dob" className="block font-semibold text-slate-700 mb-1">
              Ngày sinh
            </label>
            <input
              id="prof-dob"
              type="date"
              value={profile.dob}
              onChange={(e) => handleFieldChange('dob', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#7A1C24]"
            />
          </div>

          <div>
            <label htmlFor="prof-code" className="block font-semibold text-slate-700 mb-1">
              Mã hồ sơ CBCC / Viên chức
            </label>
            <input
              id="prof-code"
              type="text"
              value={profile.employeeCode}
              onChange={(e) => handleFieldChange('employeeCode', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#7A1C24]"
            />
          </div>

          <div>
            <label htmlFor="prof-agency" className="block font-semibold text-slate-700 mb-1">
              Tên đơn vị / Cơ quan / Trung tâm sự nghiệp *
            </label>
            <input
              id="prof-agency"
              type="text"
              value={profile.agencyName}
              onChange={(e) => handleFieldChange('agencyName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
            />
          </div>

          <div>
            <label htmlFor="prof-dept" className="block font-semibold text-slate-700 mb-1">
              Bộ phận công tác / Tổ chuyên môn
            </label>
            <input
              id="prof-dept"
              type="text"
              value={profile.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
            />
          </div>

          <div>
            <label htmlFor="prof-jobpos" className="block font-semibold text-slate-700 mb-1">
              Vị trí việc làm (Liên kết định mức KPI)
            </label>
            <select
              id="prof-jobpos"
              value={profile.jobPositionId}
              onChange={(e) => handleFieldChange('jobPositionId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
            >
              {jobPositions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title} ({pos.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Party & Government Roles Section */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-[#7A1C24]" />
            <span>THÔNG TIN CHỨC VỤ ĐẢNG, CHÍNH QUYỀN / SỰ NGHIỆP, ĐOÀN THỂ & KIÊM NHIỆM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="prof-partybranch" className="block font-semibold text-slate-700 mb-1">
                Chi bộ sinh hoạt (Mẫu 02A / 02B)
              </label>
              <input
                id="prof-partybranch"
                type="text"
                value={profile.partyBranch}
                onChange={(e) => handleFieldChange('partyBranch', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>

            <div>
              <label htmlFor="prof-partycomm" className="block font-semibold text-slate-700 mb-1">
                Đảng bộ cơ sở / Cơ quan chủ quản
              </label>
              <input
                id="prof-partycomm"
                type="text"
                value={profile.partyCommittee}
                onChange={(e) => handleFieldChange('partyCommittee', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>

            <div>
              <label htmlFor="prof-partyrole" className="block font-semibold text-slate-700 mb-1">
                Chức vụ Đảng
              </label>
              <input
                id="prof-partyrole"
                type="text"
                value={profile.partyRole}
                onChange={(e) => handleFieldChange('partyRole', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>

            <div>
              <label htmlFor="prof-govrole" className="block font-semibold text-slate-700 mb-1">
                Chức vụ chính quyền / Chức danh nghề nghiệp viên chức *
              </label>
              <input
                id="prof-govrole"
                type="text"
                value={profile.govRole}
                onChange={(e) => handleFieldChange('govRole', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>

            <div>
              <label htmlFor="prof-unionrole" className="block font-semibold text-slate-700 mb-1">
                Chức vụ đoàn thể
              </label>
              <input
                id="prof-unionrole"
                type="text"
                value={profile.unionRole}
                onChange={(e) => handleFieldChange('unionRole', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>

            <div>
              <label htmlFor="prof-concurrent" className="block font-semibold text-slate-700 mb-1">
                Chức vụ kiêm nhiệm (Hiển thị trong Mẫu 02C)
              </label>
              <input
                id="prof-concurrent"
                type="text"
                value={profile.concurrentRole}
                onChange={(e) => handleFieldChange('concurrentRole', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#7A1C24]"
              />
            </div>
          </div>
        </div>

        {/* Contact Info for Automated Email & Mobile Reminders */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="prof-email" className="block font-semibold text-slate-700 mb-1">
              Email công vụ (Nhận thông báo nhắc tiến độ & kết quả phê duyệt)
            </label>
            <input
              id="prof-email"
              type="email"
              value={profile.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#7A1C24]"
            />
          </div>
          <div>
            <label htmlFor="prof-phone" className="block font-semibold text-slate-700 mb-1">
              Số điện thoại / Ứng dụng di động
            </label>
            <input
              id="prof-phone"
              type="text"
              value={profile.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#7A1C24]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Dữ liệu hồ sơ cán bộ được mã hóa và phân quyền theo quy chế bảo mật nhà nước</span>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu hồ sơ
          </button>
        </div>
      </form>
    </div>
  );
};
