package com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion;

import java.util.List;

import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.MessageValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.ResultValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RoleValueObject;

/**
 * The (only, in v0) write command of the chat context: it enters as
 * POST /v1/chat/completions.
 *
 * {@link Input} is the primitive-shaped payload transport builds from
 * the request body; this record's own constructor is where those
 * primitives get validated into value objects. A handler only ever sees
 * a {@code CreateChatCompletionCommand} that's already valid.
 */
public record CreateChatCompletionCommand(RequestValueObject request) {

    public CreateChatCompletionCommand(Input input) {
        this(toRequestValueObject(input));
    }

    private static RequestValueObject toRequestValueObject(Input input) {
        List<MessageValueObject> messages = input.messages().stream()
                .map(message -> new MessageValueObject(RoleValueObject.fromWireValue(message.role()), message.content()))
                .toList();
        return new RequestValueObject(input.model(), messages);
    }

    /**
     * The primitive-shaped command input, built by transport from the
     * request DTO. Never holds a value object — that construction (and
     * its validation) happens once, in the command's own constructor.
     */
    public record Input(String model, List<MessageInput> messages) {

        public record MessageInput(String role, String content) {
        }
    }

    /**
     * What the handler returns to transport.
     */
    public record Result(String jobId, ResultValueObject result) {
    }
}
