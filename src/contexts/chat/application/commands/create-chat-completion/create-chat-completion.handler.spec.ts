import { IJobsPort, JobRef } from '@contexts/chat/application/ports/jobs.port';
import { IModelsPort } from '@contexts/chat/application/ports/models.port';
import { INodesPort } from '@contexts/chat/application/ports/nodes.port';
import { ISchedulerPort } from '@contexts/chat/application/ports/scheduler.port';
import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { FinishReasonEnum } from '@contexts/chat/domain/enums/finish-reason.enum';
import { MessageValueObject } from '@contexts/chat/domain/value-objects/message/message.value-object';
import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';

import { CreateChatCompletionCommand } from './create-chat-completion.command';
import { CreateChatCompletionCommandHandler } from './create-chat-completion.handler';

const MOCK_MODEL_NAME = 'nexora-mock-llama-3.1-8b';

/**
 * Fakes chat's own ports (not the other contexts' internals) — this is
 * a unit test of the orchestration in CreateChatCompletionCommandHandler,
 * not an integration test of jobs/nodes/models/scheduler. Those contexts
 * have their own handler tests, including the real ModelNotFoundException
 * — chat's own code (tests included) never imports another context's
 * domain, so this fake throws a generic error, not that exact type.
 */
class FakeModelsPort implements IModelsPort {
  async resolve(name: string): Promise<void> {
    if (name !== MOCK_MODEL_NAME) {
      throw new Error(`model "${name}" not found`);
    }
  }
}

class FakeJobsPort implements IJobsPort {
  private sequence = 0;

  async create(): Promise<JobRef> {
    return { id: `job-${++this.sequence}` };
  }

  async markScheduled(): Promise<void> {}

  async markRunning(): Promise<void> {}

  async markCompleted(): Promise<void> {}

  async markFailed(): Promise<void> {}
}

class FakeSchedulerPort implements ISchedulerPort {
  async selectNode(): Promise<string> {
    return 'mock-node-1';
  }
}

class FakeNodesPort implements INodesPort {
  async dispatch(
    nodeId: string,
    request: RequestValueObject,
  ): Promise<ResultValueObject> {
    const lastUserMessage =
      [...request.messages]
        .reverse()
        .find((message) => message.role.is(RoleEnum.USER))?.content.value ?? '';
    const reply = new MessageValueObject(
      RoleEnum.ASSISTANT,
      `[mock inference on ${nodeId}] echo: ${lastUserMessage}`,
    );
    return new ResultValueObject(reply, FinishReasonEnum.STOP);
  }
}

function newHandler(): CreateChatCompletionCommandHandler {
  return new CreateChatCompletionCommandHandler(
    new FakeModelsPort(),
    new FakeJobsPort(),
    new FakeSchedulerPort(),
    new FakeNodesPort(),
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

  it('propagates the models port failure for an unknown model, unchanged', async () => {
    const handler = newHandler();
    const command = new CreateChatCompletionCommand({
      model: 'unknown-model',
      messages: [{ role: RoleEnum.USER, content: 'hello' }],
    });

    await expect(handler.execute(command)).rejects.toThrow(
      'model "unknown-model" not found',
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
