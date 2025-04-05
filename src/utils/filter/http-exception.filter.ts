import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorResponse;

    if (exception instanceof NotFoundException) {
      errorResponse = {
        code: 'NotFound',
        message: exception.message,
        data: {},
      };
    } else if (exception instanceof BadRequestException) {
      errorResponse = {
        code: 'BadRequest',
        message: exception.message,
        data: {},
      };
    } else if (exception instanceof UnauthorizedException) {
      errorResponse = {
        code: 'UnAuthorized',
        message: exception.message,
        data: {},
      };
    } else if (exception instanceof ForbiddenException) {
      errorResponse = {
        code: 'Forbidden',
        message: exception.message,
        data: {},
      };
    } else {
      errorResponse = {
        code: 'ServerError',
        message: exception.message,
        data: {},
      };
    }
    response.status(200).json(errorResponse);
  }
}
