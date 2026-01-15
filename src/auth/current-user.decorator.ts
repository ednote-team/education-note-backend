import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';

export interface CurrentUserPayload {
  id: string;
  email?: string;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload: any = jwtDecode(token);

      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  },
);
