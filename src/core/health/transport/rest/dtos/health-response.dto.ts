import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2026-08-29T16:00:00.000Z' })
  timestamp!: string;
}
