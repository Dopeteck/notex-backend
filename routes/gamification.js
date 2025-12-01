// routes/gamification.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Your database connection

// GET /api/gamification/stats
router.get('/stats', async (req, res) => {
  try {
    // Get user ID from token (you need to implement auth middleware)
    const userId = req.user?.id || 1; // Default for testing
    
    // Query database for user stats
    const statsResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN type = 'ai_use' THEN 1 END) as total_ai_uses,
        COUNT(CASE WHEN type = 'note_purchase' THEN 1 END) as notes_purchased,
        COUNT(CASE WHEN type = 'note_sale' THEN 1 END) as notes_sold,
        COALESCE(MAX(streak), 0) as study_streak,
        COALESCE(SUM(study_minutes), 0) as total_study_minutes
      FROM user_activities 
      WHERE user_id = $1
    `, [userId]);

    const badgesResult = await db.query(`
      SELECT id, name, description, icon, unlocked
      FROM badges 
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      stats: {
        total_ai_uses: parseInt(statsResult.rows[0]?.total_ai_uses) || 0,
        notes_purchased: parseInt(statsResult.rows[0]?.notes_purchased) || 0,
        notes_sold: parseInt(statsResult.rows[0]?.notes_sold) || 0,
        study_streak: parseInt(statsResult.rows[0]?.study_streak) || 0,
        total_study_minutes: parseInt(statsResult.rows[0]?.total_study_minutes) || 0,
        badges: badgesResult.rows.length > 0 ? badgesResult.rows : [
          { id: 1, name: 'First Steps', description: 'Used AI for the first time', icon: '🎯', unlocked: false },
          { id: 2, name: 'Study Warrior', description: 'Study for 100 minutes', icon: '⚔️', unlocked: false },
          { id: 3, name: 'Seller Pro', description: 'Sell your first note', icon: '💰', unlocked: false },
          { id: 4, name: 'AI Master', description: 'Use AI 50 times', icon: '🧠', unlocked: false },
          { id: 5, name: 'Week Streak', description: '7 day study streak', icon: '🔥', unlocked: false }
        ]
      }
    });
  } catch (error) {
    console.error('Gamification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load gamification stats' 
    });
  }
});

module.exports = router;