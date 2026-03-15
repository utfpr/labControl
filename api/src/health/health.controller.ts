import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verifica o status da API' })
  @ApiResponse({
    status: 200,
    description: 'A API está online e respondendo.',
    schema: {
      example: {
        status: 'ok',
        message: 'API Legacy Evolution is up and running!',
        timestamp: '2026-03-14T22:00:00.000Z',
      },
    },
  })
  check() {
    return this.healthService.checkHealth();
  }
}