-- Galaxy History Simulator: Database Optimization Indexes
-- Purpose: Improve query performance for critical operations
-- Created: Phase 1 - Data Persistence & Reliability

-- ============================================================================
-- EVENT INDEXES
-- ============================================================================

-- Composite index for event queries by civilization and type
CREATE INDEX IF NOT EXISTS idx_events_civilization_type 
ON events(civilization_id, event_type, created_at DESC);

-- Index for timeline queries
CREATE INDEX IF NOT EXISTS idx_events_timestamp 
ON events(created_at DESC);

-- Index for causal relationship lookups
CREATE INDEX IF NOT EXISTS idx_events_causal_parent 
ON events(causal_parent_id);

-- Index for event significance queries
CREATE INDEX IF NOT EXISTS idx_events_significance 
ON events(significance DESC);

-- ============================================================================
-- CIVILIZATION INDEXES
-- ============================================================================

-- Index for galaxy civilization lookups
CREATE INDEX IF NOT EXISTS idx_civilizations_galaxy 
ON civilizations(galaxy_id);

-- Index for civilization state queries
CREATE INDEX IF NOT EXISTS idx_civilizations_status 
ON civilizations(status);

-- ============================================================================
-- TRADE NETWORK INDEXES
-- ============================================================================

-- Composite index for trade routes
CREATE INDEX IF NOT EXISTS idx_trade_routes_civilizations 
ON trade_routes(source_civilization_id, destination_civilization_id);

-- Index for trade route status
CREATE INDEX IF NOT EXISTS idx_trade_routes_status 
ON trade_routes(status);

-- ============================================================================
-- FIGURE INDEXES
-- ============================================================================

-- Index for figure lookups by civilization
CREATE INDEX IF NOT EXISTS idx_figures_civilization 
ON figures(civilization_id);

-- Index for genealogy queries
CREATE INDEX IF NOT EXISTS idx_figures_parent 
ON figures(parent_id);

-- Index for figure influence queries
CREATE INDEX IF NOT EXISTS idx_figures_influence 
ON figures(influence_score DESC);

-- ============================================================================
-- ACHIEVEMENT INDEXES
-- ============================================================================

-- Index for achievement queries by civilization
CREATE INDEX IF NOT EXISTS idx_achievements_civilization 
ON achievements(civilization_id);

-- Index for achievement impact queries
CREATE INDEX IF NOT EXISTS idx_achievements_impact 
ON achievements(impact_score DESC);

-- ============================================================================
-- SNAPSHOT INDEXES
-- ============================================================================

-- Index for snapshot queries by galaxy
CREATE INDEX IF NOT EXISTS idx_snapshots_galaxy 
ON snapshots(galaxy_id, created_at DESC);

-- Index for snapshot status
CREATE INDEX IF NOT EXISTS idx_snapshots_status 
ON snapshots(status);

-- ============================================================================
-- SHARED SIMULATION INDEXES
-- ============================================================================

-- Index for public simulations
CREATE INDEX IF NOT EXISTS idx_shared_simulations_public 
ON shared_simulations(is_public, created_at DESC);

-- Index for user simulations
CREATE INDEX IF NOT EXISTS idx_shared_simulations_owner 
ON shared_simulations(owner_id, created_at DESC);

-- Index for trending simulations
CREATE INDEX IF NOT EXISTS idx_shared_simulations_trending 
ON shared_simulations(like_count DESC, created_at DESC);

-- ============================================================================
-- NARRATIVE INDEXES
-- ============================================================================

-- Index for narrative queries by galaxy
CREATE INDEX IF NOT EXISTS idx_narratives_galaxy 
ON narratives(galaxy_id);

-- Index for narrative perspective queries
CREATE INDEX IF NOT EXISTS idx_narratives_perspective 
ON narratives(perspective_type);

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Index for performance metrics queries
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp 
ON performance_metrics(recorded_at DESC);

-- Index for performance alerts
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity 
ON performance_alerts(severity, created_at DESC);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Index for event cascade queries
CREATE INDEX IF NOT EXISTS idx_events_cascade_lookup 
ON events(galaxy_id, causal_parent_id, created_at DESC);

-- Index for civilization history queries
CREATE INDEX IF NOT EXISTS idx_events_civilization_history 
ON events(civilization_id, created_at DESC, significance DESC);

-- Index for trade network analysis
CREATE INDEX IF NOT EXISTS idx_trade_routes_analysis 
ON trade_routes(source_civilization_id, status, created_at DESC);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES (Optional, for narrative search)
-- ============================================================================

-- Full-text index for event descriptions (if using MySQL 5.7+)
-- ALTER TABLE events ADD FULLTEXT INDEX ft_event_description (description);

-- Full-text index for narrative content
-- ALTER TABLE narratives ADD FULLTEXT INDEX ft_narrative_content (narrative_text);

-- ============================================================================
-- STATISTICS AND ANALYSIS
-- ============================================================================

-- After creating indexes, analyze tables for query optimizer
ANALYZE TABLE events;
ANALYZE TABLE civilizations;
ANALYZE TABLE trade_routes;
ANALYZE TABLE figures;
ANALYZE TABLE achievements;
ANALYZE TABLE snapshots;
ANALYZE TABLE shared_simulations;
ANALYZE TABLE narratives;
ANALYZE TABLE performance_metrics;
ANALYZE TABLE performance_alerts;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- These indexes are designed to optimize:
-- 1. Event timeline queries (most common)
-- 2. Civilization state lookups
-- 3. Trade network analysis
-- 4. Genealogy traversal
-- 5. Snapshot management
-- 6. Public simulation discovery
-- 7. Performance monitoring
--
-- Index maintenance:
-- - Monitor index usage with EXPLAIN ANALYZE
-- - Remove unused indexes quarterly
-- - Rebuild fragmented indexes if needed
-- - Update statistics regularly with ANALYZE TABLE
--
-- Performance targets:
-- - Average query time: <100ms
-- - 95th percentile: <500ms
-- - Index creation time: <5 minutes
--
