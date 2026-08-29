package valueobjects

import "fmt"

// RequestValueObject is an already-validated inference request, independent of the HTTP transport.
type RequestValueObject struct {
	Model    string
	Messages []MessageValueObject
}

func NewRequestValueObject(model string, messages []MessageValueObject) (RequestValueObject, error) {
	if model == "" {
		return RequestValueObject{}, fmt.Errorf("chat: model must not be empty")
	}
	if len(messages) == 0 {
		return RequestValueObject{}, fmt.Errorf("chat: messages must not be empty")
	}
	return RequestValueObject{Model: model, Messages: messages}, nil
}
