import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocorreu um erro inesperado';
    let code = 'INTERNAL_ERROR';

    console.log(exception)

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      const externalMessage = exceptionResponse.externalMessage;
      message = externalMessage || message;
      code = exceptionResponse.code || code;
    }

    response.status(status).json({
      success: false,
      message,
      status,
      code,
    });
  }
} 