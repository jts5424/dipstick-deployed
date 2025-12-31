import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Options } from "http-proxy-middleware";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Proxy all /api/prototype/* requests to the prototype backend
  // The prototype backend should run on a separate port (default 5001)
  // to avoid conflicts with the main server (port 5000)
  const PROTOTYPE_BACKEND_URL = process.env.PROTOTYPE_BACKEND_URL || "http://localhost:5001";
  
  app.use(
    "/api/prototype",
    createProxyMiddleware({
      target: PROTOTYPE_BACKEND_URL,
      changeOrigin: true,
      pathRewrite: {
        "^/api/prototype": "", // Remove /api/prototype prefix when forwarding
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests in development
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${PROTOTYPE_BACKEND_URL}${req.url.replace("/api/prototype", "")}`);
        }
      },
      onError: (err, req, res) => {
        console.error("[Proxy Error]", err.message);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: "Failed to connect to prototype backend",
            message: err.message 
          });
        }
      },
    })
  );

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  return httpServer;
}
