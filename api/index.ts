// Vercel Serverless Function entrypoint
// Exports the Express app - Vercel handles the HTTP server wrapping
export { app as default } from "../apps/api/src/server.js";
