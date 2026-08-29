package com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChatCompletionChoiceDto(
        int index,
        ChatCompletionMessageDto message,
        @JsonProperty("finish_reason") String finishReason) {
}
