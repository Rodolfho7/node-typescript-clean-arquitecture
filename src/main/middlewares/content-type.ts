import { Request, Response, NextFunction, json } from 'express';

export const contentType = (req: Request, res: Response, next: NextFunction) => {
  res.type('json');
  next();
}
