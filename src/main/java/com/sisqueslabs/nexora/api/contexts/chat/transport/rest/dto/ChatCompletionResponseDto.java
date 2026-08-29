package com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto;

import java.time.Instant;
import java.util.List;

import com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion.CreateChatCompletionResult;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.MessageValueObject;

/**
 * Mirrors OpenAI's response shape.
 */
public record ChatCompletionResponseDto(
        String id,
        String object,
        long created,
        String model,
        List<ChatCompletionChoiceDto> choices) {

    public static ChatCompletionResponseDto from(CreateChatCompletionResult result, String requestedModel) {
        MessageValueObject message = result.result().message();
        ChatCompletionChoiceDto choice = new ChatCompletionChoiceDto(
                0,
                new ChatCompletionMessageDto(message.role().wireValue(), message.content()),
                result.result().finishReason().wireValue());

        return new ChatCompletionResponseDto(
                "chatcmpl-" + result.jobId(),
                "chat.completion",
                Instant.now().getEpochSecond(),
                requestedModel,
                List.of(choice));
    }
}
