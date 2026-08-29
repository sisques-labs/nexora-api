import { appConfig } from './config/app.config';
import { HealthModule } from './health/health.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

// Cross-cutting infrastructure every bounded context relies on. Unlike
// nestjs-template, there's no TypeOrmModule/GraphQLModule/MessagingModule/
// ObservabilityModule/McpModule here — nexora-api persists nothing of its
// own in v0 (see the root README) and only exposes REST. Add them back
// once a context actually needs them.
const CORE_MODULES = [
  CqrsModule.forRoot(),
  ConfigModule.forRoot({
    isGlobal: true,
    load: [appConfig],
    cache: true,
  }),
  HealthModule,
];

@Module({
  imports: [...CORE_MODULES],
})
export class CoreModule {}
