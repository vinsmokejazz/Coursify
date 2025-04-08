import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
  adminId: string;
}

interface CustomRequest extends Request {
  adminId: string;
}

export const adminMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(400).json({ message: "token required" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY as string) as JwtPayload;
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(400).json({ message: "invalid token" });
  }
}