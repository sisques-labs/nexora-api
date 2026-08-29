package createchatcompletion_test

import (
	"context"
	"testing"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/application/command/createchatcompletion"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/valueobjects"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/infrastructure/mock"
	"github.com/sisques-labs/nexora-api/internal/core/apperr"
)

func newHandler() (*createchatcompletion.Handler, string) {
	models := mock.NewModelsGateway()
	jobs := mock.NewJobsGateway()
	nodes := mock.NewNodesGateway()
	scheduler := mock.NewSchedulerGateway(nodes.OnlyNodeID())

	return createchatcompletion.NewHandler(models, jobs, scheduler, nodes), "nexora-mock-llama-3.1-8b"
}

func TestHandler_Success(t *testing.T) {
	h, modelName := newHandler()

	msg, err := valueobjects.NewMessage(valueobjects.RoleUser, "hola")
	if err != nil {
		t.Fatalf("unexpected error building message: %v", err)
	}
	req, err := valueobjects.NewRequest(modelName, []valueobjects.Message{msg})
	if err != nil {
		t.Fatalf("unexpected error building request: %v", err)
	}

	result, err := h.Handle(context.Background(), createchatcompletion.Command{Request: req})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.JobID == "" {
		t.Error("expected a non-empty job ID")
	}
	if result.Result.Message.Role != valueobjects.RoleAssistant {
		t.Errorf("expected assistant role, got %q", result.Result.Message.Role)
	}
	if result.Result.FinishReason != valueobjects.FinishReasonStop {
		t.Errorf("expected finish reason stop, got %q", result.Result.FinishReason)
	}
}

func TestHandler_UnknownModel(t *testing.T) {
	h, _ := newHandler()

	msg, err := valueobjects.NewMessage(valueobjects.RoleUser, "hola")
	if err != nil {
		t.Fatalf("unexpected error building message: %v", err)
	}
	req, err := valueobjects.NewRequest("modelo-inexistente", []valueobjects.Message{msg})
	if err != nil {
		t.Fatalf("unexpected error building request: %v", err)
	}

	_, err = h.Handle(context.Background(), createchatcompletion.Command{Request: req})
	if err == nil {
		t.Fatal("expected an error for an unknown model")
	}
	if apperr.KindOf(err) != apperr.KindNotFound {
		t.Errorf("expected KindNotFound, got %q", apperr.KindOf(err))
	}
}
