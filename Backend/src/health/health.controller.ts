import { Controller, Get } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';

interface HealthStatus {
  status: 'ok';
}

interface ReadinessStatus {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('live')
  live(): HealthStatus {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  async ready(): Promise<ReadinessStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'degraded', database: 'down' };
    }
  }
}
