import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: z.treeifyError(result.error),
      });
    }

    req.body = result.data;
    next();
  };
