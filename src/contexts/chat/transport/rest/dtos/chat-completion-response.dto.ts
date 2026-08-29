import { CreateChatCompletionResult } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.handler';
import { ApiProperty } from '@nestjs/swagger';

import { ChatCompletionChoiceDto } from './chat-completion-choice.dto';

/**
 * Mirrors OpenAI's response shape.
 */
export class ChatCompletionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'chat.completion' })
  object!: string;

  @ApiProperty()
  created!: number;

  @ApiProperty()
  model!: string;

  @ApiProperty({ type: [ChatCompletionChoiceDto] })
  choices!: ChatCompletionChoiceDto[];

  static from(
    result: CreateChatCompletionResult,
    requestedModel: string,
  ): ChatCompletionResponseDto {
    const dto = new ChatCompletionResponseDto();
    dto.id = `chatcmpl-${result.jobId}`;
    dto.object = 'chat.completion';
    dto.created = Math.floor(Date.now() / 1000);
    dto.model = requestedModel;
    dto.choices = [
      {
        index: 0,
        message: {
          role: result.result.message.role.value,
          content: result.result.message.content.value,
        },
        finish_reason: result.result.finishReason.value,
      },
    ];
    return dto;
  }
}
