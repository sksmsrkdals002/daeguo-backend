import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };
const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ subject_id: '', difficulty: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => { fetchQuestions(); }, [page, filter]);

  const fetchSubjects = async () => {
    const res = await api.get('/subjects');
    setSubjects(res.data.subjects);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filter };
      if (!params.subject_id) delete params.subject_id;
      if (!params.difficulty) delete params.difficulty;
      const res = await api.get('/questions', { params });
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예상 문제</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}개의 문제가 있어요</p>
        </div>
        <Link
          to="/questions/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          + 문제 출제
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-6">
        <select
          name="subject_id"
          value={filter.subject_id}
          onChange={handleFilter}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          name="difficulty"
          value={filter.difficulty}
          onChange={handleFilter}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">전체 난이도</option>
          <option value="easy">쉬움</option>
          <option value="medium">보통</option>
          <option value="hard">어려움</option>
        </select>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400 text-sm">불러오는 중...</div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">아직 등록된 문제가 없어요</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">첫 번째 문제를 출제해보세요!</p>
          <Link
            to="/questions/new"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
          >
            문제 출제하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              to={`/questions/${q.id}`}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
                    {q.subject_name}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[q.difficulty]}`}>
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </span>
                  {q.image_url && (
                    <span className="text-xs text-gray-400">📷</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition">
                  {q.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{q.username} · {q.created_at?.slice(0, 10)}</p>
              </div>
              <span className="text-gray-300 group-hover:text-indigo-400 transition text-lg flex-shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 text-sm border rounded-xl transition ${
                page === p
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
