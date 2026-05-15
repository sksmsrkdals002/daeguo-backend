import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const emptyCard = () => ({ front: '', back: '' });

const FlashcardFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject_id: '', title: '' });
  const [cards, setCards] = useState([emptyCard(), emptyCard()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
    if (isEdit) {
      api.get(`/flashcards/${id}`).then((res) => {
        const { set, cards: savedCards } = res.data;
        setForm({ subject_id: set.subject_id, title: set.title });
        setCards(savedCards.map((c) => ({ front: c.front, back: c.back })));
      });
    }
  }, [id]);

  const handleCardChange = (idx, field, value) => {
    setCards((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addCard = () => setCards((prev) => [...prev, emptyCard()]);

  const removeCard = (idx) => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      return setError('앞면과 뒷면이 모두 입력된 카드가 최소 1개 필요합니다.');
    }

    setLoading(true);
    try {
      const payload = { ...form, cards: validCards };
      if (isEdit) {
        await api.put(`/flashcards/${id}`, payload);
      } else {
        await api.post('/flashcards', payload);
      }
      navigate('/flashcards');
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ 카드 세트 수정' : '🃏 새 카드 세트 만들기'}
      </h1>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 세트 정보 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">세트 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">과목 *</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">선택하세요</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">세트 제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="예: 영어 단어 1단원"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 카드 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">카드 ({cards.length}장)</h2>
            <button type="button" onClick={addCard}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              + 카드 추가
            </button>
          </div>

          {cards.map((card, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">카드 {idx + 1}</span>
                {cards.length > 1 && (
                  <button type="button" onClick={() => removeCard(idx)}
                    className="text-xs text-red-400 hover:text-red-600">삭제</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">앞면 (문제/단어)</label>
                  <textarea
                    value={card.front}
                    onChange={(e) => handleCardChange(idx, 'front', e.target.value)}
                    rows={3}
                    placeholder="앞면 내용"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">뒷면 (답/뜻)</label>
                  <textarea
                    value={card.back}
                    onChange={(e) => handleCardChange(idx, 'back', e.target.value)}
                    rows={3}
                    placeholder="뒷면 내용"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addCard}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm hover:border-indigo-400 hover:text-indigo-500 transition">
            + 카드 추가
          </button>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/flashcards')}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
            취소
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2.5 rounded-lg transition">
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '세트 만들기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardFormPage;
