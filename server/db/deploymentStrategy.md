# Phase 1 Index Deployment Strategy

## Database Engine: MySQL/TiDB

### Pre-Deployment Checklist

1. **Identify Low-Load Window**: Apply indexes during off-peak hours (typically 2-4 AM UTC)
2. **Backup Database**: Ensure fresh backup exists before deployment
3. **Monitor Connections**: Check active connections before starting
4. **Test on Staging**: Deploy to staging environment first, benchmark, then proceed to production

### Deployment Phases

#### Phase 1: Pre-Deployment Benchmarking

Run these queries on the production database to establish baseline performance:

```sql
-- Cascade lookup performance (critical path)
SELECT SQL_NO_CACHE COUNT(*) FROM events 
WHERE galaxy_id = 1 AND year BETWEEN 1000 AND 2000;

-- Event chronology query
SELECT SQL_NO_CACHE * FROM events 
WHERE civilization_id = 5 
ORDER BY year DESC 
LIMIT 100;

-- Civilization state lookup
SELECT SQL_NO_CACHE * FROM civilizations 
WHERE galaxy_id = 1 AND status = 'active';

-- Trade network traversal
SELECT SQL_NO_CACHE COUNT(*) FROM events 
WHERE event_type IN ('trade', 'alliance', 'conflict') 
AND year >= 1500;
```

Record execution times and row counts examined.

#### Phase 2: Index Deployment (MySQL)

**Important**: MySQL will lock tables during index creation. Use the following approach:

```sql
-- For smaller tables (< 1M rows): Direct index creation is acceptable
CREATE INDEX idx_events_galaxy_year ON events(galaxy_id, year);

-- For larger tables: Consider using ALGORITHM=INPLACE, LOCK=NONE if available
-- (requires MySQL 5.7.3+ with InnoDB)
ALTER TABLE events ADD INDEX idx_events_galaxy_year (galaxy_id, year), ALGORITHM=INPLACE, LOCK=NONE;
```

**Deployment Order** (apply in this sequence to minimize lock contention):

1. Smaller lookup tables first (species, planets, users)
2. Medium tables (civilizations, agent_configurations)
3. Large tables (events, cascades) - apply during lowest traffic window

#### Phase 3: Post-Deployment Benchmarking

Run the same baseline queries again and compare:

```
Query 1 (Cascade lookup):
  Before: X ms, Y rows examined
  After: X' ms, Y' rows examined
  Improvement: ((X - X') / X) * 100%

Query 2 (Event chronology):
  Before: X ms, Y rows examined
  After: X' ms, Y' rows examined
  Improvement: ((X - X') / X) * 100%
```

Target: 30-50% latency reduction on indexed queries.

#### Phase 4: Verification

```sql
-- Verify all indexes were created
SHOW INDEX FROM events;
SHOW INDEX FROM civilizations;
SHOW INDEX FROM cascades;

-- Check index usage statistics
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_NAME IN ('events', 'civilizations', 'cascades');
```

### Rollback Procedure

If performance degrades after deployment:

```sql
-- Drop problematic indexes
DROP INDEX idx_events_galaxy_year ON events;
DROP INDEX idx_civilizations_galaxy_status ON civilizations;
-- ... etc

-- Restore from backup if necessary
```

### Monitoring During Deployment

Watch these metrics:

- **Active Connections**: Should remain stable
- **Lock Wait Time**: Should not exceed 1-2 seconds
- **Query Latency**: Should improve post-deployment
- **Disk I/O**: May spike during index creation (normal)

### Expected Results

After successful deployment:

- Cascade lookups: 40-50% faster
- Event chronology queries: 30-40% faster
- Civilization state lookups: 25-35% faster
- Trade network queries: 35-45% faster

Total query throughput should increase by 25-35% under load.

### Next Steps

1. Schedule deployment during maintenance window
2. Execute pre-deployment benchmarks
3. Deploy indexes in recommended order
4. Execute post-deployment benchmarks
5. Wire PerformanceDashboard with baseline thresholds
6. Monitor for 48 hours before considering deployment complete
