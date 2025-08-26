-- MIDI Training App - User Statistics and Leaderboard Migration
-- Execute this SQL in Supabase SQL Editor after the main database-setup.sql

-- Add new enum values to existing audit_action type for statistics tracking
ALTER TYPE audit_action ADD VALUE 'STATISTICS_RECORDED';
ALTER TYPE audit_action ADD VALUE 'PERSONAL_BEST_ACHIEVED';
ALTER TYPE audit_action ADD VALUE 'LEADERBOARD_POSITION_CHANGED';

-- User statistics table - stores best performance per user per level
CREATE TABLE user_statistics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Level identification
    module_type VARCHAR(50) NOT NULL, -- 'chord-recognition', 'counterpoint', etc.
    category VARCHAR(50) NOT NULL,     -- 'basic-triads', 'seventh-chords', etc.
    level VARCHAR(50) NOT NULL,        -- 'level1', 'level2', etc.
    
    -- Best performance metrics (for leaderboards)
    best_accuracy DECIMAL(5,2) NOT NULL CHECK (best_accuracy >= 0 AND best_accuracy <= 100),
    best_time DECIMAL(8,3) NOT NULL CHECK (best_time > 0), -- Average time in seconds
    best_score INTEGER NOT NULL CHECK (best_score >= 0),
    
    -- Overall statistics
    total_attempts INTEGER DEFAULT 1 NOT NULL CHECK (total_attempts > 0),
    total_time_played INTEGER DEFAULT 0 NOT NULL, -- Total seconds played
    best_streak INTEGER DEFAULT 0 NOT NULL,
    
    -- Session tracking
    first_played_at TIMESTAMPTZ NOT NULL,
    last_played_at TIMESTAMPTZ NOT NULL,
    best_achieved_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one record per user per level
    UNIQUE(user_id, module_type, category, level)
);

