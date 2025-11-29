// src/pages/PomodoroTool.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function PomodoroTool({ API_URL, sessionToken, user, onBack }) {
  const [mode, setMode] = useState('focus'); // focus | shortBreak | longBreak
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const audioRef = useRef(null);

  const config = { focus:25*60, shortBreak:5*60, longBreak:15*60, cyclesBeforeLong:4 };

  useEffect(() => {
    // load saved state
    const s = JSON.parse(localStorage.getItem('pomodoroState') || '{}');
    if (s && s.mode) { setMode(s.mode); setSeconds(s.seconds || config.focus); setCycles(s.cycles || 0); }
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(()=> setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify({ mode, seconds, cycles }));
    if (seconds <= 0) {
      audioRef.current?.play().catch(()=>{});
      setRunning(false);
      if (mode === 'focus') {
        const nextCycles = cycles + 1; setCycles(nextCycles);
        const isLong = nextCycles % config.cyclesBeforeLong === 0;
        setMode(isLong ? 'longBreak' : 'shortBreak');
        setSeconds(isLong ? config.longBreak : config.shortBreak);
      } else {
        setMode('focus');
        setSeconds(config.focus);
      }

      // attempt to save session to backend
      (async () => {
        try {
          await fetch(`${API_URL}/api/tools/pomodoro/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
            body: JSON.stringify({ duration: config.focus, cycles, completed: true })
          });
        } catch (e) { console.warn('Save session failed', e); }
      })();
    }
  }, [seconds, mode]); // eslint-disable-line

  const format = s => {
    const m = Math.floor(s/60), sec = s%60;
    return `${m}:${sec<10? '0'+sec : sec}`;
  };

  const start = () => {
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setMode('focus'); setSeconds(config.focus); setCycles(0); localStorage.removeItem('pomodoroState'); };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button onClick={onBack} className="mb-4 text-sm">← Back</button>
      <audio ref={audioRef} src="/ding.mp3" preload="auto" />
      <h1 className="text-xl font-bold mb-2">Pomodoro</h1>
      <div className="mb-3">Mode: <strong>{mode}</strong></div>
      <div className="text-5xl font-mono mb-4 text-center">{format(seconds)}</div>
      <div className="flex gap-2 justify-center mb-4">
        {!running ? <button onClick={start} className="px-4 py-2 bg-green-600 text-white rounded">Start</button> : <button onClick={pause} className="px-4 py-2 bg-yellow-500 rounded">Pause</button>}
        <button onClick={reset} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
      </div>
      <div className="text-center text-sm">Completed cycles: {cycles}</div>
    </div>
  );
}
