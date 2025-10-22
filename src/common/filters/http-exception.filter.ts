import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    const err = exception as any;

    if (err?.response?.data) {
      console.log(err?.response?.data)
      const aMessage = `${err.response.data.message} - ${err.response.data.code} - ${err.response.data.status}`
      console.log(aMessage)
    } else {
      console.log(exception)
    }


    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp: any = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (resp && typeof resp === 'object') {
        message = resp.message || message;
        code = resp.code || code;
      }
    }

    response.status(status).json({
      success: false,
      message,
      status,
      code,
    });
  }
} 