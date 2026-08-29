package com.sisqueslabs.nexora.api.core.domain.apperr;

/**
 * Something the caller asked for doesn't exist. Maps to HTTP 404.
 */
public class NotFoundException extends ApplicationException {

    public NotFoundException(String message) {
        super(message);
    }
}
