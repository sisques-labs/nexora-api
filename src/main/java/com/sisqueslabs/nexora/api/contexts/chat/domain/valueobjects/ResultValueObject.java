package com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects;

/**
 * The full inference response (no streaming in v0).
 */
public record ResultValueObject(MessageValueObject message, FinishReasonValueObject finishReason) {
}
