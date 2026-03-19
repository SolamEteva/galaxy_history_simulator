/**
 * Collaborative Sharing Router
 * 
 * Handles:
 * - Sharing simulations with other users
 * - Sharing narratives and insights
 * - Access control and permissions
 * - Community discovery and browsing
 * - Collaborative annotations and comments
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";

// In-memory sharing store (in production, use database)
interface SharedSimulation {
  id: string;
  simulationId: string;
  ownerId: string;
  title: string;
  description: string;
  accessLevel: "private" | "friends" | "public";
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likes: number;
  tags: string[];
}

interface SharedNarrative {
  id: string;
  narrativeId: string;
  ownerId: string;
  title: string;
  description: string;
  accessLevel: "private" | "friends" | "public";
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likes: number;
  tags: string[];
}

const sharedSimulations = new Map<string, SharedSimulation>();
const sharedNarratives = new Map<string, SharedNarrative>();

export const collaborativeSharingRouter = router({
  /**
   * Share a simulation
   */
  shareSimulation: protectedProcedure
    .input(
      z.object({
        simulationId: z.string(),
        title: z.string(),
        description: z.string(),
        accessLevel: z.enum(["private", "friends", "public"]),
        sharedWith: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const shared: SharedSimulation = {
        id: shareId,
        simulationId: input.simulationId,
        ownerId: String(ctx.user?.id || "anonymous"),
        title: input.title,
        description: input.description,
        accessLevel: input.accessLevel,
        sharedWith: input.sharedWith || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likes: 0,
        tags: input.tags || [],
      };

      sharedSimulations.set(shareId, shared);

      console.log(`Simulation ${input.simulationId} shared as ${shareId}`);

      return {
        success: true,
        shareId,
        shareUrl: `/shared/simulation/${shareId}`,
        accessLevel: input.accessLevel,
      };
    }),

  /**
   * Share a narrative
   */
  shareNarrative: protectedProcedure
    .input(
      z.object({
        narrativeId: z.string(),
        title: z.string(),
        description: z.string(),
        accessLevel: z.enum(["private", "friends", "public"]),
        sharedWith: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shareId = `narrative_share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const shared: SharedNarrative = {
        id: shareId,
        narrativeId: input.narrativeId,
        ownerId: String(ctx.user?.id || "anonymous"),
        title: input.title,
        description: input.description,
        accessLevel: input.accessLevel,
        sharedWith: input.sharedWith || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likes: 0,
        tags: input.tags || [],
      };

      sharedNarratives.set(shareId, shared);

      console.log(`Narrative ${input.narrativeId} shared as ${shareId}`);

      return {
        success: true,
        shareId,
        shareUrl: `/shared/narrative/${shareId}`,
        accessLevel: input.accessLevel,
      };
    }),

  /**
   * Get shared simulation details
   */
  getSharedSimulation: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(({ input }) => {
      const shared = sharedSimulations.get(input.shareId);
      if (!shared) {
        throw new Error("Shared simulation not found");
      }

      // Increment view count
      shared.viewCount++;

      return {
        shareId: shared.id,
        simulationId: shared.simulationId,
        title: shared.title,
        description: shared.description,
        owner: shared.ownerId,
        createdAt: shared.createdAt,
        viewCount: shared.viewCount,
        likes: shared.likes,
        tags: shared.tags,
      };
    }),

  /**
   * Get shared narrative details
   */
  getSharedNarrative: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(({ input }) => {
      const shared = sharedNarratives.get(input.shareId);
      if (!shared) {
        throw new Error("Shared narrative not found");
      }

      // Increment view count
      shared.viewCount++;

      return {
        shareId: shared.id,
        narrativeId: shared.narrativeId,
        title: shared.title,
        description: shared.description,
        owner: shared.ownerId,
        createdAt: shared.createdAt,
        viewCount: shared.viewCount,
        likes: shared.likes,
        tags: shared.tags,
      };
    }),

  /**
   * Browse public simulations
   */
  browsePublicSimulations: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
        offset: z.number().min(0).optional().default(0),
        sortBy: z.enum(["recent", "popular", "trending"]).optional().default("recent"),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(({ input }) => {
      let simulations = Array.from(sharedSimulations.values()).filter(
        (sim) => sim.accessLevel === "public"
      );

      // Filter by tags
      if (input.tags && input.tags.length > 0) {
        simulations = simulations.filter((sim) =>
          input.tags!.some((tag) => sim.tags.includes(tag))
        );
      }

      // Sort
      if (input.sortBy === "popular") {
        simulations.sort((a, b) => b.viewCount - a.viewCount);
      } else if (input.sortBy === "trending") {
        simulations.sort((a, b) => b.likes - a.likes);
      } else {
        simulations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // Paginate
      const paginated = simulations.slice(input.offset, input.offset + input.limit);

      return {
        simulations: paginated.map((sim) => ({
          shareId: sim.id,
          title: sim.title,
          description: sim.description,
          owner: sim.ownerId,
          createdAt: sim.createdAt,
          viewCount: sim.viewCount,
          likes: sim.likes,
          tags: sim.tags,
        })),
        total: simulations.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Browse public narratives
   */
  browsePublicNarratives: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
        offset: z.number().min(0).optional().default(0),
        sortBy: z.enum(["recent", "popular", "trending"]).optional().default("recent"),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(({ input }) => {
      let narratives = Array.from(sharedNarratives.values()).filter(
        (nar) => nar.accessLevel === "public"
      );

      // Filter by tags
      if (input.tags && input.tags.length > 0) {
        narratives = narratives.filter((nar) =>
          input.tags!.some((tag) => nar.tags.includes(tag))
        );
      }

      // Sort
      if (input.sortBy === "popular") {
        narratives.sort((a, b) => b.viewCount - a.viewCount);
      } else if (input.sortBy === "trending") {
        narratives.sort((a, b) => b.likes - a.likes);
      } else {
        narratives.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // Paginate
      const paginated = narratives.slice(input.offset, input.offset + input.limit);

      return {
        narratives: paginated.map((nar) => ({
          shareId: nar.id,
          title: nar.title,
          description: nar.description,
          owner: nar.ownerId,
          createdAt: nar.createdAt,
          viewCount: nar.viewCount,
          likes: nar.likes,
          tags: nar.tags,
        })),
        total: narratives.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Like a shared simulation
   */
  likeSimulation: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(({ input }) => {
      const shared = sharedSimulations.get(input.shareId);
      if (!shared) {
        throw new Error("Shared simulation not found");
      }

      shared.likes++;

      return {
        success: true,
        shareId: input.shareId,
        likes: shared.likes,
      };
    }),

  /**
   * Like a shared narrative
   */
  likeNarrative: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(({ input }) => {
      const shared = sharedNarratives.get(input.shareId);
      if (!shared) {
        throw new Error("Shared narrative not found");
      }

      shared.likes++;

      return {
        success: true,
        shareId: input.shareId,
        likes: shared.likes,
      };
    }),

  /**
   * Add comment to shared simulation
   */
  addSimulationComment: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        comment: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shared = sharedSimulations.get(input.shareId);
      if (!shared) {
        throw new Error("Shared simulation not found");
      }

      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, store comment in database
      console.log(`Comment added to simulation ${input.shareId}: ${input.comment}`);

      return {
        success: true,
        commentId,
        author: ctx.user!.id,
        comment: input.comment,
        createdAt: new Date(),
      };
    }),

  /**
   * Add comment to shared narrative
   */
  addNarrativeComment: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        comment: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shared = sharedNarratives.get(input.shareId);
      if (!shared) {
        throw new Error("Shared narrative not found");
      }

      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, store comment in database
      console.log(`Comment added to narrative ${input.shareId}: ${input.comment}`);

      return {
        success: true,
        commentId,
        author: ctx.user!.id,
        comment: input.comment,
        createdAt: new Date(),
      };
    }),

  /**
   * Update share permissions
   */
  updateSharePermissions: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        type: z.enum(["simulation", "narrative"]),
        accessLevel: z.enum(["private", "friends", "public"]),
        sharedWith: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.type === "simulation" as const) {
        const shared = sharedSimulations.get(input.shareId);
        if (!shared) {
          throw new Error("Shared simulation not found");
        }
        if (shared.ownerId !== (ctx.user?.id || "")) {
          throw new Error("Unauthorized");
        }

        shared.accessLevel = input.accessLevel;
        shared.sharedWith = input.sharedWith || [];
        shared.updatedAt = new Date();
      } else if (input.type === "narrative" as const) {
        const shared = sharedNarratives.get(input.shareId);
        if (!shared) {
          throw new Error("Shared narrative not found");
        }
        if (shared.ownerId !== (ctx.user?.id || "")) {
          throw new Error("Unauthorized");
        }

        shared.accessLevel = input.accessLevel;
        shared.sharedWith = input.sharedWith || [];
        shared.updatedAt = new Date();
      }

      return {
        success: true,
        shareId: input.shareId,
        accessLevel: input.accessLevel,
      };
    }),

  /**
   * Delete share
   */
  deleteShare: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        type: z.enum(["simulation", "narrative"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.type === "simulation" as const) {
        const shared = sharedSimulations.get(input.shareId);
        if (!shared) {
          throw new Error("Shared simulation not found");
        }
        if (shared.ownerId !== (ctx.user?.id || "")) {
          throw new Error("Unauthorized");
        }

        sharedSimulations.delete(input.shareId);
      } else if (input.type === "narrative" as const) {
        const shared = sharedNarratives.get(input.shareId);
        if (!shared) {
          throw new Error("Shared narrative not found");
        }
        if (shared.ownerId !== (ctx.user?.id || "")) {
          throw new Error("Unauthorized");
        }

        sharedNarratives.delete(input.shareId);
      }

      return {
        success: true,
        shareId: input.shareId,
        deleted: true,
      };
    }),

  /**
   * Get trending tags
   */
  getTrendingTags: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(20) }))
    .query(({ input }) => {
      const tagCounts = new Map<string, number>();

      // Count tags from public simulations
      Array.from(sharedSimulations.values())
        .filter((sim) => sim.accessLevel === "public")
        .forEach((sim) => {
          sim.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });

      // Count tags from public narratives
      Array.from(sharedNarratives.values())
        .filter((nar) => nar.accessLevel === "public")
        .forEach((nar) => {
          nar.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });

      // Sort by count and return top
      const trending = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, input.limit)
        .map(([tag, count]) => ({ tag, count }));

      return { tags: trending };
    }),
});

export default collaborativeSharingRouter;
