package com.sisqueslabs.nexora.api.contexts.chat.domain.entities;

/**
 * What the agent auto-detects on the remote machine. In v0 the real
 * registry lives in nexora-nodes; here it's just the shape nexora-api
 * needs to reason about which node it routes to.
 */
public record Hardware(String cpu, int ramGb, String gpu, int vramGb, String runtime) {
}
