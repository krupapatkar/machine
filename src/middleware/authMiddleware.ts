// //src\middleware\authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: { email: string };
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    req.user = { email: decoded.email };
    next();
  } catch (error) {
    return res.status(403).json({ status: false, message: "Invalid token" });
  }
};


// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";

// export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ status: false, message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     req.user = decoded; 
//     next();
//   } catch (error) {
//     return res.status(401).json({ status: false, message: "Invalid or expired token" });
//   }
// };
