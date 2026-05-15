import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };
const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/questions/${id}`)
      .then((res) => setQuestion(res.data.question))
      .catch(() => navigate('/questions'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await api.delete(`/questions/${id}`);
    navigate('/questions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to="/questions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition"
      >
        ← 목록으로
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* 헤더 영역 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
              {question.subject_name}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[question.difficulty]}`}>
              {DIFFICULTY_LABEL[question.difficulty]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{question.title}</h1>
          <p className="text-xs text-gray-400">
            {question.username} · {question.created_at?.slice(0, 10)}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* 문제 내용 */}
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">문제</p>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{question.content}</p>
          </div>

          {/* 문제 이미지 */}
          {question.image_url && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img
                src={question.image_url}
                alt="문제 이미지"
                className="w-full object-contain max-h-80"
              />
            </div>
          )}

          {/* 정답 토글 */}
          <div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full border-2 border-dashed border-indigo-300 rounded-xl py-3.5 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              {showAnswer ? '🙈 정답 숨기기' : '👀 정답 보기'}
            </button>

            {showAnswer && (
              <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5">정답</p>
                  <p className="text-gray-800 font-bold text-base">{question.answer}</p>
                </div>
                {question.explanation && (
                  <>
                    <div className="border-t border-indigo-200" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5">해설</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{question.explanation}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 작성자 버튼 */}
          {user?.id === question.user_id && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Link
                to={`/questions/${id}/edit`}
                className="flex-1 text-center text-sm border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 text-sm bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition font-medium"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
