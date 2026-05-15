import { useState, useEffect } from 'react';
import api from '../api/axios';

const today = () => new Date().toISOString().slice(0, 10);

const formatKorDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const getDdayLabel = (diff) => {
  if (diff < 0) return { label: `D+${Math.abs(diff)}`, color: 'text-gray-400' };
  if (diff === 0) return { label: 'D-Day!', color: 'text-red-600' };
  return { label: `D-${diff}`, color: diff <= 7 ? 'text-red-500' : diff <= 30 ? 'text-orange-500' : 'text-indigo-600' };
};

const PlannerPage = () => {
  const [ddays, setDdays] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [currentMonth, setCurrentMonth] = useState(today().slice(0, 7));
  const [monthPlans, setMonthPlans] = useState([]);

  const [ddayForm, setDdayForm] = useState({ title: '', exam_date: '' });
  const [planInput, setPlanInput] = useState('');
  const [showDdayForm, setShowDdayForm] = useState(false);
  const [ddayError, setDdayError] = useState('');
  const [submittingPlan, setSubmittingPlan] = useState(false);

  useEffect(() => { fetchDdays(); }, []);
  useEffect(() => { fetchPlans(selectedDate); }, [selectedDate]);
  useEffect(() => { fetchMonthPlans(currentMonth); }, [currentMonth]);

  const fetchDdays = async () => {
    const res = await api.get('/planner/ddays');
    setDdays(res.data.ddays);
  };

  const fetchPlans = async (date) => {
    const res = await api.get('/planner/plans', { params: { date } });
    setPlans(res.data.plans);
  };

  const fetchMonthPlans = async (month) => {
    const res = await api.get('/planner/plans', { params: { month } });
    setMonthPlans(res.data.plans);
  };

  const handleAddDday = async (e) => {
    e.preventDefault();
    setDdayError('');
    try {
      const res = await api.post('/planner/ddays', ddayForm);
      setDdays((prev) => [...prev, res.data.dday].sort((a, b) => a.dday - b.dday));
      setDdayForm({ title: '', exam_date: '' });
      setShowDdayForm(false);
    } catch (err) {
      setDdayError(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const handleDeleteDday = async (id) => {
    if (!confirm('D-Day를 삭제하시겠습니까?')) return;
    await api.delete(`/planner/ddays/${id}`);
    setDdays((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!planInput.trim()) return;
    setSubmittingPlan(true);
    try {
      const res = await api.post('/planner/plans', { plan_date: selectedDate, content: planInput });
      setPlans((prev) => [...prev, res.data.plan]);
      setMonthPlans((prev) => [...prev, res.data.plan]);
      setPlanInput('');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleTogglePlan = async (id) => {
    const res = await api.patch(`/planner/plans/${id}/toggle`);
    const isDone = res.data.is_done;
    const update = (list) => list.map((p) => p.id === id ? { ...p, is_done: isDone } : p);
    setPlans(update);
    setMonthPlans(update);
  };

  const handleDeletePlan = async (id) => {
    await api.delete(`/planner/plans/${id}`);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setMonthPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // 달력 계산
  const buildCalendar = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayPlans = monthPlans.filter((p) => p.plan_date === dateStr);
      cells.push({ date: dateStr, day: d, plans: dayPlans });
    }
    return cells;
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const cells = buildCalendar();
  const donePlans = plans.filter((p) => p.is_done).length;
  const [calYear, calMonth] = currentMonth.split('-').map(Number);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">📅 D-Day & 스터디 플래너</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 왼쪽: D-Day + 오늘 계획 */}
        <div className="lg:col-span-1 space-y-5">

          {/* D-Day 카드 */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">⏰ D-Day</h2>
              <button onClick={() => setShowDdayForm((v) => !v)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                {showDdayForm ? '취소' : '+ 추가'}
              </button>
            </div>

            {showDdayForm && (
              <form onSubmit={handleAddDday} className="px-5 py-4 border-b border-gray-100 bg-indigo-50">
                {ddayError && <p className="text-xs text-red-500 mb-2">{ddayError}</p>}
                <input
                  type="text"
                  value={ddayForm.title}
                  onChange={(e) => setDdayForm({ ...ddayForm, title: e.target.value })}
                  required
                  placeholder="시험 이름 (예: 중간고사)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={ddayForm.exam_date}
                  onChange={(e) => setDdayForm({ ...ddayForm, exam_date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition">
                  등록
                </button>
              </form>
            )}

            <div className="divide-y divide-gray-50">
              {ddays.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">시험 일정을 추가해보세요</p>
              ) : (
                ddays.map((d) => {
                  const { label, color } = getDdayLabel(d.dday);
                  return (
                    <div key={d.id} className="flex items-center justify-between px-5 py-3 group">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.title}</p>
                        <p className="text-xs text-gray-400">{formatKorDate(d.exam_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${color}`}>{label}</span>
                        <button onClick={() => handleDeleteDday(d.id)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition">
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 오늘 계획 */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">
                📋 {formatKorDate(selectedDate)} 계획
              </h2>
              {plans.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {donePlans}/{plans.length} 완료
                </p>
              )}
            </div>

            <form onSubmit={handleAddPlan} className="px-5 py-3 border-b border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  placeholder="오늘 할 일 추가..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" disabled={submittingPlan || !planInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm px-3 py-2 rounded-lg transition">
                  +
                </button>
              </div>
            </form>

            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {plans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">이날 계획이 없어요</p>
              ) : (
                plans.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-gray-50">
                    <button onClick={() => handleTogglePlan(p.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                        p.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-400'
                      }`}>
                      {p.is_done && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${p.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {p.content}
                    </span>
                    <button onClick={() => handleDeletePlan(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 달력 */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
              ◀
            </button>
            <h2 className="font-semibold text-gray-800">
              {calYear}년 {calMonth}월
            </h2>
            <button onClick={nextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
              ▶
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div key={d} className={`py-2 text-xs font-medium text-center ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              if (!cell) return <div key={`empty-${idx}`} className="min-h-[72px] border-b border-r border-gray-50" />;

              const isToday = cell.date === today();
              const isSelected = cell.date === selectedDate;
              const dayOfWeek = (idx) % 7;
              const doneCnt = cell.plans.filter((p) => p.is_done).length;

              return (
                <div
                  key={cell.date}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[72px] p-2 border-b border-r border-gray-50 cursor-pointer transition hover:bg-indigo-50 ${
                    isSelected ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                >
                  <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday ? 'bg-indigo-600 text-white' :
                    dayOfWeek === 0 ? 'text-red-400' :
                    dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
                  }`}>
                    {cell.day}
                  </div>
                  {cell.plans.length > 0 && (
                    <div className="space-y-0.5">
                      {cell.plans.slice(0, 2).map((p) => (
                        <div key={p.id} className={`text-xs truncate rounded px-1 ${
                          p.is_done ? 'bg-green-100 text-green-600 line-through' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {p.content}
                        </div>
                      ))}
                      {cell.plans.length > 2 && (
                        <div className="text-xs text-gray-400">+{cell.plans.length - 2}개</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlannerPage;
