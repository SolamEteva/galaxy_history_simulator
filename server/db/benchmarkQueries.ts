/**
 * Database Query Benchmarking Utility
 * Measures query performance before and after index deployment
 * Helps validate that indexes provide expected performance improvements
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface BenchmarkResult {
  queryName: string;
  executionTimeMs: number;
  rowsExamined: number;
  rowsReturned: number;
  timestamp: Date;
}

export interface BenchmarkComparison {
  queryName: string;
  beforeMs: number;
  afterMs: number;
  improvementPercent: number;
  rowsExamined: {
    before: number;
    after: number;
  };
}

/**
 * Critical cascade lookup query - most frequently used in simulation
 */
export async function benchmarkCascadeLookup(): Promise<BenchmarkResult> {
  const startTime = performance.now();
  
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');
    
    // Raw SQL query for accurate benchmarking
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM events 
      WHERE galaxy_id = 1 AND year BETWEEN 1000 AND 2000
    `);
    
    const endTime = performance.now();
    
    return {
      queryName: 'Cascade Lookup (galaxy_id + year range)',
      executionTimeMs: endTime - startTime,
      rowsExamined: ((result as any)[0] as any)?.count || 0,
      rowsReturned: 1,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Cascade lookup benchmark failed:', error);
    throw error;
  }
}

/**
 * Event chronology query - retrieves recent events for a civilization
 */
export async function benchmarkEventChronology(): Promise<BenchmarkResult> {
  const startTime = performance.now();
  
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');
    
    const result = await db.execute(sql`
      SELECT * FROM events 
      WHERE civilization_id = 5 
      ORDER BY year DESC 
      LIMIT 100
    `);
    
    const endTime = performance.now();
    const rows = (result as any) || [];
    
    return {
      queryName: 'Event Chronology (civilization_id + year ordering)',
      executionTimeMs: endTime - startTime,
      rowsExamined: Array.isArray(rows) ? rows.length : 0,
      rowsReturned: Array.isArray(rows) ? rows.length : 0,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Event chronology benchmark failed:', error);
    throw error;
  }
}

/**
 * Civilization state lookup - retrieves active civilizations in a galaxy
 */
export async function benchmarkCivilizationLookup(): Promise<BenchmarkResult> {
  const startTime = performance.now();
  
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');
    
    const result = await db.execute(sql`
      SELECT * FROM civilizations 
      WHERE galaxy_id = 1 AND status = 'active'
    `);
    
    const endTime = performance.now();
    const rows = (result as any) || [];
    
    return {
      queryName: 'Civilization Lookup (galaxy_id + status)',
      executionTimeMs: endTime - startTime,
      rowsExamined: Array.isArray(rows) ? rows.length : 0,
      rowsReturned: Array.isArray(rows) ? rows.length : 0,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Civilization lookup benchmark failed:', error);
    throw error;
  }
}

/**
 * Trade network traversal - finds all trade/alliance/conflict events
 */
export async function benchmarkTradeNetworkQuery(): Promise<BenchmarkResult> {
  const startTime = performance.now();
  
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');
    
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM events 
      WHERE event_type IN ('trade', 'alliance', 'conflict') 
      AND year >= 1500
    `);
    
    const endTime = performance.now();
    
    return {
      queryName: 'Trade Network (event_type + year)',
      executionTimeMs: endTime - startTime,
      rowsExamined: ((result as any)[0] as any)?.count || 0,
      rowsReturned: 1,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Trade network benchmark failed:', error);
    throw error;
  }
}

/**
 * Run all benchmark queries and return results
 */
export async function runFullBenchmark(): Promise<BenchmarkResult[]> {
  console.log('Starting full database benchmark suite...\n');
  
  const results: BenchmarkResult[] = [];
  
  try {
    console.log('1/4: Running cascade lookup benchmark...');
    results.push(await benchmarkCascadeLookup());
    
    console.log('2/4: Running event chronology benchmark...');
    results.push(await benchmarkEventChronology());
    
    console.log('3/4: Running civilization lookup benchmark...');
    results.push(await benchmarkCivilizationLookup());
    
    console.log('4/4: Running trade network benchmark...');
    results.push(await benchmarkTradeNetworkQuery());
    
    console.log('\n✓ Benchmark suite completed\n');
    return results;
  } catch (error) {
    console.error('Benchmark suite failed:', error);
    throw error;
  }
}

/**
 * Compare before and after benchmark results
 */
export function compareBenchmarks(
  before: BenchmarkResult[],
  after: BenchmarkResult[]
): BenchmarkComparison[] {
  const comparisons: BenchmarkComparison[] = [];
  
  for (const beforeResult of before) {
    const afterResult = after.find(r => r.queryName === beforeResult.queryName);
    
    if (!afterResult) {
      console.warn(`No after result found for query: ${beforeResult.queryName}`);
      continue;
    }
    
    const improvementPercent = 
      ((beforeResult.executionTimeMs - afterResult.executionTimeMs) / 
       beforeResult.executionTimeMs) * 100;
    
    comparisons.push({
      queryName: beforeResult.queryName,
      beforeMs: beforeResult.executionTimeMs,
      afterMs: afterResult.executionTimeMs,
      improvementPercent,
      rowsExamined: {
        before: beforeResult.rowsExamined,
        after: afterResult.rowsExamined,
      },
    });
  }
  
  return comparisons;
}

/**
 * Print benchmark comparison in human-readable format
 */
export function printBenchmarkComparison(comparisons: BenchmarkComparison[]): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           DATABASE INDEX DEPLOYMENT BENCHMARK RESULTS          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  let totalImprovement = 0;
  
  for (const comparison of comparisons) {
    const status = comparison.improvementPercent > 0 ? '✓' : '✗';
    console.log(`${status} ${comparison.queryName}`);
    console.log(`  Before: ${comparison.beforeMs.toFixed(2)}ms (${comparison.rowsExamined.before} rows)`);
    console.log(`  After:  ${comparison.afterMs.toFixed(2)}ms (${comparison.rowsExamined.after} rows)`);
    console.log(`  Improvement: ${comparison.improvementPercent.toFixed(1)}%\n`);
    
    totalImprovement += comparison.improvementPercent;
  }
  
  const avgImprovement = totalImprovement / comparisons.length;
  console.log(`Overall Average Improvement: ${avgImprovement.toFixed(1)}%`);
  console.log(`Target: 25-50% improvement\n`);
  
  if (avgImprovement >= 25) {
    console.log('✓ Deployment SUCCESSFUL - Performance targets met');
  } else {
    console.log('⚠ Deployment PARTIAL - Consider additional optimization');
  }
}
