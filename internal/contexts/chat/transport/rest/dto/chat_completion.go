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

func (r ChatCompletionRequest) ToDomain() (valueobjects.RequestValueObject, error) {
	if len(r.Messages) == 0 {
		return valueobjects.RequestValueObject{}, fmt.Errorf("messages must not be empty")
	}

	messages := make([]valueobjects.MessageValueObject, 0, len(r.Messages))
	for i, message := range r.Messages {
		domainMessage, err := valueobjects.NewMessageValueObject(valueobjects.RoleValueObject(message.Role), message.Content)
		if err != nil {
			return valueobjects.RequestValueObject{}, fmt.Errorf("messages[%d]: %w", i, err)
		}
		messages = append(messages, domainMessage)
	}

	return valueobjects.NewRequestValueObject(r.Model, messages)
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
