/*
  # User Stats and Gamification System

  1. New Tables
    - user_stats: Core stats and progression tracking
    - user_achievements: Achievement and badge tracking
    - achievement_definitions: Available achievements
    - level_definitions: Level progression rules

  2. Functions
    - calculate_user_level: Determines user level based on XP
    - update_user_stats: Updates stats after activities
    - check_achievements: Validates and awards achievements
    - calculate_engagement_metrics: Updates engagement stats

  3. Triggers
    - auto_update_stats: Updates stats on activity changes
    - check_level_up: Checks for level progression
    - verify_achievements: Validates achievement completion
*/

-- Level definitions table
CREATE TABLE level_definitions (
    level INTEGER PRIMARY KEY,
    xp_required INTEGER NOT NULL,
    title TEXT NOT NULL,
    benefits JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievement definitions table
CREATE TABLE achievement_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    requirements JSONB NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Core user stats table
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    last_level_up TIMESTAMPTZ DEFAULT now(),
    
    -- Participation metrics
    events_attended INTEGER NOT NULL DEFAULT 0,
    events_organized INTEGER NOT NULL DEFAULT 0,
    activity_score INTEGER NOT NULL DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0,
    platform_time_minutes INTEGER DEFAULT 0,
    
    -- Engagement stats
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    favorite_categories JSONB DEFAULT '[]'::jsonb,
    event_diversity_score DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT fk_level FOREIGN KEY (current_level) REFERENCES level_definitions(level),
    CONSTRAINT valid_attendance_rate CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
    CONSTRAINT valid_diversity_score CHECK (event_diversity_score >= 0 AND event_diversity_score <= 100)
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    progress JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(user_id, achievement_id)
);

-- Function to calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT level
        FROM level_definitions
        WHERE xp_required <= p_xp
        ORDER BY level DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update activity score
CREATE OR REPLACE FUNCTION calculate_activity_score(
    p_events_attended INTEGER,
    p_events_organized INTEGER,
    p_streak INTEGER
) RETURNS INTEGER AS $$
BEGIN
    RETURN (
        p_events_attended * 10 +
        p_events_organized * 20 +
        p_streak * 5
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate new level based on XP
    IF NEW.total_xp != OLD.total_xp THEN
        NEW.current_level := calculate_user_level(NEW.total_xp);
        
        -- Check if leveled up
        IF NEW.current_level > OLD.current_level THEN
            NEW.last_level_up := now();
        END IF;
    END IF;
    
    -- Update activity score
    NEW.activity_score := calculate_activity_score(
        NEW.events_attended,
        NEW.events_organized,
        NEW.current_streak
    );
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user_stats updates
CREATE TRIGGER on_user_stats_update
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user initialization
CREATE TRIGGER on_auth_user_created_stats
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stats"
    ON user_stats FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their achievements"
    ON user_achievements FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Everyone can view level definitions"
    ON level_definitions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Everyone can view achievement definitions"
    ON achievement_definitions FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial level definitions
INSERT INTO level_definitions (level, xp_required, title, benefits) VALUES
    (1, 0, 'Novato', '{"badge": "novato", "color": "gray"}'::jsonb),
    (2, 100, 'Iniciado', '{"badge": "iniciado", "color": "green"}'::jsonb),
    (3, 300, 'Entusiasta', '{"badge": "entusiasta", "color": "blue"}'::jsonb),
    (4, 600, 'Veterano', '{"badge": "veterano", "color": "purple"}'::jsonb),
    (5, 1000, 'Experto', '{"badge": "experto", "color": "gold"}'::jsonb),
    (6, 1500, 'Maestro', '{"badge": "maestro", "color": "rainbow"}'::jsonb),
    (7, 2100, 'Leyenda', '{"badge": "leyenda", "color": "legendary"}'::jsonb),
    (8, 2800, 'Mítico', '{"badge": "mitico", "color": "mythic"}'::jsonb),
    (9, 3600, 'Supremo', '{"badge": "supremo", "color": "supreme"}'::jsonb),
    (10, 4500, 'Divino', '{"badge": "divino", "color": "divine"}'::jsonb);

-- Insert initial achievements
INSERT INTO achievement_definitions (name, description, category, requirements, xp_reward) VALUES
    ('Primer Paso', 'Asiste a tu primer evento', 'participacion', '{"events_attended": 1}'::jsonb, 50),
    ('Organizador Novato', 'Organiza tu primer evento', 'organizacion', '{"events_organized": 1}'::jsonb, 100),
    ('Asistente Frecuente', 'Asiste a 10 eventos', 'participacion', '{"events_attended": 10}'::jsonb, 200),
    ('Racha Inicial', 'Mantén una racha de 3 eventos', 'compromiso', '{"current_streak": 3}'::jsonb, 150),
    ('Explorador', 'Asiste a eventos de 5 categorías diferentes', 'diversidad', '{"unique_categories": 5}'::jsonb, 300),
    ('Organizador Experto', 'Organiza 5 eventos exitosos', 'organizacion', '{"events_organized": 5}'::jsonb, 400),
    ('Maestro del Tiempo', 'Acumula 1000 minutos en la plataforma', 'compromiso', '{"platform_time_minutes": 1000}'::jsonb, 250),
    ('Racha Legendaria', 'Mantén una racha de 10 eventos', 'compromiso', '{"current_streak": 10}'::jsonb, 500);

-- Create indexes for performance
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_stats_level ON user_stats(current_level);
CREATE INDEX idx_user_stats_xp ON user_stats(total_xp);