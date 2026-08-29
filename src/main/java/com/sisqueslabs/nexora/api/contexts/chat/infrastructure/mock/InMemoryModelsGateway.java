package com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock;

import org.springframework.stereotype.Component;

import com.sisqueslabs.nexora.api.contexts.chat.application.port.ModelsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Model;
import com.sisqueslabs.nexora.api.contexts.chat.domain.exceptions.ModelNotFoundException;

/**
 * Stands in for nexora-models: a hardcoded catalog of a single model,
 * until nexora-models exists.
 */
@Component
public class InMemoryModelsGateway implements ModelsGateway {

    private final Model model = new Model("nexora-mock-llama-3.1-8b");

    @Override
    public Model resolve(String name) {
        if (!model.name().equals(name)) {
            throw new ModelNotFoundException(name, model.name());
        }
        return model;
    }
}
