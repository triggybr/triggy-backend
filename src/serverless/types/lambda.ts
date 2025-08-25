import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export interface LambdaHandler {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
}

export interface ApiResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const createResponse = (
  statusCode: number,
  data: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
      ...headers,
    },
    body: JSON.stringify(data),
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  error?: any
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    error: true,
    message,
    ...(error && { details: error }),
  });
};
