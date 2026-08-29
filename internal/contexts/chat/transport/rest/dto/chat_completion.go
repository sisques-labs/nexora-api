package dto

import (
	"fmt"

	"github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/valueobjects"
)

// ChatCompletionRequest mirrors the shape of the OpenAI API's
// POST /v1/chat/completions (only the fields Nexora supports in v0: no
// streaming, no temperature/top_p/etc yet).
type ChatCompletionRequest struct {
	Model    string                  `json:"model"`
	Messages []ChatCompletionMessage `json:"messages"`
}

type ChatCompletionMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func (r ChatCompletionRequest) ToDomain() (valueobjects.Request, error) {
	if len(r.Messages) == 0 {
		return valueobjects.Request{}, fmt.Errorf("messages must not be empty")
	}

	messages := make([]valueobjects.Message, 0, len(r.Messages))
	for i, m := range r.Messages {
		msg, err := valueobjects.NewMessage(valueobjects.Role(m.Role), m.Content)
		if err != nil {
			return valueobjects.Request{}, fmt.Errorf("messages[%d]: %w", i, err)
		}
		messages = append(messages, msg)
	}

	return valueobjects.NewRequest(r.Model, messages)
}

// ChatCompletionResponse mirrors OpenAI's response shape.
type ChatCompletionResponse struct {
	ID      string                 `json:"id"`
	Object  string                 `json:"object"`
	Created int64                  `json:"created"`
	Model   string                 `json:"model"`
	Choices []ChatCompletionChoice `json:"choices"`
}

type ChatCompletionChoice struct {
	Index        int                   `json:"index"`
	Message      ChatCompletionMessage `json:"message"`
	FinishReason string                `json:"finish_reason"`
}
