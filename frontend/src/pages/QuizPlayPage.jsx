import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QuizPlayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    navigate('/quiz');
    return null;
  }

  const { questions, total, session_id } = session;
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const progress = Math.round(((current + 1) / total) * 100);

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  };

  const handleSubmit = async () => {
    if (answered < total && !confirm(`${total - answered}문제가 미답변 상태입니다. 그래도 제출하시겠습니까?`)) return;
    setSubmitting(true);
    setError('');
    try {
      const answersArray = questions.map((_, idx) => answers[idx] || '');
      const res = await api.post('/quiz/submit', { session_id, answers: answersArray });
      navigate('/quiz/result', { state: { result: res.data, questions } });
    } catch (err) {
      setError(err.response?.data?.message || '제출 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          {current + 1} / {total}
        </span>
        <span className="text-sm text-gray-500">답변 완료 {answered}/{total}</span>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 문제 카드 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            {q.subject_name}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {q.difficulty === 'easy' ? '쉬움' : q.difficulty === 'hard' ? '어려움' : '보통'}
          </span>
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-2">{q.title}</h2>
        <p className="text-gray-700 text-sm whitespace-pre-wrap mb-5">{q.content}</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">내 답변</label>
          <textarea
            value={answers[current] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={3}
            placeholder="답변을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      {/* 네비게이션 */}
      <div className="flex gap-3 mb-3">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
          className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
          ← 이전
        </button>
        {current < total - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
            다음 →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium py-2.5 rounded-lg transition">
            {submitting ? '채점 중...' : '제출하기 ✓'}
          </button>
        )}
      </div>

      {/* 문제 번호 점프 */}
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-8 h-8 text-xs rounded-full font-medium transition ${
              idx === current
                ? 'bg-indigo-600 text-white'
                : answers[idx] !== undefined
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {answered === total && (
        <div className="mt-4 text-center">
          <button onClick={handleSubmit} disabled={submitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-8 py-3 rounded-xl transition">
            {submitting ? '채점 중...' : '🎯 최종 제출'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayPage;
