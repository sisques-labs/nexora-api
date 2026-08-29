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
	j := entities.Job{
		ID:        uuid.NewString(),
		Model:     model,
		Status:    entities.StatusPending,
		CreatedAt: time.Now().UTC(),
	}
	g.mu.Lock()
	g.jobs[j.ID] = j
	g.mu.Unlock()
	return j, nil
}

func (g *JobsGateway) MarkScheduled(ctx context.Context, jobID string, nodeID string) (entities.Job, error) {
	return g.transition(jobID, func(j *entities.Job) {
		j.Status = entities.StatusScheduled
		j.NodeID = nodeID
	})
}

func (g *JobsGateway) MarkRunning(ctx context.Context, jobID string) (entities.Job, error) {
	return g.transition(jobID, func(j *entities.Job) {
		j.Status = entities.StatusRunning
	})
}

func (g *JobsGateway) MarkCompleted(ctx context.Context, jobID string) (entities.Job, error) {
	return g.transition(jobID, func(j *entities.Job) {
		j.Status = entities.StatusCompleted
	})
}

func (g *JobsGateway) MarkFailed(ctx context.Context, jobID string, cause error) (entities.Job, error) {
	return g.transition(jobID, func(j *entities.Job) {
		j.Status = entities.StatusFailed
	})
}

func (g *JobsGateway) transition(jobID string, mutate func(j *entities.Job)) (entities.Job, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	j, ok := g.jobs[jobID]
	if !ok {
		return entities.Job{}, fmt.Errorf("job %q not found", jobID)
	}
	mutate(&j)
	g.jobs[jobID] = j
	return j, nil
}
