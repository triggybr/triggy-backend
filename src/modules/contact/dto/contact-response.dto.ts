import { ApiProperty } from '@nestjs/swagger';

export enum MessageStatusEnum {
  SENT = 'sent',
  QUEUED = 'queued',
  REJECTED = 'rejected',
  INVALID = 'invalid',
}

export class ContactResponseDto {
  @ApiProperty({
    description: 'ID da mensagem no Mailchimp',
    example: 'msg_abc123xyz456',
    nullable: true,
  })
  messageId: string | null;

  @ApiProperty({
    description: 'Status do envio',
    example: 'sent',
    enum: MessageStatusEnum,
  })
  status: MessageStatusEnum;
}

