package com.sisqueslabs.nexora.api.contexts.chat.application.port;

import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Job;

/**
 * Manages the job lifecycle in nexora-jobs.
 */
public interface JobsGateway {

    Job create(String model);

    Job markScheduled(String jobId, String nodeId);

    Job markRunning(String jobId);

    Job markCompleted(String jobId);

    Job markFailed(String jobId, Throwable cause);
}
