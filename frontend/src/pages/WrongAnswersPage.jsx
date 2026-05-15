import { useState, useEffect } from 'react';
import api from '../api/axios';

const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};
const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };

const WrongAnswersPage = () => {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingMemo, setEditingMemo] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [subjectId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (subjectId) params.subject_id = subjectId;
      const res = await api.get('/wrong-answers', { params });
      setItems(res.data.wrong_answers);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('오답노트에서 삭제하시겠습니까?')) return;
    await api.delete(`/wrong-answers/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveMemo = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/wrong-answers/${id}/memo`, { memo: editingMemo[id] ?? '' });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, memo: editingMemo[id] ?? '' } : i));
      setEditingMemo((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } finally {
      setSavingId(null);
    }
  };

  const toggleExpand = (id) => setExpandedId((prev) => prev === id ? null : id);

  const correctCount = 0;
  const total = items.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">❌ 오답노트</h1>
          <p className="text-sm text-gray-500 mt-1">총 {total}개의 오답 문제</p>
        </div>
      </div>

      {/* 요약 카드 */}
      {total > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{total}</p>
            <p className="text-xs text-gray-500 mt-1">총 오답 문제</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {[...new Set(items.map((i) => i.subject_name))].length}
            </p>
            <p className="text-xs text-gray-500 mt-1">관련 과목 수</p>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="mb-5">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">전체 과목</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-600 font-medium">오답 문제가 없어요!</p>
          <p className="text-gray-400 text-sm mt-1">모의고사를 풀면 틀린 문제가 자동으로 저장돼요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const isEditingMemo = editingMemo[item.id] !== undefined;

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* 헤더 */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                          {item.subject_name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[item.difficulty]}`}>
                          {DIFFICULTY_LABEL[item.difficulty]}
                        </span>
                        {item.memo && (
                          <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                            📝 메모 있음
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.created_at?.slice(0, 10)} 틀림</p>
                    </div>
                    <span className="text-gray-400 text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 상세 내용 */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">문제</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.content}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-green-600 mb-1">정답</p>
                      <p className="text-sm font-semibold text-gray-800">{item.answer}</p>
                      {item.explanation && (
                        <>
                          <hr className="my-2 border-green-200" />
                          <p className="text-xs font-medium text-green-600 mb-1">해설</p>
                          <p className="text-sm text-gray-700">{item.explanation}</p>
                        </>
                      )}
                    </div>

                    {/* 메모 */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">📝 내 메모</p>
                      {isEditingMemo ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingMemo[item.id]}
                            onChange={(e) => setEditingMemo((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            rows={3}
                            placeholder="이 문제에 대한 메모를 입력하세요"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveMemo(item.id)}
                              disabled={savingId === item.id}
                              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              {savingId === item.id ? '저장 중...' : '저장'}
                            </button>
                            <button
                              onClick={() => setEditingMemo((prev) => { const next = { ...prev }; delete next[item.id]; return next; })}
                              className="text-sm border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingMemo((prev) => ({ ...prev, [item.id]: item.memo || '' }))}
                          className="min-h-[60px] border border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                        >
                          {item.memo ? (
                            <p className="text-sm text-gray-700">{item.memo}</p>
                          ) : (
                            <p className="text-sm text-gray-400">클릭하여 메모 추가...</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-400 hover:text-red-600 transition"
                      >
                        오답노트에서 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WrongAnswersPage;
