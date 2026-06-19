import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../types/authenticated-user';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/** Injects the authenticated user bound to the request by JwtAuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error('CurrentUser used on a route without JwtAuthGuard.');
    }
    return request.user;
  },
);
