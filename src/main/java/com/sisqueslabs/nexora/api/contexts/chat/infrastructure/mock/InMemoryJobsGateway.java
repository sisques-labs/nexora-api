package com.sisqueslabs.nexora.api.contexts.chat.infrastructure.mock;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.UnaryOperator;

import org.springframework.stereotype.Component;

import com.sisqueslabs.nexora.api.contexts.chat.application.port.JobsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Job;

/**
 * Stands in for nexora-jobs: keeps the job lifecycle in memory, inside
 * nexora-api's own process.
 */
@Component
public class InMemoryJobsGateway implements JobsGateway {

    private final ConcurrentHashMap<String, Job> jobs = new ConcurrentHashMap<>();

    @Override
    public Job create(String model) {
        Job job = Job.createdFor(UUID.randomUUID().toString(), model, Instant.now());
        jobs.put(job.id(), job);
        return job;
    }

    @Override
    public Job markScheduled(String jobId, String nodeId) {
        return transition(jobId, job -> job.markScheduled(nodeId));
    }

    @Override
    public Job markRunning(String jobId) {
        return transition(jobId, Job::markRunning);
    }

    @Override
    public Job markCompleted(String jobId) {
        return transition(jobId, Job::markCompleted);
    }

    @Override
    public Job markFailed(String jobId, Throwable cause) {
        return transition(jobId, Job::markFailed);
    }

    private Job transition(String jobId, UnaryOperator<Job> mutate) {
        return jobs.compute(jobId, (id, existingJob) -> {
            if (existingJob == null) {
                throw new IllegalStateException("job \"%s\" not found".formatted(id));
            }
            return mutate.apply(existingJob);
        });
    }
}
