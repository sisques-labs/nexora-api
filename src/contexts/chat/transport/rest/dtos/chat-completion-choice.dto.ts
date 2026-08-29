import { ApiProperty } from '@nestjs/swagger';

import { ChatCompletionMessageDto } from './chat-completion-message.dto';

export class ChatCompletionChoiceDto {
  @ApiProperty({ example: 0 })
  index!: number;

  @ApiProperty({ type: ChatCompletionMessageDto })
  message!: ChatCompletionMessageDto;

  @ApiProperty({ example: 'stop' })
  finish_reason!: string;
}
