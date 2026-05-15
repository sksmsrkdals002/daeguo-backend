import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const StatCard = ({ icon, label, value, sub, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    green:  'bg-green-50  border-green-100  text-green-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    red:    'bg-red-50    border-red-100    text-red-500',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    blue:   'bg-blue-50   border-blue-100   text-blue-600',
  };
  return (
    <div className={`border rounded-xl p-4 ${colorMap[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className={`text-2xl font-bold`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
};

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/me')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">통계 불러오는 중...</div>;
  if (!stats) return null;

  const last7 = getLast7Days();

  // 최근 7일 퀴즈 점수 차트 데이터
  const quizChartData = last7.map((date) => {
    const found = stats.charts.recentQuiz.find((r) => r.date === date);
    return {
      date: date.slice(5),
      점수: found ? Math.round(found.avg_score) : null,
      횟수: found ? found.count : 0,
    };
  });

  // 최근 7일 뽀모도로 차트 데이터
  const pomChartData = last7.map((date) => {
    const found = stats.charts.recentPomodoro.find((r) => r.date === date);
    return {
      date: date.slice(5),
      집중시간: found ? found.total_min : 0,
    };
  });

  // 오답 과목 분포 파이차트
  const pieData = stats.charts.wrongBySubject.map((w) => ({
    name: w.subject_name,
    value: w.count,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 학습 통계</h1>
      <p className="text-sm text-gray-400 mb-8">가입일: {stats.overview.joined} · 총 {stats.overview.points}pt 보유</p>

      {/* 개요 카드 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        <StatCard icon="📝" label="출제 문제" value={stats.overview.questions} color="indigo" />
        <StatCard icon="📖" label="필기 공유" value={stats.overview.notes} color="green" />
        <StatCard icon="💬" label="Q&A 질문" value={stats.overview.qna} color="yellow" />
        <StatCard icon="🃏" label="카드 세트" value={stats.overview.flashcard_sets} color="purple" />
        <StatCard icon="❌" label="오답 문제" value={stats.overview.wrong_answers} color="red" />
        <StatCard icon="⭐" label="보유 포인트" value={`${stats.overview.points}pt`} color="blue" />
      </div>

      {/* 모의고사 + 뽀모도로 수치 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">📊 모의고사 성적</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '총 응시', value: `${stats.quiz.total_quizzes}회` },
              { label: '평균 점수', value: `${stats.quiz.avg_score}점` },
              { label: '최고 점수', value: `${stats.quiz.best_score}점` },
              { label: '정답률', value: `${stats.quiz.accuracy}%` },
            ].map((item) => (
              <div key={item.label} className="text-center bg-indigo-50 rounded-lg p-3">
                <p className="text-lg font-bold text-indigo-600">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">⏱️ 뽀모도로 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '총 세션', value: `${stats.pomodoro.total_sessions}회` },
              { label: '총 집중 시간', value: `${stats.pomodoro.total_hours}h` },
              { label: '완료 단원', value: `${stats.progress.completed_units}개` },
              { label: '진도율', value: `${stats.progress.rate}%` },
            ].map((item) => (
              <div key={item.label} className="text-center bg-green-50 rounded-lg p-3">
                <p className="text-lg font-bold text-green-600">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 7일 퀴즈 점수 꺾은선 그래프 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">최근 7일 퀴즈 점수</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={quizChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => v !== null ? `${v}점` : '없음'} />
            <Line
              type="monotone"
              dataKey="점수"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* 최근 7일 뽀모도로 바 차트 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">최근 7일 집중 시간 (분)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pomChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}분`} />
              <Bar dataKey="집중시간" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 과목별 오답 파이차트 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">과목별 오답 분포</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              오답 데이터가 없어요 🎉
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}개`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
