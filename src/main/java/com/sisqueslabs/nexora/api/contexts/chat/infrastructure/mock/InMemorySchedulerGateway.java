package com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock;

import org.springframework.stereotype.Component;

import com.sisqueslabs.nexora.api.contexts.chat.application.port.SchedulerGateway;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Job;

/**
 * Stands in for nexora-scheduler. In v0, with a single node registered,
 * there's no real decision to make: it's a direct router.
 *
 * Depends on {@link InMemoryNodesGateway} (rather than a plain node ID
 * value) so Spring's dependency injection wires the same relationship
 * the Go v0 built by hand in chat.go's Register function.
 */
@Component
public class InMemorySchedulerGateway implements SchedulerGateway {

    private final InMemoryNodesGateway nodesGateway;

    public InMemorySchedulerGateway(InMemoryNodesGateway nodesGateway) {
        this.nodesGateway = nodesGateway;
    }

    @Override
    public String selectNode(Job job) {
        return nodesGateway.onlyNodeId();
    }
}
