package com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.sisqueslabs.nexora.api.contexts.chat.domain.exceptions.ModelNotFoundException;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.FinishReasonValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.MessageValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RoleValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock.InMemoryJobsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock.InMemoryModelsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock.InMemoryNodesGateway;
import com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock.InMemorySchedulerGateway;

class CreateChatCompletionHandlerTest {

    private static final String MOCK_MODEL_NAME = "nexora-mock-llama-3.1-8b";

    private static CreateChatCompletionHandler newHandler() {
        InMemoryModelsGateway modelsGateway = new InMemoryModelsGateway();
        InMemoryJobsGateway jobsGateway = new InMemoryJobsGateway();
        InMemoryNodesGateway nodesGateway = new InMemoryNodesGateway();
        InMemorySchedulerGateway schedulerGateway = new InMemorySchedulerGateway(nodesGateway);

        return new CreateChatCompletionHandler(modelsGateway, jobsGateway, schedulerGateway, nodesGateway);
    }

    @Test
    void handleReturnsAnAssistantReplyForAKnownModel() {
        CreateChatCompletionHandler handler = newHandler();
        MessageValueObject message = new MessageValueObject(RoleValueObject.USER, "hello");
        RequestValueObject request = new RequestValueObject(MOCK_MODEL_NAME, List.of(message));

        CreateChatCompletionCommand.Result result = handler.handle(new CreateChatCompletionCommand(request));

        assertThat(result.jobId()).isNotBlank();
        assertThat(result.result().message().role()).isEqualTo(RoleValueObject.ASSISTANT);
        assertThat(result.result().finishReason()).isEqualTo(FinishReasonValueObject.STOP);
    }

    @Test
    void handleThrowsModelNotFoundForAnUnknownModel() {
        CreateChatCompletionHandler handler = newHandler();
        MessageValueObject message = new MessageValueObject(RoleValueObject.USER, "hello");
        RequestValueObject request = new RequestValueObject("unknown-model", List.of(message));

        assertThatThrownBy(() -> handler.handle(new CreateChatCompletionCommand(request)))
                .isInstanceOf(ModelNotFoundException.class);
    }

    @Test
    void commandConstructorBuildsValueObjectsFromAPrimitiveInput() {
        var input = new CreateChatCompletionCommand.Input(
                MOCK_MODEL_NAME,
                List.of(new CreateChatCompletionCommand.Input.MessageInput("user", "hello")));

        CreateChatCompletionCommand command = new CreateChatCompletionCommand(input);

        assertThat(command.request().model()).isEqualTo(MOCK_MODEL_NAME);
        assertThat(command.request().messages()).containsExactly(new MessageValueObject(RoleValueObject.USER, "hello"));
    }

    @Test
    void commandConstructorRejectsAnInvalidRoleInTheInput() {
        var input = new CreateChatCompletionCommand.Input(
                MOCK_MODEL_NAME,
                List.of(new CreateChatCompletionCommand.Input.MessageInput("not-a-role", "hello")));

        assertThatThrownBy(() -> new CreateChatCompletionCommand(input))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
