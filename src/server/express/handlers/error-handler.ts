import { Request, Response } from 'express';
import { log404 } from '@/server/express/utils/logger';
import { HTTP_STATUS } from '@/constants';

export function handle404(req: Request, res: Response): void {
  log404(req.path);

  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: "Mock endpoint not found",
    path: req.path,
    method: req.method,
    message: "No mock endpoint matches this request. Check your YAML files.",
  });
}
