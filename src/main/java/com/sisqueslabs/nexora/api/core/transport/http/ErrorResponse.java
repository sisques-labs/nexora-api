package com.sisqueslabs.nexora.api.core.transport.http;

/**
 * Follows the OpenAI API's error shape, so existing clients that already
 * know how to read OpenAI errors don't need a separate code path for
 * Nexora. Shared by every context.
 */
public record ErrorResponse(ErrorBody error) {

    public record ErrorBody(String message, String type) {
    }

    public static ErrorResponse of(String message, String type) {
        return new ErrorResponse(new ErrorBody(message, type));
    }
}
