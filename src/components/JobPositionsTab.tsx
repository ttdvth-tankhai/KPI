import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Sliders,
  Trash2,
} from 'lucide-react';
import {
  formatVnNumber,
  type JobPositionTemplate,
  type FormTemplateType,
} from '../utils/kpiEngine';

interface JobPositionsTabProps {
  jobPositions: JobPositionTemplate[];
  onUpdateJobPosition: (updated: JobPositionTemplate) => void;
  onAddJobPosition: (created: JobPositionTemplate) => void;
}

export const JobPositionsTab: React.FC<JobPositionsTabProps> = ({
  jobPositions,
  onUpdateJobPosition,
  onAddJobPosition,
}) => {
  const [selectedId, setSelectedId] = useState<string>(jobPositions[0]?.id || 'pos-leader-vp');
  const [newTaskNormName, setNewTaskNormName] = useState('');
  const [newTaskNormUnit, setNewTaskNormUnit] = useState('Văn bản / Báo cáo');
  const [newTaskNormWeight, setNewTaskNormWeight] = useState(1.5);
  const [newTaskNormReq, setNewTaskNormReq] = useState(
    'Đúng thể thức hành chính, trình đúng hạn quy định'
  );
  const [notice, setNotice] = useState('');

  // New position form
  const [showNewPosModal, setShowNewPosModal] = useState(false);
  const [posTitle, setPosTitle] = useState('');
  const [posCode, setPosCode] = useState('VTVL-CV-04');
  const [posDept, setPosDept] = useState('Khối Chuyên môn nghiệp vụ');
  const [posTemplate, setPosTemplate] = useState<FormTemplateType>('02B');

  const activePosition =
    jobPositions.find((p) => p.id === selectedId) || jobPositions[0];

  const handleAddNorm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskNormName.trim() || !activePosition) return;
    const updated: JobPositionTemplate = {
      ...activePosition,
      standardNorms: [
        ...activePosition.standardNorms,
        {
          taskName: newTaskNormName.trim(),
          unit: newTaskNormUnit.trim() || 'Sản phẩm',
          defaultWeight: Number(newTaskNormWeight) || 1.0,
          qualityRequirement: newTaskNormReq.trim() || 'Đạt chuẩn chất lượng đầu ra',
        },
      ],
    };
    onUpdateJobPosition(updated);
    setNewTaskNormName('');
    setNotice(`Đã thêm định mức sản phẩm mới vào vị trí "${activePosition.title}".`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDeleteNorm = (index: number) => {
    if (!activePosition) return;
    const updated: JobPositionTemplate = {
      ...activePosition,
      standardNorms: activePosition.standardNorms.filter((_, i) => i !== index),
    };
    onUpdateJobPosition(updated);
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle.trim()) return;
    const created: JobPositionTemplate = {
      id: `pos-${Date.now()}`,
      title: posTitle.trim(),
      code: posCode.trim() || 'VTVL-MỚI',
      departmentType: posDept.trim(),
      defaultTemplate: posTemplate,
      generalMaxScore: 30,
      kpiMaxScore: 70,
      standardNorms: [
        {
          taskName: 'Thực hiện nhiệm vụ chuyên môn theo phân công của Trưởng đơn vị',
          unit: 'Hồ sơ / Báo cáo',
          defaultWeight: 1.0,
          qualityRequirement: 'Hoàn thành 100% đúng hạn',
        },
      ],
    };
    onAddJobPosition(created);
    setSelectedId(created.id);
    setPosTitle('');
    setShowNewPosModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tùy chỉnh Mẫu biểu & Định mức theo Vị trí việc làm
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Thiết lập khung tiêu chí, tỷ trọng điểm (30/70) và hệ số độ khó công việc chuẩn (1,0 · 1,5 · 2,0) cho từng vị trí
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewPosModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm vị trí việc làm mới
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Job Positions */}
        <div className="lg:col-span-4 space-y-3">
          {jobPositions.map((pos) => {
            const isSelected = pos.id === activePosition?.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setSelectedId(pos.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-2 border-[#7A1C24] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#7A1C24]">{pos.code}</span>
                  <span className="font-semibold text-slate-600">
                    Mặc định: Mẫu {pos.defaultTemplate}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">{pos.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{pos.departmentType}</div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span>Tỷ trọng: {pos.generalMaxScore}đ / {pos.kpiMaxScore}đ</span>
                  <span>{pos.standardNorms.length} định mức sản phẩm</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail & Norm Editor */}
        {activePosition && (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C24]">
                  <Briefcase className="w-4 h-4" />
                  <span>CẤU HÌNH VỊ TRÍ VIỆC LÀM ({activePosition.code})</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activePosition.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="pos-default-template" className="font-semibold text-slate-600">
                  Mẫu kiểm điểm gắn với vị trí:
                </label>
                <select
                  id="pos-default-template"
                  value={activePosition.defaultTemplate}
                  onChange={(e) =>
                    onUpdateJobPosition({
                      ...activePosition,
                      defaultTemplate: e.target.value as FormTemplateType,
                    })
                  }
                  className="px-3 py-1.5 font-bold text-[#7A1C24] bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                >
                  <option value="02A">Mẫu 02A (Lãnh đạo, quản lý)</option>
                  <option value="02B">Mẫu 02B (Đảng viên chuyên môn)</option>
                  <option value="02D">Mẫu 02D (Công chức ngoài Đảng)</option>
                </select>
              </div>
            </div>

            {/* Pillar Weight Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-[#7A1C24]" />
                  <span>Trụ cột I: Điểm Tiêu chí chung (Quy định 366)</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    aria-label="Điểm tối đa trụ tiêu chí chung"
                    value={activePosition.generalMaxScore}
                    onChange={(e) => {
                      const g = Math.min(50, Math.max(10, Number(e.target.value)));
                      onUpdateJobPosition({
                        ...activePosition,
                        generalMaxScore: g,
                        kpiMaxScore: 100 - g,
                      });
                    }}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-600">điểm (Chuẩn Trung ương: 30 điểm)</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800">
                  Trụ cột II: Điểm Kết quả thực hiện nhiệm vụ (KPI)
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    aria-label="Điểm tối đa trụ KPI"
                    readOnly
                    value={activePosition.kpiMaxScore}
                    className="w-20 px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-[#7A1C24]"
                  />
                  <span className="text-slate-600">điểm (Chuẩn Trung ương: 70 điểm)</span>
                </div>
              </div>
            </div>

            {/* Standard Task Norms Table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-800">
                DANH MỤC ĐỊNH MỨC SẢN PHẨM & HỆ SỐ CÔNG VIỆC CHUẨN CỦA VỊ TRÍ NÀY
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="py-2.5 px-3">Tên đầu việc / Sản phẩm chuẩn</th>
                      <th className="py-2.5 px-3">Đơn vị tính</th>
                      <th className="py-2.5 px-3 text-center">Hệ số chuẩn</th>
                      <th className="py-2.5 px-3">Yêu cầu chất lượng & Tiến độ</th>
                      <th className="py-2.5 px-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {activePosition.standardNorms.map((norm, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {norm.taskName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{norm.unit}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#7A1C24]">
                          x{formatVnNumber(norm.defaultWeight, 1)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{norm.qualityRequirement}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            aria-label={`Xóa định mức ${norm.taskName}`}
                            onClick={() => handleDeleteNorm(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Norm Form */}
              <form
                onSubmit={handleAddNorm}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
              >
                <div className="font-bold text-slate-800">
                  + Thêm định mức đầu việc / sản phẩm mới cho vị trí việc làm này
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      aria-label="Tên đầu việc định mức mới"
                      value={newTaskNormName}
                      onChange={(e) => setNewTaskNormName(e.target.value)}
                      placeholder="Nhập tên đầu việc / sản phẩm chuẩn..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      aria-label="Đơn vị tính định mức"
                      value={newTaskNormUnit}
                      onChange={(e) => setNewTaskNormUnit(e.target.value)}
                      placeholder="Đơn vị tính"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      aria-label="Hệ số công việc chuẩn"
                      value={newTaskNormWeight}
                      onChange={(e) => setNewTaskNormWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#7A1C24]"
                    >
                      <option value={1.0}>Hệ số 1,0</option>
                      <option value={1.5}>Hệ số 1,5</option>
                      <option value={2.0}>Hệ số 2,0</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 font-bold text-white bg-[#7A1C24] rounded-lg hover:bg-[#61151C] cursor-pointer"
                    >
                      + Lưu định mức
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Position */}
      {showNewPosModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-pos-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs shadow-xl">
            <h2 id="new-pos-modal-title" className="text-base font-bold text-slate-900">
              Thêm mới Vị trí việc làm & Mẫu biểu mặc định
            </h2>
            <form onSubmit={handleCreatePosition} className="space-y-3">
              <div>
                <label htmlFor="new-pos-title" className="block font-semibold text-slate-700 mb-1">
                  Tên vị trí việc làm *
                </label>
                <input
                  id="new-pos-title"
                  type="text"
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  placeholder="Ví dụ: Chuyên viên Văn thư - Lưu trữ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="new-pos-code" className="block font-semibold text-slate-700 mb-1">
                  Mã vị trí việc làm
                </label>
                <input
                  id="new-pos-code"
                  type="text"
                  value={posCode}
                  onChange={(e) => setPosCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-pos-dept" className="block font-semibold text-slate-700 mb-1">
                  Khối / Nhóm ngạch
                </label>
                <input
                  id="new-pos-dept"
                  type="text"
                  value={posDept}
                  onChange={(e) => setPosDept(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="new-pos-tpl" className="block font-semibold text-slate-700 mb-1">
                  Mẫu kiểm điểm áp dụng mặc định
                </label>
                <select
                  id="new-pos-tpl"
                  value={posTemplate}
                  onChange={(e) => setPosTemplate(e.target.value as FormTemplateType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-[#7A1C24]"
                >
                  <option value="02A">Mẫu 02A — Lãnh đạo, quản lý</option>
                  <option value="02B">Mẫu 02B — Đảng viên chuyên môn</option>
                  <option value="02D">Mẫu 02D — Công chức, viên chức ngoài Đảng</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPosModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#7A1C24] rounded-lg cursor-pointer"
                >
                  Tạo vị trí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
