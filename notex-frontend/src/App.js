import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, ShoppingBag, Upload, Zap, Calculator, Clock, TrendingUp, Star, Search, Filter, DollarSign } from 'lucide-react';
import GpaCalculator from './pages/GpaCalculator';
import PomodoroTool from './pages/PomodoroTool';
import DailyQuizTool from './pages/DailyQuizTool';
import { motion } from 'framer-motion';




const API_URL = 'https://notex-api-production.up.railway.app';

const NoteXApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adLoading, setAdLoading] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);
  const [notes, setNotes] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));


  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      authenticateWithBackend(tg.initData);
      tg.setHeaderColor('#7c3aed');
      tg.setBackgroundColor('#ffffff');
    } else {
      setUser({ 
        id: 'demo123', 
        username: 'DemoStudent', 
        plan: 'free',
        credits: 10,
        wallet_balance: 45.50 
      });
      setSessionToken('demo-token');
    }

    useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

    loadNotes();

    const lastAdTime = localStorage.getItem('lastAdTime');
    if (lastAdTime) {
      const timePassed = Date.now() - parseInt(lastAdTime);
      const cooldownRemaining = Math.max(0, 300000 - timePassed);
      if (cooldownRemaining > 0) {
        setAdCooldown(Math.ceil(cooldownRemaining / 1000));
      }
    }
  }, []);

  const authenticateWithBackend = async (initData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/telegram-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setSessionToken(data.token);
        localStorage.setItem('sessionToken', data.token);
      }
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes?limit=10`);
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([
        { id: 1, title: 'Calculus I - Key Theorems', subject: 'Mathematics', price_usd: 4, avg_rating: 4.8, seller_name: 'TopStudent' },
        { id: 2, title: 'Organic Chemistry Mechanisms', subject: 'Chemistry', price_usd: 6, avg_rating: 4.9, seller_name: 'ChemPro' },
      ]);
    }
  };

  const callAI = async (type) => {
    if (!user || user.credits <= 0) {
      alert('No credits left! Watch an ad or upgrade to Pro.');
      return;
    }
    
    if (!aiInput || aiInput.length < 50) {
      alert('Please enter at least 50 characters of text.');
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoints = {
        summary: '/api/ai/summarize',
        flashcards: '/api/ai/flashcards',
        quiz: '/api/ai/quiz'
      };

      const response = await fetch(`${API_URL}${endpoints[type]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ 
          text: aiInput,
          count: 5
        })
      });

      const data = await response.json();
      
      if (data.success) {
        let output = '';
        if (type === 'summary') {
          output = `📝 Summary:\n\n${data.summary}`;
        } else if (type === 'flashcards') {
          output = `🃏 Flashcard Set:\n\n${data.flashcards.map((fc, i) => 
            `Card ${i + 1}:\nQ: ${fc.question}\nA: ${fc.answer}`
          ).join('\n\n')}\n\n✅ ${data.count} flashcards created!`;
        } else if (type === 'quiz') {
          output = `📋 Practice Quiz:\n\n${data.quiz.map((q, i) => 
            `${i + 1}. ${q.question}\n${q.options ? q.options.map((opt, j) => `   ${String.fromCharCode(97 + j)}) ${opt}`).join('\n') : ''}\nAnswer: ${q.correct}`
          ).join('\n\n')}`;
        }
        
        setAiOutput(output);
        setUser(prev => ({ ...prev, credits: data.creditsRemaining }));
      } else {
        alert(data.error || 'AI processing failed');
      }
    } catch (error) {
      console.error('AI error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const watchRewardedAd = async () => {
    if (adCooldown > 0) {
      alert(`Please wait ${Math.ceil(adCooldown / 60)} minutes before watching another ad`);
      return;
    }

    setAdLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(`${API_URL}/api/users/add-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          type: 'rewarded_ad',
          amount: 5
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({ ...prev, credits: data.credits }));
        
        const now = Date.now();
        localStorage.setItem('lastAdTime', now.toString());
        setAdCooldown(300);
        
        const timer = setInterval(() => {
          setAdCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        alert('🎉 +5 credits added! Thank you for supporting NoteX!');
      } else {
        alert(data.error || 'Failed to add credits');
      }
    } catch (error) {
      console.error('Ad error:', error);
      alert('Failed to process ad reward');
    } finally {
      setAdLoading(false);
    }
  };

  const handleAIFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 25 * 1024 * 1024) {
      setUploadedFile(file);
      alert(`File "${file.name}" uploaded! (Text extraction coming soon)`);
    } else {
      alert('File too large. Max 25MB.');
    }
  };

  const handleSellFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 25 * 1024 * 1024) {
      setUploadedFile(file);
      alert(`File "${file.name}" ready to upload!`);
    } else {
      alert('File too large. Max 25MB.');
    }
  };

  const handleSubmitForReview = () => {
    alert('Note submitted for review! You will be notified once approved.');
    setCurrentPage('home');
  };

  if (currentPage === 'home') {
    return (
      <div className="max-w-md mx-auto">
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">NoteX</h1>
                <p className="text-purple-100 text-sm">Study Smarter, Not Harder</p>
              </div>
              <button 
                onClick={() => setCurrentPage('wallet')}
                className="text-right bg-white/20 px-3 py-2 rounded-xl hover:bg-white/30 transition-all"
              >
                <div className="text-xs mb-1">
                  {user?.plan === 'free' ? '🆓 Free' : '⭐ Pro'}
                </div>
                <div className="text-sm font-bold">⚡ {user?.credits || 0} credits</div>
                <div className="text-xs text-purple-200">💰 ${user?.wallet_balance?.toFixed(2) || '0.00'}</div>
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm">
              👋 Welcome, {user?.username || 'Student'}!
            </div>
          </div>

          <div className="p-4 space-y-3 mt-4">

            <div className="flex items-center gap-3">
              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="text-sm bg-white/10 px-3 py-2 rounded-xl">
                {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
              </button>
              <button onClick={() => setCurrentPage('wallet')} className="text-right bg-white/20 px-3 py-2 rounded-xl hover:bg-white/30 transition-all">
                ...
              </button>
            </div>

            <button
              onClick={() => setCurrentPage('ai')}
              className="w-full bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-start gap-4"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <Brain className="text-white" size={28} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">AI Study Assistant</h3>
                <p className="text-gray-600 text-sm">Summarize notes, create flashcards & quizzes</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('marketplace')}
              className="w-full bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-start gap-4"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <ShoppingBag className="text-white" size={28} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Buy Study Notes</h3>
                <p className="text-gray-600 text-sm">Access premium notes from top students</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage('sell')}
              className="w-full bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-start gap-4"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <Upload className="text-white" size={28} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1">Sell Your Notes</h3>
                <p className="text-gray-600 text-sm">Earn money from your study materials</p>
              </div>
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-bold mb-3 text-gray-800">Quick Tools</h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setCurrentPage('gpa')}
                className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all"
              >
                <Calculator className="mx-auto mb-2 text-purple-600" size={24} />
                <span className="text-xs font-medium">GPA Calc</span>
              </button>

              <button 
                onClick={() => setCurrentPage('pomodoro')}
                className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all"
              >
                <Clock className="mx-auto mb-2 text-blue-600" size={24} />
                <span className="text-xs font-medium">Pomodoro</span>
              </button>

              <button 
                onClick={() => setCurrentPage('daily-quiz')}
                className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all"
              >
                <Zap className="mx-auto mb-2 text-yellow-600" size={24} />
                <span className="text-xs font-medium">Daily Quiz</span>
              </button>

            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Featured Notes</h3>
              <button 
                onClick={() => setCurrentPage('marketplace')}
                className="text-purple-600 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {notes.slice(0, 2).map(note => (
                <div key={note.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex gap-3">
                    <div className="text-4xl">📚</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{note.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{note.subject}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          {note.avg_rating || '4.8'}
                        </div>
                        <button className="bg-purple-600 text-white px-4 py-1 rounded-lg text-xs font-medium">
                          ${note.price_usd}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'ai') {
    return (
      <div className="max-w-md mx-auto">
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="bg-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
            <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
            <h2 className="text-2xl font-bold mb-2">AI Study Assistant</h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-sm flex justify-between">
              <span>Credits: ⚡ {user?.credits || 0}</span>
              <span className="font-bold">1 credit per use</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <label className="block text-sm font-medium mb-2">Input your text or upload file</label>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Paste your lecture notes, readings, or study material here..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-32"
              />
              <label className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm w-full block text-center cursor-pointer hover:bg-gray-300">
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleAIFileUpload}
                  className="hidden"
                />
                📎 Or Upload PDF/Image
              </label>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold mb-3">Choose Action:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => callAI('summary')}
                  disabled={loading || !aiInput}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium disabled:bg-gray-300 hover:bg-purple-700 transition-all"
                >
                  📝 Summarize
                </button>
                <button
                  onClick={() => callAI('flashcards')}
                  disabled={loading || !aiInput}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium disabled:bg-gray-300 hover:bg-blue-700 transition-all"
                >
                  🃏 Create Flashcards
                </button>
                <button
                  onClick={() => callAI('quiz')}
                  disabled={loading || !aiInput}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium disabled:bg-gray-300 hover:bg-green-700 transition-all"
                >
                  📋 Generate Quiz
                </button>
              </div>
            </div>

            {loading && (
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="animate-spin mx-auto mb-3 w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                <p className="text-gray-600">AI is processing...</p>
              </div>
            )}

            {aiOutput && !loading && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-bold mb-2">Result:</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                  {aiOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }



   // ----- Tools: GPA -----
  if (currentPage === 'gpa') {
    return (
      <GpaCalculator
        API_URL={API_URL}
        sessionToken={sessionToken}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  // ----- Tools: Pomodoro -----
  if (currentPage === 'pomodoro') {
    return (
      <PomodoroTool
        API_URL={API_URL}
        sessionToken={sessionToken}
        user={user}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  // ----- Tools: Daily Quiz -----
  if (currentPage === 'daily-quiz') {
    return (
      <DailyQuizTool
        API_URL={API_URL}
        sessionToken={sessionToken}
        user={user}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'marketplace') {
    return (
      <div className="max-w-md mx-auto">
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
            <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
            <h2 className="text-2xl font-bold mb-3">Study Notes Marketplace</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="flex-1 px-4 py-2 rounded-lg text-gray-800"
              />
              <button className="bg-white/20 p-2 rounded-lg">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex gap-3">
                  <div className="text-4xl">📚</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{note.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{note.subject}</p>
                    <p className="text-xs text-gray-500 mb-2">by {note.seller_name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        {note.avg_rating || '4.8'}
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{note.purchase_count || 0} purchases</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                        Buy ${note.price_usd}
                      </button>
                      <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'wallet') {
    return (
      <div className="max-w-md mx-auto">
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
            <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
            <h2 className="text-2xl font-bold mb-2">Wallet & Credits</h2>
            <p className="text-green-100 text-sm">Earn credits by watching ads</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">AI Credits</div>
                <div className="text-3xl font-bold mb-1">⚡ {user?.credits || 0}</div>
                <div className="text-xs opacity-75">
                  {user?.plan === 'free' ? 'Free Plan' : 'Unlimited'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">Wallet</div>
                <div className="text-3xl font-bold mb-1">${user?.wallet_balance?.toFixed(2) || '0.00'}</div>
                <div className="text-xs opacity-75">From sales</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Get Free Credits!</h3>
                  <p className="text-sm text-gray-800">Watch a short ad to earn credits</p>
                </div>
                <div className="text-5xl">📺</div>
              </div>

              <button
                onClick={watchRewardedAd}
                disabled={adLoading || adCooldown > 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {adLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin mr-2 w-5 h-5 border-3 border-white border-t-transparent rounded-full"></div>
                    Loading Ad...
                  </span>
                ) : adCooldown > 0 ? (
                  `Wait ${Math.floor(adCooldown / 60)}:${String(adCooldown % 60).padStart(2, '0')}`
                ) : (
                  '📺 Watch Ad → Get +5 Credits'
                )}
              </button>

              <div className="mt-3 text-center text-xs text-gray-700">
                <p>✨ Ads keep NoteX free for students</p>
                <p className="mt-1 opacity-75">You can watch ads every 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'sell') {
    return (
      <div className="max-w-md mx-auto">
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="bg-green-600 text-white p-6 rounded-b-3xl shadow-lg">
            <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
            <h2 className="text-2xl font-bold mb-2">Sell Your Notes</h2>
            <p className="text-green-100 text-sm">Earn money from your study materials</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Note Title</label>
                <input type="text" placeholder="e.g., Calculus I - Complete Notes" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>Computer Science</option>
                  <option>Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea placeholder="Describe what's covered..." className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-24" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (USD)</label>
                  <input type="number" placeholder="5.00" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pages</label>
                  <input type="number" placeholder="10" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                <label className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-all cursor-pointer block">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleSellFileUpload}
                    className="hidden"
                  />
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Click to upload PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 25MB</p>
                </label>
              </div>

              <button 
                onClick={handleSubmitForReview}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NoteXApp;