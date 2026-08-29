package com.sisqueslabs.nexora.api.contexts.chat.application.port;

import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Model;

/**
 * Resolves whether a requested model exists in the catalog. Today it's
 * implemented by infrastructure.mock; tomorrow an HTTP client to
 * nexora-models, without the application layer changing.
 */
public interface ModelsGateway {

    Model resolve(String name);
}
