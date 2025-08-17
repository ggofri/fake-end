import { Response } from 'express';
import { HTTP_STATUS } from '@/constants';

export async function applyDelay(delayMs?: number): Promise<void> {
  if (delayMs && delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export function sendResponse(res: Response, status: number, body: unknown): void {
  if (status === HTTP_STATUS.NO_CONTENT || body === undefined) {
    res.status(status).send();
  } else {
    res.status(status).json(body);
  }
}
