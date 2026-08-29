import { ChatModule } from '@contexts/chat/chat.module';
import { Module } from '@nestjs/common';

// Register every bounded context module here as it's added.
const CONTEXT_MODULES = [ChatModule];

@Module({
  imports: [...CONTEXT_MODULES],
})
export class ContextsModule {}
