package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/application/command/createchatcompletion"
	"github.com/sisques-labs/nexora-api/internal/contexts/chat/transport/rest/dto"
	"github.com/sisques-labs/nexora-api/internal/core/application/bus"
	httpserver "github.com/sisques-labs/nexora-api/internal/core/transport/http"
)

type ChatCompletionsHandler struct {
	commandBus *bus.Bus
}

func NewChatCompletionsHandler(commandBus *bus.Bus) *ChatCompletionsHandler {
	return &ChatCompletionsHandler{commandBus: commandBus}
}

func (h *ChatCompletionsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req dto.ChatCompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpserver.WriteError(w, http.StatusBadRequest, "invalid_request_error", "request body is not valid JSON")
		return
	}

	domainReq, err := req.ToDomain()
	if err != nil {
		httpserver.WriteError(w, http.StatusBadRequest, "invalid_request_error", err.Error())
		return
	}

	result, err := bus.Dispatch[createchatcompletion.Command, createchatcompletion.Result](
		r.Context(),
		h.commandBus,
		createchatcompletion.Command{Request: domainReq},
	)
	if err != nil {
		status, errType := httpserver.StatusAndTypeFor(err)
		httpserver.WriteError(w, status, errType, err.Error())
		return
	}

	resp := dto.ChatCompletionResponse{
		ID:      "chatcmpl-" + result.JobID,
		Object:  "chat.completion",
		Created: time.Now().Unix(),
		Model:   domainReq.Model,
		Choices: []dto.ChatCompletionChoice{
			{
				Index: 0,
				Message: dto.ChatCompletionMessage{
					Role:    string(result.Result.Message.Role),
					Content: result.Result.Message.Content,
				},
				FinishReason: string(result.Result.FinishReason),
			},
		},
	}

	httpserver.WriteJSON(w, http.StatusOK, resp)
}
