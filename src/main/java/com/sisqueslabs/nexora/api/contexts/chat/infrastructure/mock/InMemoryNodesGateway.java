package com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock;

import org.springframework.stereotype.Component;

import com.sisqueslabs.nexora.api.contexts.chat.application.port.NodesGateway;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Hardware;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Node;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.FinishReasonValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.MessageValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.ResultValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RoleValueObject;

/**
 * Stands in for nexora-nodes (and, transitively, the real nexora-agent):
 * instead of forwarding the request to a real agent, it generates a
 * canned response. It's the README's "fake agent".
 */
@Component
public class InMemoryNodesGateway implements NodesGateway {

    private final Node node = new Node(
            "mock-node-1",
            new Hardware("Apple M2", 16, "Apple M2 GPU (integrated)", 0, "llama.cpp (mock)"));

    /**
     * Exposes the single node available in v0, so the scheduler mock
     * knows who to route to without querying a real registry.
     */
    public String onlyNodeId() {
        return node.id();
    }

    @Override
    public ResultValueObject dispatch(String nodeId, RequestValueObject request) {
        if (!node.id().equals(nodeId)) {
            throw new IllegalArgumentException("node \"%s\" not found".formatted(nodeId));
        }

        String lastUserMessage = request.messages().stream()
                .filter(message -> message.role() == RoleValueObject.USER)
                .map(MessageValueObject::content)
                .reduce((first, second) -> second)
                .orElse("");

        MessageValueObject reply = new MessageValueObject(
                RoleValueObject.ASSISTANT,
                "[mock inference on %s] echo: %s".formatted(node.id(), lastUserMessage));

        return new ResultValueObject(reply, FinishReasonValueObject.STOP);
    }
}
