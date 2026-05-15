import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
    <div className="text-center">
      <div className="text-7xl mb-4">🔍</div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-gray-500 dark:text-slate-400 mb-6">페이지를 찾을 수 없어요.</p>
      <Link to="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
        홈으로 돌아가기
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
