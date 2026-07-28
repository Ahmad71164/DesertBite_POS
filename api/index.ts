import { app } from "../apps/api/src/server.js";

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: err?.message || String(err),
      });
    }
  }
}
