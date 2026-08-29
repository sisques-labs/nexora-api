package com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects;

/**
 * A conversation turn sent in the request.
 */
public record MessageValueObject(RoleValueObject role, String content) {

    public MessageValueObject {
        if (role == null) {
            throw new IllegalArgumentException("chat: role must not be null");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("chat: content must not be empty");
        }
    }
}
