package com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto;

import java.util.List;

import com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion.CreateChatCompletionCommand;

/**
 * Mirrors the shape of the OpenAI API's POST /v1/chat/completions (only
 * the fields Nexora supports in v0: no streaming, no temperature/top_p/
 * etc yet).
 *
 * Purely a wire shape — no validation here. {@link #toCommandInput()} is
 * a mechanical, primitive-to-primitive mapping; the actual validation
 * happens once, in {@code CreateChatCompletionCommand}'s constructor.
 */
public record ChatCompletionRequestDto(String model, List<ChatCompletionMessageDto> messages) {

    public CreateChatCompletionCommand.Input toCommandInput() {
        List<CreateChatCompletionCommand.Input.MessageInput> messageInputs = messages == null
                ? List.of()
                : messages.stream()
                        .map(message -> new CreateChatCompletionCommand.Input.MessageInput(message.role(), message.content()))
                        .toList();

        return new CreateChatCompletionCommand.Input(model, messageInputs);
    }
}
