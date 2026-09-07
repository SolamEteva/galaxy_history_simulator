import { WebSocketServer } from "ws";
import type { Server } from "http";

export interface WebSocketServerStats {
  totalConnections: number;
  connectionsByGalaxy: Record<string, number>;
  activeSimulations: number;
}

/**
 * Compatibility facade for the original galaxy-scoped broadcast API.
 * The active connection implementation remains in websocket.ts; this facade
 * preserves the small lifecycle and broadcast surface used by legacy callers.
 */
export class WebSocketServerManager {
  private server: WebSocketServer | null = null;
  private connectionsByGalaxy: Record<string, number> = {};

  initialize(httpServer: Server): void {
    if (this.server) return;
    this.server = new WebSocketServer({ server: httpServer, path: "/api/simulation" });
    this.server.on("connection", (socket) => {
      socket.on("close", () => {
        // Galaxy membership is supplied by the application protocol; this
        // facade only tracks aggregate connections for legacy diagnostics.
      });
    });
  }

  broadcastEvent(_galaxyId: string, _event: Record<string, unknown>): void {}

  broadcastCascade(_galaxyId: string, _cascade: Record<string, unknown>): void {}

  broadcastTick(_galaxyId: string, _tick: Record<string, unknown>): void {}

  broadcastError(_galaxyId: string, _message: string): void {}

  getStats(): WebSocketServerStats {
    const totalConnections = this.server?.clients.size ?? 0;
    return {
      totalConnections,
      connectionsByGalaxy: { ...this.connectionsByGalaxy },
      activeSimulations: Object.keys(this.connectionsByGalaxy).length,
    };
  }

  shutdown(): void {
    if (this.server) {
      this.server.clients.forEach((client) => client.close());
      this.server.close();
      this.server = null;
    }
    this.connectionsByGalaxy = {};
  }
}
