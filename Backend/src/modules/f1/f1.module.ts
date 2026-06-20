import { Module } from '@nestjs/common';

import { DataServiceClient } from './data-service.client';
import { F1Controller } from './f1.controller';
import { F1Repository } from './f1.repository';
import { F1Service } from './f1.service';

@Module({
  controllers: [F1Controller],
  providers: [F1Service, DataServiceClient, F1Repository],
})
export class F1Module {}
