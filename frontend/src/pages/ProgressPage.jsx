import { useState, useEffect } from 'react';
import api from '../api/axios';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject_id: '', unit_name: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress');
      setProgressData(res.data.progress);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (unitId) => {
    const res = await api.patch(`/progress/${unitId}/toggle`);
    const isCompleted = res.data.is_completed;

    setProgressData((prev) =>
      prev.map((subject) => ({
        ...subject,
        units: subject.units.map((u) =>
          u.id === unitId ? { ...u, is_completed: isCompleted } : u
        ),
        completed: subject.units.filter((u) =>
          u.id === unitId ? isCompleted : u.is_completed
        ).length,
        rate: Math.round(
          (subject.units.filter((u) =>
            u.id === unitId ? isCompleted : u.is_completed
          ).length / subject.units.length) * 100
        ),
      }))
    );
  };

  const handleDeleteUnit = async (unitId, subjectId) => {
    if (!confirm('단원을 삭제하시겠습니까?')) return;
    await api.delete(`/progress/${unitId}`);
    setProgressData((prev) =>
      prev.map((s) => {
        if (s.subject_id !== subjectId) return s;
        const units = s.units.filter((u) => u.id !== unitId);
        const completed = units.filter((u) => u.is_completed).length;
        return { ...s, units, total: units.length, completed, rate: units.length ? Math.round((completed / units.length) * 100) : 0 };
      }).filter((s) => s.units.length > 0)
    );
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/progress', form);
      setForm({ subject_id: '', unit_name: '' });
      setShowForm(false);
      fetchProgress();
    } catch (err) {
      setFormError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalUnits = progressData.reduce((acc, s) => acc + s.total, 0);
  const totalCompleted = progressData.reduce((acc, s) => acc + s.completed, 0);
  const overallRate = totalUnits ? Math.round((totalCompleted / totalUnits) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📈 진도율 체크</h1>
          <p className="text-sm text-gray-500 mt-1">시험 범위 단원별 학습 현황</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + 단원 추가
        </button>
      </div>

      {/* 전체 진도율 */}
      {totalUnits > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">전체 진도율</span>
            <span className="text-lg font-bold text-indigo-600">{overallRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">{totalCompleted} / {totalUnits} 단원 완료</p>
        </div>
      )}

      {/* 단원 추가 폼 */}
      {showForm && (
        <form onSubmit={handleAddUnit} className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-indigo-700 mb-3">새 단원 추가</h2>
          {formError && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">과목 *</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">선택하세요</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">단원명 *</label>
              <input
                type="text"
                value={form.unit_name}
                onChange={(e) => setForm({ ...form, unit_name: e.target.value })}
                required
                placeholder="예: 1단원 - 문학의 이해"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2 rounded-lg transition">
              {submitting ? '추가 중...' : '추가하기'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition">
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : progressData.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 mb-2">아직 등록된 단원이 없어요.</p>
          <p className="text-gray-400 text-sm">시험 범위 단원을 추가해서 진도를 관리해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progressData.map((subject) => (
            <div key={subject.subject_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* 과목 헤더 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-800">{subject.subject_name}</h2>
                  <span className={`text-sm font-bold ${
                    subject.rate === 100 ? 'text-green-600' :
                    subject.rate >= 50 ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                    {subject.rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      subject.rate === 100 ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${subject.rate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {subject.completed}/{subject.total} 완료
                </p>
              </div>

              {/* 단원 목록 */}
              <div className="divide-y divide-gray-50">
                {subject.units.map((unit) => (
                  <div key={unit.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                    <button
                      onClick={() => handleToggle(unit.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                        unit.is_completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {unit.is_completed && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${unit.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {unit.unit_name}
                    </span>
                    <button
                      onClick={() => handleDeleteUnit(unit.id, subject.subject_id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
