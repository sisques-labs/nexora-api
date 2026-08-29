package com.sisqueslabs.nexora.api.contexts.chat.application.port;

import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Job;

/**
 * Decides which node a job goes to. In v0, with a single node
 * registered, it's effectively a direct router, not a real decision.
 */
public interface SchedulerGateway {

    String selectNode(Job job);
}
