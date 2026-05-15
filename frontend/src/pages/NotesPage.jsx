import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [page, subjectId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (subjectId) params.subject_id = subjectId;
      const res = await api.get('/notes', { params });
      setNotes(res.data.notes);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📖 필기 위키</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}개의 필기</p>
        </div>
        <Link
          to="/notes/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + 필기 공유
        </Link>
      </div>

      <div className="mb-6">
        <select
          value={subjectId}
          onChange={(e) => { setSubjectId(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">아직 등록된 필기가 없어요.</p>
          <Link to="/notes/new" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            첫 필기를 공유해보세요!
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((n) => (
            <Link
              key={n.id}
              to={`/notes/${n.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition hover:border-indigo-300"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {n.subject_name}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{n.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {n.content.replace(/[#*`>\-]/g, '').slice(0, 80)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{n.username} · {n.created_at?.slice(0, 10)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm border rounded-lg ${page === p ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">다음</button>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
