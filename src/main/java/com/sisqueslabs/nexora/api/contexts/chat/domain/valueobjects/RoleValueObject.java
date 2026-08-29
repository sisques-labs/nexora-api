package com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Who is speaking within a conversation turn. Serialized as the lowercase
 * OpenAI-style string ("system"/"user"/"assistant"), not the Java enum name.
 */
public enum RoleValueObject {
    SYSTEM("system"),
    USER("user"),
    ASSISTANT("assistant");

    private final String wireValue;

    RoleValueObject(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static RoleValueObject fromWireValue(String wireValue) {
        for (RoleValueObject role : values()) {
            if (role.wireValue.equals(wireValue)) {
                return role;
            }
        }
        throw new IllegalArgumentException("chat: invalid role \"%s\"".formatted(wireValue));
    }
}
