package com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion;

import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;

/**
 * The (only, in v0) write command of the chat context: it enters as
 * POST /v1/chat/completions.
 */
public record CreateChatCompletionCommand(RequestValueObject request) {
}
