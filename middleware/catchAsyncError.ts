import { Response, Request, NextFunction, RequestHandler } from "express";

const catchAsync =
  (
    func: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };

export default catchAsync;
