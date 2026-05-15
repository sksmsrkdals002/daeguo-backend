import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const FlashcardsPage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/flashcards')
      .then((res) => setSets(res.data.sets))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('카드 세트를 삭제하시겠습니까?')) return;
    await api.delete(`/flashcards/${id}`);
    setSets((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🃏 플래시카드</h1>
          <p className="text-sm text-gray-500 mt-1">총 {sets.length}개의 카드 세트</p>
        </div>
        <Link to="/flashcards/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + 새 카드 세트
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : sets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🃏</div>
          <p className="text-gray-500 mb-2">아직 카드 세트가 없어요.</p>
          <Link to="/flashcards/new" className="text-indigo-600 text-sm hover:underline">
            첫 카드 세트를 만들어보세요!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((s) => (
            <div key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                  {s.subject_name}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-400 mb-4">카드 {s.card_count}장</p>

              <div className="flex gap-2 mt-auto">
                <Link to={`/flashcards/${s.id}/study`}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition">
                  학습하기
                </Link>
                <Link to={`/flashcards/${s.id}/edit`}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  수정
                </Link>
                <button onClick={() => handleDelete(s.id)}
                  className="px-3 py-2 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
