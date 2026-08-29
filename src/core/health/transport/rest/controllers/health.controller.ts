import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from '../dtos/health-response.dto';

// version: VERSION_NEUTRAL — a healthcheck is infra tooling probing the
// process, not a versioned API consumer; it shouldn't move if /v1
// becomes /v2 one day.
@ApiTags('health')
@Controller({ path: 'healthz', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liveness probe — process is up, no dependency checks',
  })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  check(): HealthResponseDto {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
