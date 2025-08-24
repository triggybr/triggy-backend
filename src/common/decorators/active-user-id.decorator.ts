import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ErrorCodes } from '../codes';

export const ActiveUserExternalId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const externalId = request.userId || 'user_29w83sxmDNGwOuEthce5gg56Fccaa';

    if (!externalId) {
      throw new BadRequestException({
        message: 'externalId missing in request',
        code: ErrorCodes.INVALID_TOKEN,
      });
    }

    return externalId;
  },
);
