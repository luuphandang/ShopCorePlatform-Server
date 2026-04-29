import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

import { requestContextStorage } from '@/common/contexts/request.context';

const REQUEST_ID_HEADER = 'x-request-id';
const SAFE_REQUEST_ID = /^[a-zA-Z0-9_.-]{1,128}$/;

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
    const requestId =
      typeof candidate === 'string' && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, requestId);
    requestContextStorage.run({ requestId }, () => next());
  }
}
