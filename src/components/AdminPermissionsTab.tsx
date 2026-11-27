import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Mail,
  Smartphone,
  Send,
  CheckCircle2,
  Lock,
  UserCog,
  Database,
  Download,
  Upload,
} from 'lucide-react';
import type { NotificationRule, UserRole } from '../utils/kpiEngine';

interface AdminPermissionsTabProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notificationRules: NotificationRule[];
  onUpdateNotificationRule: (updated: NotificationRule) => void;
  onExportDatabaseJson?: () => void;
  onImportDatabaseJson?: (jsonText: string) => void;
}

interface PermissionMatrixRow {
  module: string;
  action: string;
  staff: boolean;
  manager: boolean;
  director: boolean;
  admin: boolean;
}

const INITIAL_RBAC_MATRIX: PermissionMatrixRow[] = [
  {
    module: 'Công việc cá nhân & Mẫu 05',
    action: 'Tự nhập đầu việc, hệ số và tự chấm 4 tiêu chí A·B·C·D + Đính kèm minh chứng số E-Office',
    staff: true,
    manager: true,
    director: true,
    admin: true,
  },
  {
    module: 'Tự đánh giá & Kiểm điểm',
    action: 'Tổng hợp điểm 4 Quý, Lập Bản kiểm điểm Mẫu 02A/02B/02D & Kế hoạch khắc phục năm 2027',
    staff: true,
    manager: true,
    director: true,
    admin: true,
  },
  {
    module: 'Họp Chi bộ & Bỏ phiếu tín nhiệm',
    action: 'Nhập kết quả kiểm phiếu tín nhiệm, xuất Mẫu 01 Tập thể & Biên bản họp Chi bộ',
    staff: false,
    manager: true,
    director: true,
    admin: true,
  },
  {
    module: 'Thẩm định, Khống chế 20% & Thi đua',
    action: 'Rà soát hạn mức 20% Xuất sắc, điều phối xếp loại và xét danh hiệu Chiến sĩ thi đua cơ sở',
    staff: false,
    manager: true,
    director: true,
    admin: true,
  },
  {
    module: 'Phê duyệt & Ký số ban hành',
    action: 'Ra quyết định xếp loại cuối năm, phản hồi giải trình & Xuất báo cáo PDF tổng hợp',
    staff: false,
    manager: false,
    director: true,
    admin: true,
  },
  {
    module: 'Danh mục & Sao lưu CSDL hệ thống',
    action: 'Cấu hình định mức vị trí việc làm, RBAC, lịch nhắc tự động & Sao lưu/Khôi phục JSON',
    staff: false,
    manager: false,
    director: false,
    admin: true,
  },
];

