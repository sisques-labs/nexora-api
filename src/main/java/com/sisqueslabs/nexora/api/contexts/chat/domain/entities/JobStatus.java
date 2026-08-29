package com.sisqueslabs.nexora.api.contexts.chat.domain.entities;

/**
 * Models the lifecycle of an inference job:
 * PENDING → SCHEDULED → RUNNING → COMPLETED (or FAILED at any point).
 */
public enum JobStatus {
    PENDING,
    SCHEDULED,
    RUNNING,
    COMPLETED,
    FAILED
}
