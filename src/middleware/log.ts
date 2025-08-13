import { Request, Response, NextFunction } from "express";
const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers;
  const userAgent = header["user-agent"];
  console.log("user-agent", userAgent);
};
export { logMiddleware };
