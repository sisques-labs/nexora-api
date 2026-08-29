package com.sisqueslabs.nexora.api.core.domain.apperr;

/**
 * Base type for errors that should produce a specific HTTP status, as
 * opposed to an unexpected failure that defaults to 500. Subtypes are
 * caught by {@code core.transport.http.GlobalExceptionHandler}, which is
 * the single place that maps them to an HTTP status + error body.
 */
public abstract class ApplicationException extends RuntimeException {

    protected ApplicationException(String message) {
        super(message);
    }

    protected ApplicationException(String message, Throwable cause) {
        super(message, cause);
    }
}
