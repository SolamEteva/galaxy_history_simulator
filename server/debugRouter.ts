import { publicProcedure, router } from "./_core/trpc";
import { debugGalaxyCreation } from "./simulationDebug";

export const debugRouter = router({
  testDatabaseInsert: publicProcedure.query(async () => {
    console.log("\n🧪 [DEBUG ROUTER] Testing database insert...\n");
    await debugGalaxyCreation();
    return { message: "Debug test completed - check server logs" };
  }),
});