export const AdminPermissionsTab: React.FC<AdminPermissionsTabProps> = ({
  currentRole,
  onChangeRole,
  notificationRules,
  onUpdateNotificationRule,
  onExportDatabaseJson,
  onImportDatabaseJson,
}) => {
  const [rbacRows, setRbacRows] = useState<PermissionMatrixRow[]>(INITIAL_RBAC_MATRIX);
  const [dispatchLog, setDispatchLog] = useState<
    { id: string; time: string; message: string; channel: string }[]
  >([
    {
      id: 'LOG-1',
      time: '26/12/2026 08:00',
      message: 'Đã gửi tự động 48 thông báo nhắc hoàn thiện Bản kiểm điểm cuối năm 2026.',
      channel: 'Email công vụ & Mobile App Push',
    },
    {
      id: 'LOG-2',
      time: '25/12/2026 07:30',
      message: 'Đã gửi 14 cảnh báo sớm đầu việc Quý IV sắp đến hạn hoàn thành.',
      channel: 'Ứng dụng di động e-KPI Tân Khai',
    },
  ]);
  const [sendSuccessBanner, setSendSuccessBanner] = useState('');

  const togglePermission = (
    rowIndex: number,
    roleKey: 'staff' | 'manager' | 'director' | 'admin'
  ) => {
    setRbacRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, [roleKey]: !row[roleKey] } : row
      )
    );
  };

  const handleTriggerReminderNow = (rule: NotificationRule) => {
    const updated: NotificationRule = {
      ...rule,
      lastSentAt: '2026-12-26 17:05 (Vừa gửi)',
      sentCount: rule.sentCount + 12,
    };
    onUpdateNotificationRule(updated);

    const activeChannels = [
      rule.channels.email ? 'Email công vụ' : null,
      rule.channels.mobilePush ? 'Mobile App Push' : null,
      rule.channels.zaloOa ? 'Tin nhắn nội bộ' : null,
    ]
      .filter(Boolean)
      .join(' + ');

    setDispatchLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        time: '26/12/2026 17:05',
        message: `Phát lệnh nhắc tiến độ: "${rule.title}" tới ${rule.targetRole}.`,
        channel: activeChannels || 'Email công vụ',
      },
      ...prev,
    ]);
    setSendSuccessBanner(
      `Đã gửi thông báo nhắc nhở tiến độ "${rule.title}" qua ${activeChannels || 'Email'} thành công!`
    );
    setTimeout(() => setSendSuccessBanner(''), 4000);
  };

  const handleFileUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportDatabaseJson) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImportDatabaseJson(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản trị Phân quyền, Nhắc việc Tự động & Sao lưu CSDL
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Phân quyền chi tiết theo 4 cấp quản lý, lưu trữ bền vững tự động và sao lưu/khôi phục toàn bộ CSDL cơ quan (.JSON)
          </p>
        </div>

        {/* Live Role Switcher for Testing Permissions */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-300 text-xs">
          <UserCog className="w-4 h-4 text-[#7A1C24]" />
          <label htmlFor="admin-role-switcher" className="font-semibold text-slate-700">
            Cấp quyền đang xem:
          </label>
          <select
            id="admin-role-switcher"
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="font-bold text-[#7A1C24] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="director">Thủ trưởng cơ quan / Bí thư Đảng ủy</option>
            <option value="manager">Trưởng phòng / Bí thư Chi bộ</option>
            <option value="staff">Cán bộ / Công chức / Viên chức</option>
            <option value="admin">Quản trị hệ thống (System Admin)</option>
          </select>
        </div>
      </div>

      {sendSuccessBanner && (
        <div
          data-testid="notification-sent-banner"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sendSuccessBanner}</span>
        </div>
      )}

      {/* Database Backup & Persistent Storage Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
              <Database className="w-4 h-4" />
              <span>LƯU TRỮ DỮ LIỆU BỀN VỮNG & SAO LƯU / KHÔI PHỤC HỒ SƠ CƠ QUAN (.JSON)</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Đồng bộ tự động trên trình duyệt (LocalStorage) & Xuất gói dữ liệu dự phòng toàn đơn vị
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Mọi thao tác chấm điểm KPI, phiếu tín nhiệm Chi bộ, kế hoạch khắc phục năm 2027 và hồ sơ phê duyệt đều được lưu tự động. Quản trị viên có thể kết xuất toàn bộ CSDL ra file JSON để lưu trữ ngoại tuyến hoặc chuyển giao giữa các máy trạm.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onExportDatabaseJson && (
              <button
                type="button"
                onClick={onExportDatabaseJson}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Sao lưu toàn bộ CSDL (.JSON)
              </button>
            )}
            {onImportDatabaseJson && (
              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Khôi phục từ file (.JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUploadRestore}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Automated Email & Mobile App Progress Reminder Rules */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
              <Bell className="w-4 h-4" />
              <span>HỆ THỐNG NHẮC NHỞ TIẾN ĐỘ ĐỊNH KỲ TỰ ĐỘNG (EMAIL & ỨNG DỤNG DI ĐỘNG)</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Cấu hình kịch bản gửi thông báo nhắc hạn chấm KPI và nộp Bản kiểm điểm cuối năm
            </h2>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">
            Trạng thái cổng Email & Push Notification: Đang hoạt động
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {notificationRules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#7A1C24]">
                    {rule.id}
                  </span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        onUpdateNotificationRule({
                          ...rule,
                          enabled: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-[#7A1C24] focus:ring-[#7A1C24]"
                    />
                    <span className="font-semibold text-slate-700">
                      {rule.enabled ? 'Đang bật' : 'Tạm tắt'}
                    </span>
                  </label>
                </div>

                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {rule.title}
                </div>
                <div className="text-slate-600">
                  <strong>Lịch chạy:</strong> {rule.scheduleText}
                </div>
                <div className="text-slate-600">
                  <strong>Đối tượng nhận:</strong> {rule.targetRole}
                </div>

                {/* Channels */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.channels.email}
                      onChange={(e) =>
                        onUpdateNotificationRule({
                          ...rule,
                          channels: { ...rule.channels, email: e.target.checked },
                        })
                      }
                      className="rounded border-slate-300 text-[#7A1C24]"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span>Email công vụ</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.channels.mobilePush}
                      onChange={(e) =>
                        onUpdateNotificationRule({
                          ...rule,
                          channels: { ...rule.channels, mobilePush: e.target.checked },
                        })
                      }
                      className="rounded border-slate-300 text-[#7A1C24]"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ứng dụng di động</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  Đã gửi: {rule.sentCount} lượt
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerReminderNow(rule)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  Gửi nhắc ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Notification Dispatch Log */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-700">
            NHẬT KÝ GỬI THÔNG BÁO EMAIL & MOBILE PUSH GẦN ĐÂY
          </div>
          <div className="space-y-1.5">
            {dispatchLog.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="text-slate-800">
                  <span className="font-mono font-semibold text-slate-500 mr-2">
                    [{log.time}]
                  </span>
                  <span>{log.message}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#7A1C24] shrink-0">
                  Kênh: {log.channel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Detailed RBAC Permission Matrix & Data Security */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
              <Shield className="w-4 h-4" />
              <span>MA TRẬN PHÂN QUYỀN TRUY CẬP CHI TIẾT (RBAC) & BẢO MẬT DỮ LIỆU</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Kiểm soát quyền hạn theo từng cấp quản lý trong cơ quan hành chính nhà nước
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Mã hóa AES-256 & Phân tách dữ liệu theo phòng ban</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="py-3 px-4">Phân hệ nghiệp vụ</th>
                <th className="py-3 px-4">Chức năng / Quyền thao tác</th>
                <th className="py-3 px-3 text-center">1. Cán bộ / Công chức</th>
                <th className="py-3 px-3 text-center">2. Trưởng phòng / Chi bộ</th>
                <th className="py-3 px-3 text-center">3. Thủ trưởng / Ban Thường vụ</th>
                <th className="py-3 px-3 text-center">4. Quản trị (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {rbacRows.map((row, idx) => (
                <tr key={row.module} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.module}</td>
                  <td className="py-3 px-4 text-slate-600">{row.action}</td>
                  {(['staff', 'manager', 'director', 'admin'] as const).map((rKey) => (
                    <td key={rKey} className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Quyền ${row.module} cho ${rKey}`}
                        checked={row[rKey]}
                        onChange={() => togglePermission(idx, rKey)}
                        className="w-4 h-4 rounded border-slate-300 text-[#7A1C24] focus:ring-[#7A1C24] cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
