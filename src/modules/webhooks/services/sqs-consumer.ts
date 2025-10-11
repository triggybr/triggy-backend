import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient
} from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class SqsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumer.name);
  private client: SQSClient;
  private queueUrl: string;
  private running = false;

  private readonly waitTimeSeconds = 20;
  private readonly visibilityTimeout = 60;
  private readonly maxNumberOfMessages = 5;
  private readonly pollIntervalOnEmptyMs = 1000;

  constructor(
    private readonly config: ConfigService,
    private readonly webhooksService: WebhooksService,
  ) { }

  onModuleInit() {
    const queueUrl = this.config.get<string>('QUEUE_URL');
    if (!queueUrl) {
      this.logger.warn('QUEUE_URL not set; SQS consumer will not start.');
      return;
    }
    this.queueUrl = queueUrl;

    const region = this.config.get<string>('AWS_REGION')
    this.client = new SQSClient({
      region,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') as string,
      }
    });

    this.running = true;
    this.logger.log(`Starting SQS consumer for ${this.queueUrl}`);
    this.loop();
  }

  onModuleDestroy() {
    this.running = false;
    this.logger.log('Stopping SQS consumer...');
  }

  private async loop() {
    while (this.running) {
      try {
        const messages = await this.receiveBatch();

        if (!messages || messages.length === 0) {
          await this.sleep(this.pollIntervalOnEmptyMs);
          continue;
        }

        for (const message of messages) {
          await this.handleMessageSafe(message);
        }
      } catch (err) {
        this.logger.error('Error in SQS consumer loop', err as Error);
        await this.sleep(1000);
      }
    }
  }

  private async receiveBatch(): Promise<Message[] | undefined> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: this.maxNumberOfMessages,
      WaitTimeSeconds: this.waitTimeSeconds,
      VisibilityTimeout: this.visibilityTimeout,
      MessageAttributeNames: ['All'],
    });

    const response = await this.client.send(command);
    return response.Messages;
  }

  private async handleMessageSafe(message: Message) {
    try {
      await this.handleMessage(message);
    } catch (err) {
      this.logger.error(`Failed to process message ${message.MessageId}`, err);
    } finally {
      await this.deleteMessage(message);
    }
  }

  private async handleMessage(message: Message) {
    const body = message.Body ? JSON.parse(message.Body) : null;

    const urlCode = body?.urlCode;
    const payload = body?.payload;

    await this.webhooksService.processWebhook({ urlCode, payload });
  }

  private async deleteMessage(message: Message) {
    if (!message.ReceiptHandle) return;
    await this.client.send(
      new DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle: message.ReceiptHandle }),
    );
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
