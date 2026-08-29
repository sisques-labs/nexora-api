package com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects;

import java.util.List;

/**
 * An already-validated inference request, independent of the HTTP transport.
 */
public record RequestValueObject(String model, List<MessageValueObject> messages) {

    public RequestValueObject {
        if (model == null || model.isBlank()) {
            throw new IllegalArgumentException("chat: model must not be empty");
        }
        if (messages == null || messages.isEmpty()) {
            throw new IllegalArgumentException("chat: messages must not be empty");
        }
        messages = List.copyOf(messages);
    }
}
