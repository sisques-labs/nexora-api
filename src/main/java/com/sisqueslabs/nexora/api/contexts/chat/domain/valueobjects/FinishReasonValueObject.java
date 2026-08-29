package com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Why the model stopped generating text.
 */
public enum FinishReasonValueObject {
    STOP("stop");

    private final String wireValue;

    FinishReasonValueObject(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }
}
