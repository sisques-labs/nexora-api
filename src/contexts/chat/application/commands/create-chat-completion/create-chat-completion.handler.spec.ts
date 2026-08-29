import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { ModelNotFoundException } from '@contexts/chat/domain/exceptions/model-not-found.exception';
import { InMemoryJobsGateway } from '@contexts/chat/infrastructure/mock/in-memory-jobs.gateway';
import { InMemoryModelsGateway } from '@contexts/chat/infrastructure/mock/in-memory-models.gateway';
import { InMemoryNodesGateway } from '@contexts/chat/infrastructure/mock/in-memory-nodes.gateway';
import { InMemorySchedulerGateway } from '@contexts/chat/infrastructure/mock/in-memory-scheduler.gateway';

import { CreateChatCompletionCommand } from './create-chat-completion.command';
import { CreateChatCompletionCommandHandler } from './create-chat-completion.handler';

const MOCK_MODEL_NAME = 'nexora-mock-llama-3.1-8b';

function newHandler(): CreateChatCompletionCommandHandler {
  const nodesGateway = new InMemoryNodesGateway();
  return new CreateChatCompletionCommandHandler(
    new InMemoryModelsGateway(),
    new InMemoryJobsGateway(),
    new InMemorySchedulerGateway(nodesGateway),
    nodesGateway,
  );
}

describe('CreateChatCompletionCommandHandler', () => {
  it('returns an assistant reply for a known model', async () => {
    const handler = newHandler();
    const command = new CreateChatCompletionCommand({
      model: MOCK_MODEL_NAME,
      messages: [{ role: RoleEnum.USER, content: 'hello' }],
    });

    const result = await handler.execute(command);

    expect(result.jobId).toBeTruthy();
    expect(result.result.message.role.is(RoleEnum.ASSISTANT)).toBe(true);
    expect(result.result.finishReason.value).toBe('stop');
  });

  it('throws ModelNotFoundException for an unknown model', async () => {
    const handler = newHandler();
    const command = new CreateChatCompletionCommand({
      model: 'unknown-model',
      messages: [{ role: RoleEnum.USER, content: 'hello' }],
    });

    await expect(handler.execute(command)).rejects.toBeInstanceOf(
      ModelNotFoundException,
    );
  });

  it('rejects an invalid role in the input', () => {
    expect(
      () =>
        new CreateChatCompletionCommand({
          model: MOCK_MODEL_NAME,
          messages: [{ role: 'not-a-role', content: 'hello' }],
        }),
    ).toThrow();
  });

  it('rejects empty messages', () => {
    expect(
      () =>
        new CreateChatCompletionCommand({
          model: MOCK_MODEL_NAME,
          messages: [],
        }),
    ).toThrow();
  });
});
