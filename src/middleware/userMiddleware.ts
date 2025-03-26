import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

interface JwtPayload {
  userId: string;
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if(!token){
    return res.status(400).json({message:"token is required"});
  }
  const decoded = jwt.verify(token, process.env.JWT_USER_SECRET as string) as JwtPayload;
  if(decoded){
    req.userId = decoded.userId;
    next();
  }else{
    return res.status(400).json({message:"invalid token"});
  }
};
