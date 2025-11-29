// src/pages/DailyQuizTool.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DailyQuizTool({ API_URL, sessionToken, user, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    const get = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/tools/quiz/daily`);
        const data = await res.json();
        if (data.success && data.quiz) {
          setQuiz(data.quiz);
          setSource('backend');
          localStorage.setItem('dailyQuiz', JSON.stringify({ date: data.quiz.date, quiz: data.quiz }));
        } else throw new Error('no quiz');
      } catch (err) {
        console.warn('fetch daily failed', err);
        // fallback to cached or simple fallback
        const cached = JSON.parse(localStorage.getItem('dailyQuiz') || 'null');
        if (cached && cached.date === new Date().toISOString().slice(0,10)) {
          setQuiz(cached.quiz); setSource('cache');
        } else {
          const fallback = {
            id: 'fb-' + new Date().toISOString().slice(0,10),
            date: new Date().toISOString().slice(0,10),
            questions: [
              { id:'q1', question: 'What does HTML stand for?', options: ['HyperText Markup Language','Home Tool Markup','Hyperlink Text Markup'], answerIndex:0 }
            ]
          };
          setQuiz(fallback); setSource('fallback');
        }
      } finally { setLoading(false); }
    };
    get();
  }, [API_URL]);

  const submit = async () => {
    if (!quiz) return;
    const q = quiz.questions[index];
    if (selected === q.answerIndex) setScore(s => s + 1);
    setSelected(null);
    const next = index + 1;
    if (next < quiz.questions.length) {
      setIndex(next);
    } else {
      // finished: submit attempt
      try {
        await fetch(`${API_URL}/api/tools/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
          body: JSON.stringify({ quizId: quiz.id, answers: [] }) // you can send answers if you store them
        });
      } catch (e) { console.warn('submit failed', e); }
      setIndex(next);
    }
  };

  if (loading || !quiz) return <div className="p-6 text-center">Loading...</div>;
  if (index >= quiz.questions.length) {
    return (
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-6 text-center">
        <button onClick={onBack} className="mb-4 text-sm">← Back</button>
        <h1 className="text-2xl font-bold mb-2">Daily Quiz</h1>
        <p>Your score: {score}/{quiz.questions.length}</p>
        <p className="text-xs text-gray-500">Source: {source}</p>
        <button onClick={() => { setIndex(0); setScore(0); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
      </motion.div>
    );
  }

  const q = quiz.questions[index];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-6 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 text-sm">← Back</button>
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-bold">Daily Quiz</h1>
        <div className="text-xs text-gray-500">Source: {source}</div>
      </div>
      <div className="mb-4 text-lg font-semibold">{q.question}</div>
      {q.options.map((opt,i) => (
        <div key={i} onClick={() => setSelected(i)} className={`border p-3 rounded mb-2 cursor-pointer ${selected===i ? 'bg-green-100 dark:bg-green-800' : ''}`}>
          {opt}
        </div>
      ))}
      <div className="mt-4 flex gap-2">
        <button disabled={selected === null} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded">Clear</button>
      </div>
    </motion.div>
  );
}
