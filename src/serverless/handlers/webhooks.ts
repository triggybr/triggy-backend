import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorResponse, createResponse } from '../types/lambda';

const sqs = new SQSClient({});
const queueUrl = process.env.QUEUE_URL;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return createErrorResponse(400, 'Path parameter "id" is required');
    }

    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const messageBody = {
      urlCode: id,
      payload,
    };

    if (!queueUrl) {
      return createErrorResponse(500, 'QUEUE_URL is not configured in environment');
    }

    const cmd = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      MessageAttributes: {
        urlCode: {
          DataType: 'String',
          StringValue: id,
        },
      },
    });

    const result = await sqs.send(cmd);

    return createResponse(202, {
      message: 'Webhook enqueued',
      urlCode: id,
      messageId: result.MessageId,
    });
  } catch (error) {
    console.error('webhooks handler error:', error);
    return createErrorResponse(500, 'Failed to enqueue webhook', error);
  }
};
