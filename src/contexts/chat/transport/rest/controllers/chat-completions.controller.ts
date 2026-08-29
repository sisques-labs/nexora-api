import { CreateChatCompletionCommand } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.command';
import { CreateChatCompletionResult } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.handler';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { ChatCompletionRequestDto } from '../dtos/chat-completion-request.dto';
import { ChatCompletionResponseDto } from '../dtos/chat-completion-response.dto';

@ApiTags('chat')
@Controller('v1/chat')
export class ChatCompletionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('completions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run inference against the (mocked, in v0) platform',
  })
  @ApiResponse({ status: 200, type: ChatCompletionResponseDto })
  async createChatCompletion(
    @Body() requestDto: ChatCompletionRequestDto,
  ): Promise<ChatCompletionResponseDto> {
    const command = new CreateChatCompletionCommand(
      requestDto.toCommandInput(),
    );

    const result = await this.commandBus.execute<
      CreateChatCompletionCommand,
      CreateChatCompletionResult
    >(command);

    return ChatCompletionResponseDto.from(result, command.request.model.value);
  }
}
