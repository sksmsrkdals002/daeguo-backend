import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { to: '/questions', label: '📝 문제' },
  { to: '/notes',     label: '📖 필기' },
  { to: '/qna',       label: '💬 Q&A' },
  { to: '/flashcards',label: '🃏 카드' },
  { to: '/quiz',      label: '📊 모의고사' },
  { to: '/planner',   label: '📅 플래너' },
  { to: '/ranking',   label: '🏆 랭킹' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (to) => location.pathname.startsWith(to);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 32px' }} className="h-16 flex items-center justify-between gap-4">

        {/* 로고 */}
        <Link to="/" className="text-lg font-bold text-indigo-600 shrink-0">
          📚 대구고비
        </Link>

        {/* 데스크탑 메뉴 */}
        {user && (
          <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                  isActive(l.to)
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* 우측 액션 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 다크모드 토글 */}
          <button onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
            {dark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/stats"
                className="hidden sm:flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-medium">
                ⭐ {user.points}pt
              </Link>
              <button onClick={handleLogout}
                className="text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition hidden sm:block">
                로그아웃
              </button>
              {/* 모바일 햄버거 */}
              <button onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                {menuOpen ? '✕' : '☰'}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">로그인</Link>
              <Link to="/register" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition">회원가입</Link>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium">
            {user.username} · {user.points}pt
          </div>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`block text-sm px-3 py-2 rounded-lg transition ${
                isActive(l.to)
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}>
              {l.label}
            </Link>
          ))}
          <Link to="/stats" onClick={() => setMenuOpen(false)}
            className="block text-sm px-3 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800">
            📊 내 통계
          </Link>
          <button onClick={handleLogout}
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            로그아웃
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
