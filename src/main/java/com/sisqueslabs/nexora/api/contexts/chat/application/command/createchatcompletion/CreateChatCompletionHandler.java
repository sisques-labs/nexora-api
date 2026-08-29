package com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion;

import org.axonframework.commandhandling.CommandHandler;
import org.springframework.stereotype.Component;

import com.sisqueslabs.nexora.api.contexts.chat.application.port.JobsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.application.port.ModelsGateway;
import com.sisqueslabs.nexora.api.contexts.chat.application.port.NodesGateway;
import com.sisqueslabs.nexora.api.contexts.chat.application.port.SchedulerGateway;
import com.sisqueslabs.nexora.api.contexts.chat.domain.entities.Job;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.ResultValueObject;

/**
 * Orchestrates the v0 end-to-end flow described in the README: validates
 * the model, creates the job, asks the scheduler for a node, dispatches
 * the inference against that node and closes the job. None of these
 * pieces has business logic of its own here: it only coordinates the
 * gateways.
 */
@Component
public class CreateChatCompletionHandler {

    private final ModelsGateway modelsGateway;
    private final JobsGateway jobsGateway;
    private final SchedulerGateway schedulerGateway;
    private final NodesGateway nodesGateway;

    public CreateChatCompletionHandler(
            ModelsGateway modelsGateway,
            JobsGateway jobsGateway,
            SchedulerGateway schedulerGateway,
            NodesGateway nodesGateway) {
        this.modelsGateway = modelsGateway;
        this.jobsGateway = jobsGateway;
        this.schedulerGateway = schedulerGateway;
        this.nodesGateway = nodesGateway;
    }

    @CommandHandler
    public CreateChatCompletionResult handle(CreateChatCompletionCommand command) {
        modelsGateway.resolve(command.request().model());

        Job job = jobsGateway.create(command.request().model());

        String nodeId;
        try {
            nodeId = schedulerGateway.selectNode(job);
        } catch (RuntimeException selectNodeFailure) {
            jobsGateway.markFailed(job.id(), selectNodeFailure);
            throw selectNodeFailure;
        }
        jobsGateway.markScheduled(job.id(), nodeId);
        jobsGateway.markRunning(job.id());

        ResultValueObject inferenceResult;
        try {
            inferenceResult = nodesGateway.dispatch(nodeId, command.request());
        } catch (RuntimeException dispatchFailure) {
            jobsGateway.markFailed(job.id(), dispatchFailure);
            throw dispatchFailure;
        }

        jobsGateway.markCompleted(job.id());

        return new CreateChatCompletionResult(job.id(), inferenceResult);
    }
}
