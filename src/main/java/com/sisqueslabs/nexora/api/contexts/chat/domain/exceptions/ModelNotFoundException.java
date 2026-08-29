package com.sisqueslabs.nexora.api.contexts.chat.domain.exceptions;

import com.sisqueslabs.nexora.api.core.domain.apperr.NotFoundException;

/**
 * The requested model doesn't exist in the catalog.
 */
public class ModelNotFoundException extends NotFoundException {

    public ModelNotFoundException(String requestedModel, String availableModel) {
        super("model \"%s\" not found, only \"%s\" is available in v0".formatted(requestedModel, availableModel));
    }
}
