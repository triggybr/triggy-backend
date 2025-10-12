import { verifyToken } from '@clerk/backend';
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCodes } from 'src/common/codes';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private logger = new Logger(JwtAuthGuard.name)

  constructor(private readonly reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (process.env.SKIP_AUTH === 'true') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException({
        message: 'Missing authorization header',
        code: ErrorCodes.INVALID_TOKEN,
      });
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: ErrorCodes.INVALID_TOKEN,
      });
    }

    try {
      const jwtKey = process.env.CLERK_JWT_KEY
      const clerkSecretKey = process.env.CLERK_SECRET_KEY
      const tokenData = await verifyToken(token, {
        jwtKey: jwtKey,
        secretKey: clerkSecretKey
      });

      request.userId = tokenData.sub

      return true;
    } catch (err) {
      this.logger.error(err)
      throw new UnauthorizedException({ message: 'Invalid token', code: ErrorCodes.INVALID_TOKEN });
    }
  }
} 