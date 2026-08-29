package mock

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/entities"
)

// JobsGateway stands in for nexora-jobs: it keeps the job lifecycle
// in memory, inside nexora-api's own process.
type JobsGateway struct {
	mu   sync.Mutex
	jobs map[string]entities.Job
}

func NewJobsGateway() *JobsGateway {
	return &JobsGateway{jobs: make(map[string]entities.Job)}
}

func (g *JobsGateway) Create(ctx context.Context, model string) (entities.Job, error) {
	job := entities.Job{
		ID:        uuid.NewString(),
		Model:     model,
		Status:    entities.StatusPending,
		CreatedAt: time.Now().UTC(),
	}
	g.mu.Lock()
	g.jobs[job.ID] = job
	g.mu.Unlock()
	return job, nil
}

func (g *JobsGateway) MarkScheduled(ctx context.Context, jobID string, nodeID string) (entities.Job, error) {
	return g.transition(jobID, func(job *entities.Job) {
		job.Status = entities.StatusScheduled
		job.NodeID = nodeID
	})
}

func (g *JobsGateway) MarkRunning(ctx context.Context, jobID string) (entities.Job, error) {
	return g.transition(jobID, func(job *entities.Job) {
		job.Status = entities.StatusRunning
	})
}

func (g *JobsGateway) MarkCompleted(ctx context.Context, jobID string) (entities.Job, error) {
	return g.transition(jobID, func(job *entities.Job) {
		job.Status = entities.StatusCompleted
	})
}

func (g *JobsGateway) MarkFailed(ctx context.Context, jobID string, cause error) (entities.Job, error) {
	return g.transition(jobID, func(job *entities.Job) {
		job.Status = entities.StatusFailed
	})
}

func (g *JobsGateway) transition(jobID string, mutate func(job *entities.Job)) (entities.Job, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	job, ok := g.jobs[jobID]
	if !ok {
		return entities.Job{}, fmt.Errorf("job %q not found", jobID)
	}
	mutate(&job)
	g.jobs[jobID] = job
	return job, nil
}
