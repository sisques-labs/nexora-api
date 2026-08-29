package com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto;

import java.util.List;

import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.MessageValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RoleValueObject;

/**
 * Mirrors the shape of the OpenAI API's POST /v1/chat/completions (only
 * the fields Nexora supports in v0: no streaming, no temperature/top_p/
 * etc yet).
 */
public record ChatCompletionRequestDto(String model, List<ChatCompletionMessageDto> messages) {

    public RequestValueObject toDomain() {
        if (messages == null || messages.isEmpty()) {
            throw new IllegalArgumentException("messages must not be empty");
        }

        List<MessageValueObject> domainMessages = messages.stream()
                .map(message -> new MessageValueObject(RoleValueObject.fromWireValue(message.role()), message.content()))
                .toList();

        return new RequestValueObject(model, domainMessages);
    }
}
