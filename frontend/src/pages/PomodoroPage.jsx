import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import useWebSocket from '../hooks/useWebSocket';

const MODES = {
  focus: { label: '집중', minutes: 25, color: 'indigo' },
  short: { label: '짧은 휴식', minutes: 5, color: 'green' },
  long:  { label: '긴 휴식',  minutes: 15, color: 'blue' },
};

const pad = (n) => String(n).padStart(2, '0');

const PomodoroPage = () => {
  const [mode, setMode] = useState('focus');
  const [customMinutes, setCustomMinutes] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [stats, setStats] = useState(null);
  const intervalRef = useRef(null);
  const startedAt = useRef(null);

  const { onlineCount } = useWebSocket((import.meta.env.VITE_WS_URL || `ws://${window.location.host}`) + '/ws');

  const totalSeconds = useCustom
    ? (Number(customMinutes) || 25) * 60
    : MODES[mode].minutes * 60;

  useEffect(() => {
    api.get('/pomodoro/stats').then((res) => setStats(res.data));
  }, []);

  // 모드 변경 시 타이머 리셋
  useEffect(() => {
    if (!running) reset();
  }, [mode, customMinutes, useCustom]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(totalSeconds);
    startedAt.current = null;
  }, [totalSeconds]);

  const handleComplete = useCallback(async (elapsed) => {
    setRunning(false);
    clearInterval(intervalRef.current);

    const minutes = Math.floor(elapsed / 60);
    if (minutes >= 1) {
      try {
        await api.post('/pomodoro/session', { duration_minutes: minutes });
        const res = await api.get('/pomodoro/stats');
        setStats(res.data);
      } catch {}
    }

    if (mode === 'focus') {
      setRound((r) => r + 1);
      playBeep();
      alert('🎉 집중 세션 완료! 잠깐 휴식을 취하세요.');
    } else {
      playBeep();
      alert('⏰ 휴식 완료! 다시 집중해볼까요?');
    }

    setSecondsLeft(totalSeconds);
    startedAt.current = null;
  }, [mode, totalSeconds]);

  useEffect(() => {
    if (running) {
      startedAt.current = startedAt.current || Date.now() - (totalSeconds - secondsLeft) * 1000;
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
            handleComplete(elapsed);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  const handleStart = () => {
    startedAt.current = Date.now() - (totalSeconds - secondsLeft) * 1000;
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => reset();

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) : 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const colorMap = {
    indigo: { ring: '#6366f1', bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50' },
    green:  { ring: '#22c55e', bg: 'bg-green-600',  text: 'text-green-600',  light: 'bg-green-50' },
    blue:   { ring: '#3b82f6', bg: 'bg-blue-600',   text: 'text-blue-600',   light: 'bg-blue-50' },
  };
  const currentMode = MODES[mode];
  const colors = colorMap[currentMode.color];

  // SVG 원형 진행 바
  const R = 90;
  const CIRC = 2 * Math.PI * R;
  const dash = CIRC * progress;
  const gap = CIRC - dash;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⏱️ 뽀모도로 타이머</h1>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          현재 {onlineCount}명 접속 중
        </div>
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-2 mb-6">
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => { setMode(key); setUseCustom(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === key && !useCustom
                ? `${colors.bg} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {val.label}
          </button>
        ))}
        <button onClick={() => setUseCustom(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            useCustom ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          직접 설정
        </button>
      </div>

      {/* 커스텀 시간 입력 */}
      {useCustom && (
        <div className="flex items-center gap-2 mb-4 justify-center">
          <input
            type="number"
            min={1} max={120}
            value={customMinutes}
            onChange={(e) => { setCustomMinutes(e.target.value); if (!running) setSecondsLeft((Number(e.target.value) || 25) * 60); }}
            placeholder="25"
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-500">분</span>
        </div>
      )}

      {/* 원형 타이머 */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={R} fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="110" cy="110" r={R}
              fill="none"
              stroke={colors.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              style={{ transition: running ? 'stroke-dasharray 1s linear' : 'none' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">
              {pad(mins)}:{pad(secs)}
            </span>
            <span className={`text-sm font-medium mt-1 ${colors.text}`}>
              {useCustom ? '커스텀' : currentMode.label}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">#{round} 라운드</span>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleReset}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
            초기화
          </button>
          {running ? (
            <button onClick={handlePause}
              className="px-10 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-xl transition">
              일시정지
            </button>
          ) : (
            <button onClick={handleStart}
              className={`px-10 py-2.5 ${colors.bg} hover:opacity-90 text-white text-sm font-semibold rounded-xl transition`}>
              {secondsLeft === totalSeconds ? '시작' : '재개'}
            </button>
          )}
        </div>
      </div>

      {/* 오늘 통계 */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`${colors.light} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${colors.text}`}>{stats.today_sessions}</p>
            <p className="text-xs text-gray-500 mt-1">오늘 완료 세션</p>
          </div>
          <div className={`${colors.light} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${colors.text}`}>{stats.today_minutes}분</p>
            <p className="text-xs text-gray-500 mt-1">오늘 집중 시간</p>
          </div>
        </div>
      )}

      {/* 누적 통계 */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">누적 통계</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.total_sessions}</p>
              <p className="text-xs text-gray-400">총 세션</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {Math.floor(stats.total_minutes / 60)}h {stats.total_minutes % 60}m
              </p>
              <p className="text-xs text-gray-400">총 집중 시간</p>
            </div>
          </div>
        </div>
      )}

      {/* 뽀모도로 안내 */}
      <div className="mt-4 bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-600 mb-2">🍅 뽀모도로 기법이란?</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded">집중 25분</span>
          <span>→</span>
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded">휴식 5분</span>
          <span>→</span>
          <span className="text-gray-400">4회 반복 후</span>
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">긴 휴식 15분</span>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
