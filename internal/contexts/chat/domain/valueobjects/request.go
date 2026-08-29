package valueobjects

import "fmt"

// Request is an already-validated inference request, independent of the HTTP transport.
type Request struct {
	Model    string
	Messages []Message
}

func NewRequest(model string, messages []Message) (Request, error) {
	if model == "" {
		return Request{}, fmt.Errorf("chat: model must not be empty")
	}
	if len(messages) == 0 {
		return Request{}, fmt.Errorf("chat: messages must not be empty")
	}
	return Request{Model: model, Messages: messages}, nil
}
