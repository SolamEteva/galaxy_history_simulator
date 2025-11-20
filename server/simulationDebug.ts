/**
 * Debug simulation to test database operations
 */

import { getDb } from "./db";
import { galaxies } from "../drizzle/schema";

export async function debugGalaxyCreation() {
  console.log("\n🔍 [DEBUG] Starting galaxy creation test...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    return;
  }

  try {
    console.log("📝 Inserting test galaxy...");
    const result = await db.insert(galaxies).values({
      userId: 1,
      name: "Debug Test Galaxy",
      description: "A test galaxy for debugging",
      seed: "debug-seed-123",
      startYear: 0,
      currentYear: 0,
      endYear: 10000,
      status: "running",
      isPaused: false,
    });

    console.log("\n✅ Insert completed!");
    console.log("Raw result type:", typeof result);
    console.log("Raw result:", JSON.stringify(result, null, 2));

    // Try different ways to extract the ID
    console.log("\n🔎 Attempting to extract ID...");

    const id1 = (result as any).insertId;
    console.log("  - result.insertId:", id1);

    const id2 = (result as any)[0]?.id;
    console.log("  - result[0]?.id:", id2);

    const id3 = (result as any).id;
    console.log("  - result.id:", id3);

    // Check if it's an array
    if (Array.isArray(result)) {
      console.log("  - Result is an array with length:", result.length);
      if (result.length > 0) {
        console.log("  - First element:", JSON.stringify(result[0], null, 2));
      }
    }

    // Check all properties
    console.log("\n📊 All result properties:");
    for (const key in result) {
      console.log(`  - ${key}:`, (result as any)[key]);
    }

    const extractedId = id1 || id2 || id3;
    if (extractedId) {
      console.log(`\n✅ Successfully extracted ID: ${extractedId}`);
    } else {
      console.log("\n❌ Failed to extract ID from result");
    }
  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}
