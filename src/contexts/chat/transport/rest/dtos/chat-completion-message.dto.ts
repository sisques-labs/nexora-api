import { ApiProperty } from '@nestjs/swagger';

export class ChatCompletionMessageDto {
  @ApiProperty({ example: 'user' })
  role!: string;

  @ApiProperty({ example: 'hello' })
  content!: string;
}
