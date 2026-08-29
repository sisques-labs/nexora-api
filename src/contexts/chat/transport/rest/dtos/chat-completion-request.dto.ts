import { CreateChatCompletionCommandInput } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.command';
import { ApiProperty } from '@nestjs/swagger';

import { ChatCompletionMessageDto } from './chat-completion-message.dto';

/**
 * Mirrors the shape of the OpenAI API's POST /v1/chat/completions (only
 * the fields Nexora supports in v0: no streaming, no temperature/top_p/
 * etc yet).
 *
 * Purely a wire shape — no validation here. toCommandInput() is a
 * mechanical, primitive-to-primitive mapping; the actual validation
 * happens once, in CreateChatCompletionCommand's constructor.
 */
export class ChatCompletionRequestDto {
  @ApiProperty({ example: 'nexora-mock-llama-3.1-8b' })
  model!: string;

  @ApiProperty({ type: [ChatCompletionMessageDto] })
  messages!: ChatCompletionMessageDto[];

  toCommandInput(): CreateChatCompletionCommandInput {
    return {
      model: this.model,
      messages: (this.messages ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
  }
}
