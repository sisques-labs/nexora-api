package com.sisqueslabs.nexora.api.contexts.chat.domain.entities;

/**
 * An entry in the catalog of servable models. In v0 the catalog is a
 * single hardcoded model (nexora-models doesn't exist yet).
 */
public record Model(String name) {
}
