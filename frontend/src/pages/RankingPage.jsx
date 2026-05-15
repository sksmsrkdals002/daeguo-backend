import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RankingPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('weekly');
  const [data, setData] = useState({ ranking: [], my_rank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/stats/ranking/${tab}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  const schoolLabel = (type) => type === 'middle' ? '중' : type === 'high' ? '고' : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🏆 랭킹</h1>
      <p className="text-sm text-gray-400 mb-6">
        포인트 기반 {tab === 'weekly' ? '주간' : '월간'} 순위
      </p>

      {/* 탭 */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        {[['weekly', '주간 랭킹'], ['monthly', '월간 랭킹']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* 내 순위 배너 */}
      {data.my_rank && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-500 font-medium">내 순위</p>
            <p className="text-lg font-bold text-indigo-700">{data.my_rank}위</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">보유 포인트</p>
            <p className="text-lg font-bold text-indigo-600">{user?.points}pt</p>
          </div>
        </div>
      )}

      {/* TOP 3 */}
      {!loading && data.ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[data.ranking[1], data.ranking[0], data.ranking[2]].map((r, i) => {
            const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = ['h-24', 'h-32', 'h-20'];
            return (
              <div key={r.id} className={`flex flex-col items-center justify-end ${heights[i]}`}>
                <div className="text-2xl mb-1">{MEDAL[actualRank]}</div>
                <div className={`w-full rounded-t-xl flex flex-col items-center justify-center py-3 ${
                  actualRank === 1 ? 'bg-yellow-400' :
                  actualRank === 2 ? 'bg-gray-300' : 'bg-orange-300'
                }`}>
                  <p className="text-xs font-bold text-white truncate px-1 w-full text-center">{r.username}</p>
                  <p className="text-xs text-white font-medium">{tab === 'weekly' ? `${r.points}pt` : `${r.monthly_score}pt`}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 전체 목록 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : data.ranking.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500">아직 랭킹 데이터가 없어요.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-50">
            {data.ranking.map((r) => {
              const isMe = r.id === user?.id;
              const score = tab === 'weekly' ? r.points : r.monthly_score;

              return (
                <div key={r.id} className={`flex items-center gap-4 px-5 py-3.5 ${isMe ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}>
                  {/* 순위 */}
                  <div className="w-8 text-center shrink-0">
                    {MEDAL[r.rank] ? (
                      <span className="text-xl">{MEDAL[r.rank]}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{r.rank}</span>
                    )}
                  </div>

                  {/* 프로필 */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.username?.[0]}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {r.username}
                        {isMe && <span className="ml-1 text-xs text-indigo-400">(나)</span>}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {r.school || '학교 미입력'}
                      {r.grade && r.school_type ? ` · ${schoolLabel(r.school_type)}${r.grade}` : ''}
                    </p>
                  </div>

                  {/* 점수 */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {score}pt
                    </p>
                    {tab === 'weekly' && r.weekly_quizzes > 0 && (
                      <p className="text-xs text-gray-400">퀴즈 {r.weekly_quizzes}회</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 포인트 획득 안내 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">💡 포인트 획득 방법</p>
        <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
          {[
            ['문제 출제', '+5pt'], ['필기 공유', '+3pt'],
            ['댓글 작성', '+2pt'], ['플래시카드', '+5pt'],
            ['퀴즈 80+점', '+10pt'], ['퀴즈 60+점', '+5pt'],
            ['계획 완료', '+1pt'], ['뽀모도로', '+3pt'],
          ].map(([act, pt]) => (
            <div key={act} className="flex justify-between bg-white rounded px-2 py-1">
              <span>{act}</span><span className="text-indigo-500 font-medium">{pt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
