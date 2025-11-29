import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, ShoppingBag, Upload, Zap, Calculator, Clock, TrendingUp, Star, Search, Filter, DollarSign } from 'lucide-react';
<img src={logo} alt="Logo" />


const NoteXApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [adLoading, setAdLoading] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);
  const [notes, setNotes] = useState([
    { id: 1, title: 'Calculus I - Key Theorems', subject: 'Mathematics', price: 4, rating: 4.8, featured: true, thumbnail: '📐' },
    { id: 2, title: 'Organic Chemistry Mechanisms', subject: 'Chemistry', price: 6, rating: 4.9, featured: true, thumbnail: '🧪' },
    { id: 3, title: 'Microeconomics - Past Questions', subject: 'Economics', price: 5, rating: 4.7, featured: false, thumbnail: '📊' },
    { id: 4, title: 'Data Structures & Algorithms', subject: 'Computer Science', price: 3, rating: 4.6, featured: false, thumbnail: '💻' },
  ]);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Mock user from Telegram data
      setUser({
        id: tg.initDataUnsafe?.user?.id || 'demo123',
        username: tg.initDataUnsafe?.user?.username || 'DemoStudent',
        plan: 'free',
        walletBalance: 45.50
      });

      // Set theme colors
      tg.setHeaderColor('#7c3aed');
      tg.setBackgroundColor('#ffffff');
    } else {
      // Demo user for testing
      setUser({ 
        id: 'demo123', 
        username: 'DemoStudent', 
        plan: 'free',
        walletBalance: 45.50 
      });
    }

    // Check ad cooldown from storage
    const lastAdTime = localStorage.getItem('lastAdTime');
    if (lastAdTime) {
      const timePassed = Date.now() - parseInt(lastAdTime);
      const cooldownRemaining = Math.max(0, 300000 - timePassed); // 5 min cooldown
      if (cooldownRemaining > 0) {
        setAdCooldown(Math.ceil(cooldownRemaining / 1000));
      }
    }
  }, []);

  const simulateAI = async (type) => {
    if (credits <= 0) {
      alert('No credits left! Upgrade to Pro for unlimited access.');
      return;
    }
    
    setLoading(true);
    setCredits(prev => prev - 1);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = {
      summary: `📝 Summary:\n\n• Key concept 1: Lorem ipsum dolor sit amet\n• Key concept 2: Consectetur adipiscing elit\n• Key concept 3: Sed do eiusmod tempor\n\n💡 Main takeaway: This content covers fundamental principles essential for understanding the topic.`,
      flashcards: `🃏 Flashcard Set Generated:\n\nCard 1:\nQ: What is the main concept?\nA: The fundamental principle discussed\n\nCard 2:\nQ: How does it apply?\nA: Through practical implementation\n\n✅ 5 flashcards created and saved to your library!`,
      quiz: `📋 Practice Quiz:\n\n1. Multiple choice question here?\n   a) Option A\n   b) Option B ✓\n   c) Option C\n   d) Option D\n\n2. True or False: Statement here?\n   Answer: True ✓\n\n🎯 Score: Complete the quiz to see results!`
    };
    
    setAiOutput(responses[type] || responses.summary);
    setLoading(false);
  };

  const watchRewardedAd = async () => {
    if (adCooldown > 0) {
      alert(`Please wait ${Math.ceil(adCooldown / 60)} minutes before watching another ad`);
      return;
    }

    setAdLoading(true);

    // INTEGRATE YOUR AD NETWORK HERE
    // Example integrations shown below in comments
    
    try {
      // Option 1: AdSense for Games (Google)
      // if (window.adsbygoogle) {
      //   await window.adsbygoogle.push({
      //     google_ad_client: "ca-pub-XXXXXXXXX",
      //     enable_page_level_ads: true
      //   });
      // }

      // Option 2: Yandex Advertising Network
      // if (window.yaContextCb) {
      //   window.yaContextCb.push(() => {
      //     Ya.Context.AdvManager.render({
      //       blockId: "R-A-XXXXXX-X",
      //       renderTo: "yandex-ad-container"
      //     });
      //   });
      // }

      // Option 3: Telegram Ad Platform (when available)
      // if (window.Telegram?.WebApp?.showAd) {
      //   await window.Telegram.WebApp.showAd();
      // }

      // Simulate ad watching (remove in production)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // After successful ad view, call backend
      const response = await fetch('https://your-api.com/api/users/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.sessionToken}`
        },
        body: JSON.stringify({
          type: 'rewarded_ad',
          amount: 5
        })
      });

      if (response.ok) {
        setCredits(prev => prev + 5);
        
        // Set cooldown
        const now = Date.now();
        localStorage.setItem('lastAdTime', now.toString());
        setAdCooldown(300); // 5 minutes in seconds
        
        // Countdown timer
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
      }
    } catch (error) {
      console.error('Ad error:', error);
      alert('Ad failed to load. Please try again.');
    } finally {
      setAdLoading(false);
    }
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
      {/* Header */}
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
            <div className="text-sm font-bold">⚡ {credits} credits</div>
            <div className="text-xs text-purple-200">💰 ${user?.walletBalance?.toFixed(2)}</div>
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm">
          👋 Welcome, {user?.username}!
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="p-4 space-y-3 mt-4">
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

      {/* Quick Tools */}
      <div className="p-4">
        <h3 className="font-bold mb-3 text-gray-800">Quick Tools</h3>
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all">
            <Calculator className="mx-auto mb-2 text-purple-600" size={24} />
            <span className="text-xs font-medium">GPA Calc</span>
          </button>
          <button className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all">
            <Clock className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-xs font-medium">Pomodoro</span>
          </button>
          <button className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition-all">
            <Zap className="mx-auto mb-2 text-yellow-600" size={24} />
            <span className="text-xs font-medium">Daily Quiz</span>
          </button>
        </div>
      </div>

      {/* Featured Notes */}
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
          {notes.filter(n => n.featured).slice(0, 2).map(note => (
            <div key={note.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex gap-3">
                <div className="text-4xl">{note.thumbnail}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{note.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{note.subject}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {note.rating}
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-1 rounded-lg text-xs font-medium">
                      ${note.price}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      {user?.plan === 'free' && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-white">
          <h3 className="font-bold mb-2">🚀 Upgrade to Pro</h3>
          <p className="text-sm text-purple-100 mb-3">Unlimited AI credits, priority support, and exclusive notes</p>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold text-sm w-full">
            Start Free Trial - $5/mo
          </button>
        </div>
      )}
    </div>
  );

  const AIAssistantPage = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
        <h2 className="text-2xl font-bold mb-2">AI Study Assistant</h2>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-sm flex justify-between">
          <span>Credits: ⚡ {credits}</span>
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
          <button className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm w-full">
            📎 Or Upload PDF/Image
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-bold mb-3">Choose Action:</h3>
          <div className="space-y-2">
            <button
              onClick={() => simulateAI('summary')}
              disabled={loading || !aiInput}
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium disabled:bg-gray-300 hover:bg-purple-700 transition-all"
            >
              📝 Summarize
            </button>
            <button
              onClick={() => simulateAI('flashcards')}
              disabled={loading || !aiInput}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium disabled:bg-gray-300 hover:bg-blue-700 transition-all"
            >
              🃏 Create Flashcards
            </button>
            <button
              onClick={() => simulateAI('quiz')}
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
            <div className="mt-3 flex gap-2">
              <button className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                💾 Save
              </button>
              <button className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                📤 Share
              </button>
            </div>
          </div>
        )}

        {credits === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 mb-2">⚠️ No credits remaining</p>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-full">
              Watch Ad for +1 Credit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MarketplacePage = () => (
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
        {/* Sponsored Note */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-1">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">✨ FEATURED</span>
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex gap-3">
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Complete Exam Prep Bundle</h4>
                <p className="text-xs text-gray-600 mb-2">All subjects • 50+ documents</p>
                <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">
                  Get Bundle - $29
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Notes */}
        {notes.map(note => (
          <div key={note.id} className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex gap-3">
              <div className="text-4xl">{note.thumbnail}</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">{note.title}</h4>
                <p className="text-xs text-gray-600 mb-1">{note.subject}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    {note.rating}
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">127 purchases</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    Buy ${note.price}
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
  );

  const WalletPage = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
        <h2 className="text-2xl font-bold mb-2">Wallet & Credits</h2>
        <p className="text-green-100 text-sm">Earn credits by watching ads</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">AI Credits</div>
            <div className="text-3xl font-bold mb-1">⚡ {credits}</div>
            <div className="text-xs opacity-75">
              {user?.plan === 'free' ? 'Free Plan' : 'Unlimited'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-1">Wallet</div>
            <div className="text-3xl font-bold mb-1">${user?.walletBalance?.toFixed(2)}</div>
            <div className="text-xs opacity-75">From sales</div>
          </div>
        </div>

        {/* Watch Ad Card - BIG PROMINENT BUTTON */}
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

        {/* Credit Usage Stats */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📊</span> Credit Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Total Credits Earned</span>
              <span className="font-bold text-purple-600">127</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Credits Used</span>
              <span className="font-bold text-blue-600">122</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">From Ads</span>
              <span className="font-bold text-green-600">45 credits</span>
            </div>
          </div>
        </div>

        {/* Seller Wallet Section */}
        {user?.walletBalance > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>💰</span> Seller Earnings
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                <div className="text-2xl font-bold text-green-600">
                  ${user?.walletBalance?.toFixed(2)}
                </div>
              </div>
              <button 
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition-all disabled:bg-gray-300"
                disabled={user?.walletBalance < 20}
              >
                {user?.walletBalance < 20 
                  ? `Minimum $20 to withdraw (Need ${(20 - user?.walletBalance).toFixed(2)})` 
                  : 'Request Payout'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Payouts processed in 3-5 business days via PayPal
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {user?.plan === 'free' && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2 text-lg">⭐ Upgrade to Pro</h3>
            <ul className="text-sm space-y-1 mb-3 opacity-90">
              <li>✓ Unlimited AI credits</li>
              <li>✓ No ads (optional)</li>
              <li>✓ Priority support</li>
              <li>✓ Exclusive notes access</li>
            </ul>
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold text-sm w-full hover:bg-purple-50 transition-all">
              Start Free Trial - $5/mo
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-bold text-blue-900 text-sm mb-2">💡 How to Earn Credits</h4>
          <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
            <li>Watch ads: +5 credits (every 5 min)</li>
            <li>Invite friends: +10 credits per referral</li>
            <li>Upload quality notes: +20 credits</li>
            <li>Daily login: +2 credits</li>
            <li>Upgrade to Pro: Unlimited credits</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const SellNotePage = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-green-600 text-white p-6 rounded-b-3xl shadow-lg">
        <button onClick={() => setCurrentPage('home')} className="mb-3 text-sm">← Back</button>
        <h2 className="text-2xl font-bold mb-2">Sell Your Notes</h2>
        <p className="text-green-100 text-sm">Earn money from your study materials</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">💰 Earnings Potential</h3>
          <p className="text-sm text-gray-700">Average seller earns $50-200/month. Top sellers make $500+</p>
        </div>

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
              <option>Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea placeholder="Describe what's covered in your notes..." className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-24" />
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
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-all">
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm text-gray-600">Click to upload PDF</p>
              <p className="text-xs text-gray-400 mt-1">Max 25MB</p>
            </button>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <p className="text-xs text-gray-600">
              I confirm this is my original work and I have the right to sell it. I agree to the 30% platform fee.
            </p>
          </div>

          <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition-all">
            Submit for Review
          </button>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-bold text-blue-900 text-sm mb-2">📌 Tips for Success</h4>
          <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
            <li>Clear, well-organized notes sell best</li>
            <li>Include diagrams and examples</li>
            <li>Price competitively ($3-8 sweet spot)</li>
            <li>Add detailed descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'ai' && <AIAssistantPage />}
      {currentPage === 'marketplace' && <MarketplacePage />}
      {currentPage === 'sell' && <SellNotePage />}
      {currentPage === 'wallet' && <WalletPage />}
    </div>
  );
};

export default NoteXApp;