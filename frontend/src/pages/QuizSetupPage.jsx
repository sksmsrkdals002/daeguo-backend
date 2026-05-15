import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QuizSetupPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject_id: '', difficulty: '', count: 10 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
    api.get('/quiz/history').then((res) => setHistory(res.data.history));
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = { count: form.count };
      if (form.subject_id) params.subject_id = form.subject_id;
      if (form.difficulty) params.difficulty = form.difficulty;

      const res = await api.get('/quiz/start', { params });
      navigate('/quiz/play', { state: { session: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || '모의고사를 시작할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const avgScore = history.length
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 미니 모의고사</h1>
      <p className="text-sm text-gray-500 mb-8">등록된 문제 중 랜덤으로 출제됩니다</p>

      {/* 통계 카드 */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{history.length}</p>
            <p className="text-xs text-gray-500 mt-1">총 응시 횟수</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{avgScore}점</p>
            <p className="text-xs text-gray-500 mt-1">평균 점수</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{Math.max(...history.map(h => h.score))}점</p>
            <p className="text-xs text-gray-500 mt-1">최고 점수</p>
          </div>
        </div>
      )}

      {/* 설정 폼 */}
      <form onSubmit={handleStart} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 mb-6">
        <h2 className="font-semibold text-gray-800">시험 설정</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">전체 과목 (랜덤)</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">전체 난이도 (랜덤)</option>
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문제 수: <span className="text-indigo-600 font-bold">{form.count}문제</span>
          </label>
          <input
            type="range"
            min={5} max={30} step={5}
            value={form.count}
            onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5문제</span><span>10문제</span><span>15문제</span><span>20문제</span><span>25문제</span><span>30문제</span>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition text-sm">
          {loading ? '문제 불러오는 중...' : '🚀 시험 시작'}
        </button>
      </form>

      {/* 최근 기록 */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">최근 응시 기록</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{h.created_at?.slice(0, 10)}</span>
                <span className="text-gray-600">{h.correct_count}/{h.total_count}문제 정답</span>
                <span className={`font-bold ${h.score >= 80 ? 'text-green-600' : h.score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {h.score}점
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSetupPage;
