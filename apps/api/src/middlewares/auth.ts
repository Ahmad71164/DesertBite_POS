import jwt from "jsonwebtoken";
import express from "express";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export type AuthRequest = express.Request & { 
  user?: { id: string; role: Role; name: string; email: string; branchId?: string | null } 
};

export const requireAuth = (roles?: Role[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    try {
      const payload = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET) as AuthRequest["user"];
      req.user = payload;
      if (roles?.length && payload && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
