package createchatcompletion

import (
	"context"
	"fmt"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/application/port"
)

// Handler orchestrates the v0 end-to-end flow described in the README:
// validates the model, creates the job, asks the scheduler for a node,
// dispatches the inference against that node and closes the job. None
// of these pieces has business logic of its own here: it only
// coordinates the gateways.
type Handler struct {
	models    port.ModelsGateway
	jobs      port.JobsGateway
	scheduler port.SchedulerGateway
	nodes     port.NodesGateway
}

func NewHandler(
	models port.ModelsGateway,
	jobs port.JobsGateway,
	scheduler port.SchedulerGateway,
	nodes port.NodesGateway,
) *Handler {
	return &Handler{
		models:    models,
		jobs:      jobs,
		scheduler: scheduler,
		nodes:     nodes,
	}
}

func (h *Handler) Handle(ctx context.Context, cmd Command) (Result, error) {
	if _, err := h.models.Resolve(ctx, cmd.Request.Model); err != nil {
		return Result{}, fmt.Errorf("resolve model: %w", err)
	}

	j, err := h.jobs.Create(ctx, cmd.Request.Model)
	if err != nil {
		return Result{}, fmt.Errorf("create job: %w", err)
	}

	nodeID, err := h.scheduler.SelectNode(ctx, j)
	if err != nil {
		_, _ = h.jobs.MarkFailed(ctx, j.ID, err)
		return Result{}, fmt.Errorf("select node: %w", err)
	}
	if _, err := h.jobs.MarkScheduled(ctx, j.ID, nodeID); err != nil {
		return Result{}, fmt.Errorf("mark job scheduled: %w", err)
	}

	if _, err := h.jobs.MarkRunning(ctx, j.ID); err != nil {
		return Result{}, fmt.Errorf("mark job running: %w", err)
	}
	result, err := h.nodes.Dispatch(ctx, nodeID, cmd.Request)
	if err != nil {
		_, _ = h.jobs.MarkFailed(ctx, j.ID, err)
		return Result{}, fmt.Errorf("dispatch to node: %w", err)
	}

	if _, err := h.jobs.MarkCompleted(ctx, j.ID); err != nil {
		return Result{}, fmt.Errorf("mark job completed: %w", err)
	}

	return Result{JobID: j.ID, Result: result}, nil
}
