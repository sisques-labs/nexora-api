package com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion;

import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.ResultValueObject;

/**
 * What the handler returns to transport.
 */
public record CreateChatCompletionResult(String jobId, ResultValueObject result) {
}
