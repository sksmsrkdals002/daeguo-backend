import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📝', title: '예상 문제', desc: '직접 문제를 출제하고 공유해요', to: '/questions', accent: 'indigo' },
  { icon: '📖', title: '필기 위키', desc: '마크다운으로 필기를 공유해요', to: '/notes', accent: 'emerald' },
  { icon: '💬', title: 'Q&A', desc: '모르는 것을 익명으로 질문해요', to: '/qna', accent: 'amber' },
  { icon: '🃏', title: '플래시카드', desc: '단어와 개념을 카드로 외워요', to: '/flashcards', accent: 'violet' },
  { icon: '📊', title: '모의고사', desc: '랜덤 문제로 실력을 테스트해요', to: '/quiz', accent: 'rose' },
  { icon: '❌', title: '오답노트', desc: '틀린 문제를 다시 복습해요', to: '/wrong-answers', accent: 'orange' },
  { icon: '📈', title: '진도율 체크', desc: '단원별 학습 진도를 관리해요', to: '/progress', accent: 'cyan' },
  { icon: '📅', title: 'D-Day 플래너', desc: '시험까지 남은 날을 관리해요', to: '/planner', accent: 'pink' },
  { icon: '⏱️', title: '뽀모도로', desc: '집중력 있게 공부해요', to: '/pomodoro', accent: 'teal' },
  { icon: '🏆', title: '랭킹', desc: '친구들과 학습 경쟁을 해요', to: '/ranking', accent: 'indigo' },
  { icon: '📊', title: '내 통계', desc: '학습 데이터를 그래프로 확인해요', to: '/stats', accent: 'violet' },
];

const accentMap = {
  indigo: {
    card: 'border-indigo-100 hover:border-indigo-300',
    icon: 'bg-indigo-50 text-indigo-600',
    title: 'group-hover:text-indigo-600',
  },
  emerald: {
    card: 'border-emerald-100 hover:border-emerald-300',
    icon: 'bg-emerald-50 text-emerald-600',
    title: 'group-hover:text-emerald-600',
  },
  amber: {
    card: 'border-amber-100 hover:border-amber-300',
    icon: 'bg-amber-50 text-amber-600',
    title: 'group-hover:text-amber-600',
  },
  violet: {
    card: 'border-violet-100 hover:border-violet-300',
    icon: 'bg-violet-50 text-violet-600',
    title: 'group-hover:text-violet-600',
  },
  rose: {
    card: 'border-rose-100 hover:border-rose-300',
    icon: 'bg-rose-50 text-rose-600',
    title: 'group-hover:text-rose-600',
  },
  orange: {
    card: 'border-orange-100 hover:border-orange-300',
    icon: 'bg-orange-50 text-orange-600',
    title: 'group-hover:text-orange-600',
  },
  cyan: {
    card: 'border-cyan-100 hover:border-cyan-300',
    icon: 'bg-cyan-50 text-cyan-600',
    title: 'group-hover:text-cyan-600',
  },
  pink: {
    card: 'border-pink-100 hover:border-pink-300',
    icon: 'bg-pink-50 text-pink-600',
    title: 'group-hover:text-pink-600',
  },
  teal: {
    card: 'border-teal-100 hover:border-teal-300',
    icon: 'bg-teal-50 text-teal-600',
    title: 'group-hover:text-teal-600',
  },
};

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '56px 32px' }}>
        {/* 히어로 */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            📚 대구고등학교 전용 시험대비 플랫폼
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {user ? (
              <>
                <span className="text-indigo-600">{user.username}</span>님,<br />
                오늘도 열심히 공부해요!
              </>
            ) : (
              <>
                대구고등학교를 위한<br />
                <span className="text-indigo-600">대구고비</span>
              </>
            )}
          </h1>
          <p className="text-gray-500 text-base">
            문제 출제부터 오답 분석까지, 필요한 모든 학습 도구가 여기에
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const accent = accentMap[f.accent] || accentMap.indigo;
            return (
              <Link
                key={f.to}
                to={user ? f.to : '/login'}
                className={`bg-white border rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group ${accent.card}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${accent.icon}`}>
                  {f.icon}
                </div>
                <h3 className={`font-bold text-gray-800 mb-1.5 transition ${accent.title}`}>
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* 비로그인 CTA */}
        {!user && (
          <div className="text-center mt-14">
            <div className="flex justify-center gap-3">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl text-sm transition shadow-sm"
              >
                무료로 시작하기 →
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 rounded-xl text-sm transition"
              >
                로그인
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
