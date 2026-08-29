package com.sisqueslabs.nexora.api.contexts.chat.domain.entities;

import java.time.Instant;

/**
 * An inference request in progress, as seen by nexora-api. The source of
 * truth for this aggregate lives in nexora-jobs; here it's just the
 * domain entity the use case orchestrates with.
 *
 * Immutable by design: a transition (markScheduled, markRunning, ...)
 * returns a new Job rather than mutating this one, same as the Go v0 did.
 */
public record Job(String id, String model, JobStatus status, String nodeId, Instant createdAt) {

    public static Job createdFor(String id, String model, Instant createdAt) {
        return new Job(id, model, JobStatus.PENDING, null, createdAt);
    }

    public Job markScheduled(String scheduledNodeId) {
        return new Job(id, model, JobStatus.SCHEDULED, scheduledNodeId, createdAt);
    }

    public Job markRunning() {
        return new Job(id, model, JobStatus.RUNNING, nodeId, createdAt);
    }

    public Job markCompleted() {
        return new Job(id, model, JobStatus.COMPLETED, nodeId, createdAt);
    }

    public Job markFailed() {
        return new Job(id, model, JobStatus.FAILED, nodeId, createdAt);
    }
}
