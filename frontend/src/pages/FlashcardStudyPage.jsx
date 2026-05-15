import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const FlashcardStudyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    api.get(`/flashcards/${id}`)
      .then((res) => {
        setSet(res.data.set);
        setCards(res.data.cards);
      })
      .catch(() => navigate('/flashcards'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFlip = () => setFlipped((f) => !f);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      if (current + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 150);
  }, [current, cards.length]);

  const handlePrev = () => {
    if (current === 0) return;
    setFlipped(false);
    setTimeout(() => setCurrent((c) => c - 1), 150);
  };

  const handleKnown = () => {
    setKnown((prev) => new Set([...prev, cards[current].id]));
    handleNext();
  };

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setFlipped(false);
    setKnown(new Set());
    setFinished(false);
    setShuffled(true);
  };

  const handleRestart = () => {
    setCurrent(0);
    setFlipped(false);
    setKnown(new Set());
    setFinished(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); handleFlip(); }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, current]);

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!set || cards.length === 0) return (
    <div className="text-center py-20">
      <p className="text-gray-500">카드가 없습니다.</p>
      <Link to="/flashcards" className="text-indigo-600 text-sm mt-2 inline-block">← 돌아가기</Link>
    </div>
  );

  const progress = Math.round(((current + (finished ? 1 : 0)) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/flashcards" className="text-sm text-gray-500 hover:text-indigo-600">← 목록으로</Link>
        <div className="flex gap-2">
          <button onClick={handleShuffle}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
            🔀 섞기
          </button>
          <button onClick={handleRestart}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
            🔄 처음부터
          </button>
        </div>
      </div>

      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">{set.title}</h1>
        <p className="text-sm text-gray-400">{set.subject_name}</p>
      </div>

      {/* 진행 바 */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{finished ? cards.length : current + 1} / {cards.length}</span>
          <span>암기 완료 {known.size}장</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {finished ? (
        /* 완료 화면 */
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">학습 완료!</h2>
          <p className="text-gray-500 mb-1">총 {cards.length}장 중</p>
          <p className="text-2xl font-bold text-indigo-600 mb-6">{known.size}장 암기 완료</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition">
              다시 학습하기
            </button>
            <button onClick={handleShuffle}
              className="border border-gray-300 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">
              섞어서 다시
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 카드 */}
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            <div
              style={{
                transition: 'transform 0.4s',
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
                minHeight: '240px',
              }}
            >
              {/* 앞면 */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="absolute inset-0 bg-white border-2 border-indigo-200 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm"
              >
                <p className="text-xs text-indigo-400 mb-4 font-medium">앞면 · 클릭해서 뒤집기</p>
                <p className="text-xl font-semibold text-gray-900 text-center whitespace-pre-wrap">
                  {cards[current]?.front}
                </p>
              </div>
              {/* 뒷면 */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 bg-indigo-600 border-2 border-indigo-600 rounded-2xl flex flex-col items-center justify-center p-8 shadow-sm"
              >
                <p className="text-xs text-indigo-200 mb-4 font-medium">뒷면</p>
                <p className="text-xl font-semibold text-white text-center whitespace-pre-wrap">
                  {cards[current]?.back}
                </p>
              </div>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handlePrev} disabled={current === 0}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
              ← 이전
            </button>
            <button onClick={handleKnown}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition">
              ✓ 알고 있어요
            </button>
            <button onClick={handleNext}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition">
              다음 →
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            Space: 뒤집기 · ← →: 이전/다음
          </p>
        </>
      )}
    </div>
  );
};

export default FlashcardStudyPage;