-- Game sessions table - detailed log of every game session
CREATE TABLE game_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session identification
    session_token VARCHAR(255) NOT NULL, -- Anti-cheat: prevent session replay
    module_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    
    -- Performance data
    accuracy DECIMAL(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    avg_time DECIMAL(8,3) NOT NULL CHECK (avg_time > 0),
    total_time INTEGER NOT NULL CHECK (total_time > 0), -- Total session time in seconds
    
    -- Detailed session metrics
    problems_solved INTEGER NOT NULL CHECK (problems_solved > 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
    best_streak INTEGER DEFAULT 0 NOT NULL,
    
    -- Completion status
    completed BOOLEAN NOT NULL,
    passed BOOLEAN NOT NULL,
    
    -- Anti-cheat metadata
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent VARCHAR(500),
    
    -- Performance validation flags
    validated BOOLEAN DEFAULT false NOT NULL,
    suspicious BOOLEAN DEFAULT false NOT NULL,
    validation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent impossible completion times
    CONSTRAINT check_realistic_avg_time CHECK (avg_time >= 0.5), -- Minimum 0.5 seconds average
    CONSTRAINT check_session_duration CHECK (
        EXTRACT(EPOCH FROM (end_time - start_time)) >= problems_solved * 0.5
    ) -- Ensure session was long enough for problems solved
);

-- Leaderboard cache view for performance (materialized view for fast queries)
CREATE MATERIALIZED VIEW leaderboard_cache AS
SELECT 
    us.user_id,
    u.name as user_name,
    u.email as user_email,
    us.module_type,
    us.category,
    us.level,
    us.best_accuracy,
    us.best_time,
    us.best_score,
    us.total_attempts,
    us.best_achieved_at,
    
    -- Ranking calculations (accuracy first, then time)
    ROW_NUMBER() OVER (
        PARTITION BY us.module_type, us.category, us.level 
        ORDER BY us.best_accuracy DESC, us.best_time ASC, us.best_achieved_at ASC
    ) as rank_position,
    
    -- Global ranking (across all levels)
    ROW_NUMBER() OVER (
        ORDER BY us.best_accuracy DESC, us.best_time ASC, us.best_achieved_at ASC
    ) as global_rank
    
FROM user_statistics us
JOIN users u ON us.user_id = u.id
WHERE u.deleted_at IS NULL; -- Exclude deleted users

-- Create indexes for optimal query performance
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_level ON user_statistics(module_type, category, level);
CREATE INDEX idx_user_statistics_performance ON user_statistics(best_accuracy DESC, best_time ASC);
CREATE INDEX idx_user_statistics_updated ON user_statistics(updated_at);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_level ON game_sessions(module_type, category, level);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX idx_game_sessions_session_token ON game_sessions(session_token);
CREATE INDEX idx_game_sessions_suspicious ON game_sessions(suspicious);
CREATE INDEX idx_game_sessions_validation ON game_sessions(validated);

-- Create unique index on leaderboard cache for fast lookups
CREATE UNIQUE INDEX idx_leaderboard_cache_user_level ON leaderboard_cache(user_id, module_type, category, level);
CREATE INDEX idx_leaderboard_cache_ranking ON leaderboard_cache(module_type, category, level, rank_position);
CREATE INDEX idx_leaderboard_cache_global ON leaderboard_cache(global_rank);

-- Function to refresh leaderboard cache
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_cache;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger for user_statistics
CREATE TRIGGER update_user_statistics_updated_at 
    BEFORE UPDATE ON user_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate and record game session
CREATE OR REPLACE FUNCTION record_game_session(
    p_user_id TEXT,
    p_session_token VARCHAR(255),
    p_module_type VARCHAR(50),
    p_category VARCHAR(50),
    p_level VARCHAR(50),
    p_accuracy DECIMAL(5,2),
    p_avg_time DECIMAL(8,3),
    p_total_time INTEGER,
    p_problems_solved INTEGER,
    p_correct_answers INTEGER,
    p_best_streak INTEGER,
    p_completed BOOLEAN,
    p_passed BOOLEAN,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_ip_address INET,
    p_user_agent VARCHAR(500)
)
RETURNS TABLE(
    session_id TEXT,
    is_personal_best BOOLEAN,
    previous_best_accuracy DECIMAL(5,2),
    previous_best_time DECIMAL(8,3),
    new_rank_position INTEGER
) AS $$
DECLARE
    v_session_id TEXT;
    v_is_personal_best BOOLEAN := false;
    v_prev_accuracy DECIMAL(5,2);
    v_prev_time DECIMAL(8,3);
    v_new_rank INTEGER;
    v_is_suspicious BOOLEAN := false;
    v_validation_notes TEXT := '';
BEGIN
    -- Basic validation checks
    IF p_accuracy < 0 OR p_accuracy > 100 THEN
        RAISE EXCEPTION 'Invalid accuracy: %', p_accuracy;
    END IF;
    
    IF p_avg_time < 0.5 THEN
        v_is_suspicious := true;
        v_validation_notes := v_validation_notes || 'Unusually fast average time. ';
    END IF;
    
    IF p_accuracy = 100 AND p_avg_time < 1.0 THEN
        v_is_suspicious := true;
        v_validation_notes := v_validation_notes || 'Perfect accuracy with very fast time. ';
    END IF;
    
    -- Insert game session
    INSERT INTO game_sessions (
        user_id, session_token, module_type, category, level,
        accuracy, avg_time, total_time, problems_solved, correct_answers,
        best_streak, completed, passed, start_time, end_time,
        ip_address, user_agent, suspicious, validation_notes,
        validated
    ) VALUES (
        p_user_id, p_session_token, p_module_type, p_category, p_level,
        p_accuracy, p_avg_time, p_total_time, p_problems_solved, p_correct_answers,
        p_best_streak, p_completed, p_passed, p_start_time, p_end_time,
        p_ip_address, p_user_agent, v_is_suspicious, v_validation_notes,
        NOT v_is_suspicious
    ) RETURNING id INTO v_session_id;
    
    -- Check if this is a personal best
    SELECT best_accuracy, best_time INTO v_prev_accuracy, v_prev_time
    FROM user_statistics 
    WHERE user_id = p_user_id 
      AND module_type = p_module_type 
      AND category = p_category 
      AND level = p_level;
    
    -- Determine if this is a personal best (accuracy first, then time)
    IF v_prev_accuracy IS NULL OR 
       p_accuracy > v_prev_accuracy OR 
       (p_accuracy = v_prev_accuracy AND p_avg_time < v_prev_time) THEN
        v_is_personal_best := true;
        
        -- Update or insert user statistics
        INSERT INTO user_statistics (
            user_id, module_type, category, level,
            best_accuracy, best_time, best_score,
            total_attempts, best_streak,
            first_played_at, last_played_at, best_achieved_at
        ) VALUES (
            p_user_id, p_module_type, p_category, p_level,
            p_accuracy, p_avg_time, p_correct_answers,
            1, p_best_streak,
            NOW(), NOW(), NOW()
        )
        ON CONFLICT (user_id, module_type, category, level) 
        DO UPDATE SET
            best_accuracy = EXCLUDED.best_accuracy,
            best_time = EXCLUDED.best_time,
            best_score = EXCLUDED.best_score,
            total_attempts = user_statistics.total_attempts + 1,
            best_streak = GREATEST(user_statistics.best_streak, EXCLUDED.best_streak),
            last_played_at = NOW(),
            best_achieved_at = CASE 
                WHEN EXCLUDED.best_accuracy > user_statistics.best_accuracy OR
                     (EXCLUDED.best_accuracy = user_statistics.best_accuracy AND 
                      EXCLUDED.best_time < user_statistics.best_time)
                THEN NOW()
                ELSE user_statistics.best_achieved_at
            END;
    ELSE
        -- Just update attempt count and last played
        UPDATE user_statistics SET
            total_attempts = total_attempts + 1,
            last_played_at = NOW()
        WHERE user_id = p_user_id 
          AND module_type = p_module_type 
          AND category = p_category 
          AND level = p_level;
    END IF;
    
    -- Refresh leaderboard cache if this was a personal best
    IF v_is_personal_best THEN
        PERFORM refresh_leaderboard_cache();
        
        -- Get new rank position
        SELECT rank_position INTO v_new_rank
        FROM leaderboard_cache
        WHERE user_id = p_user_id 
          AND module_type = p_module_type 
          AND category = p_category 
          AND level = p_level;
    END IF;
    
    RETURN QUERY SELECT 
        v_session_id,
        v_is_personal_best,
        v_prev_accuracy,
        v_prev_time,
        v_new_rank;
END;
$$ LANGUAGE plpgsql;

-- Create initial leaderboard cache
REFRESH MATERIALIZED VIEW leaderboard_cache;

-- Success message
SELECT 'Statistics and leaderboard tables created successfully!' as result;