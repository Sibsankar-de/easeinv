import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { env } from "../configs/env";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email?: string;
      role?: string;
    };
  };
}

let io: SocketIOServer | null = null;

/**
 * Initializes the Socket.IO server attached to the HTTP server.
 * Handles auth verification, user room scoping (user:<userId>), and global error catching.
 */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const origins = env.CORS_ORIGIN.split(",");

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: origins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      // 1. Check token in handshake auth object or cookies
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers.cookie) {
        const rawCookies = socket.handshake.headers.cookie;
        const parsed = cookieParser.signedCookies(
          parseCookieHeader(rawCookies),
          env.ACCESS_TOKEN_SECRET,
        );
        token = parsed.accessToken || parseCookieHeader(rawCookies).accessToken;
      }

      if (!token) {
        log.warn("[Socket.IO] Connection rejected: missing auth token");
        return next(new Error("Authentication required"));
      }

      // 2. Verify JWT token
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as any;
      if (!decoded || !decoded.id) {
        return next(new Error("Invalid auth token"));
      }

      // 3. Attach authenticated user details to socket data
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (err) {
      log.error(`[Socket.IO] Auth verification failed: ${err}`);
      next(new Error("Authentication failed"));
    }
  });

  // Socket Connection Handler
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    const userRoom = `user:${user.id}`;

    socket.join(userRoom);
    log.info(`[Socket.IO] Connected: socket:${socket.id} -> room:${userRoom}`);

    // Join store room event handler (for store-level real-time updates)
    socket.on("join:store", (storeId: string) => {
      if (storeId && typeof storeId === "string") {
        const storeRoom = `store:${storeId}`;
        socket.join(storeRoom);
        log.info(`[Socket.IO] Socket ${socket.id} joined ${storeRoom}`);
      }
    });

    socket.on("leave:store", (storeId: string) => {
      if (storeId && typeof storeId === "string") {
        const storeRoom = `store:${storeId}`;
        socket.leave(storeRoom);
        log.info(`[Socket.IO] Socket ${socket.id} left ${storeRoom}`);
      }
    });

    socket.on("disconnect", (reason) => {
      log.info(`[Socket.IO] Disconnected: socket:${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Returns the singleton Socket.IO server instance.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocketServer(httpServer) first.",
    );
  }
  return io;
}

/**
 * Safely emits a real-time event to a specific user's socket room.
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Safely emits a real-time event to a specific store's socket room.
 */
export function emitToStore(storeId: string, event: string, data: any) {
  if (!io) return;
  io.to(`store:${storeId}`).emit(event, data);
}

/**
 * Helper to parse raw Cookie header string into key-value map.
 */
function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      const key = parts.shift()?.trim();
      const value = decodeURIComponent(parts.join("=").trim());
      if (key) list[key] = value;
    }
  });
  return list;
}
