import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

export class HealthStatus {
  @ApiProperty({ example: 'ok', enum: ['ok'] })
  status: 'ok';

  @ApiProperty({ example: 42, description: 'Seconds since the process started' })
  uptime: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe: answers 200 while the process can serve requests' })
  @ApiOkResponse({ type: HealthStatus })
  getHealth(): HealthStatus {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }
}
