package createchatcompletion

import "github.com/sisques-labs/nexora-api/internal/contexts/chat/domain/valueobjects"

// Command is the (only, in v0) write command of the chat context:
// it enters as POST /v1/chat/completions.
type Command struct {
	Request valueobjects.RequestValueObject
}

// Result is what the handler returns to transport.
type Result struct {
	JobID  string
	Result valueobjects.ResultValueObject
}
