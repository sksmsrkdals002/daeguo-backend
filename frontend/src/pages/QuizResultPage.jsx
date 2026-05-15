import { useLocation, useNavigate, Link } from 'react-router-dom';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, questions } = location.state || {};

  if (!result) {
    navigate('/quiz');
    return null;
  }

  const { score, correct, total, results, points_earned } = result;

  const scoreColor =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-yellow-600' :
    'text-red-500';

  const scoreBg =
    score >= 80 ? 'bg-green-50 border-green-200' :
    score >= 60 ? 'bg-yellow-50 border-yellow-200' :
    'bg-red-50 border-red-200';

  const scoreEmoji =
    score >= 90 ? '🏆' :
    score >= 80 ? '🎉' :
    score >= 60 ? '👍' :
    score >= 40 ? '😅' : '😢';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 결과 헤더 */}
      <div className={`border rounded-2xl p-8 text-center mb-6 ${scoreBg}`}>
        <div className="text-5xl mb-3">{scoreEmoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          <span className={scoreColor}>{score}점</span>
        </h1>
        <p className="text-gray-600 mb-3">
          {total}문제 중 <span className="font-bold text-gray-900">{correct}문제</span> 정답
        </p>
        <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-indigo-600 font-medium">
          +{points_earned}pt 획득
        </div>
      </div>

      {/* 점수 바 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>정답률</span>
          <span>{correct}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* 문항별 결과 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">문항별 결과</h2>
        <div className="space-y-4">
          {results.map((r, idx) => {
            const q = questions[idx];
            return (
              <div key={idx} className={`rounded-lg p-4 border ${r.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`text-lg shrink-0 ${r.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                    {r.is_correct ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {idx + 1}. {q?.title}
                    </p>
                  </div>
                </div>

                <div className="ml-6 space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">내 답변:</span>{' '}
                    <span className={r.is_correct ? 'text-green-700' : 'text-red-600'}>
                      {r.user_answer || '(미답변)'}
                    </span>
                  </p>
                  {!r.is_correct && (
                    <p className="text-gray-600">
                      <span className="font-medium">정답:</span>{' '}
                      <span className="text-green-700 font-medium">{r.correct_answer}</span>
                    </p>
                  )}
                  {r.explanation && !r.is_correct && (
                    <p className="text-gray-500 text-xs mt-1 bg-white rounded p-2 border border-gray-200">
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/quiz')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition">
          다시 도전하기
        </button>
        <Link to="/wrong-answers"
          className="flex-1 text-center border border-gray-300 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition">
          오답노트 보기
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;
