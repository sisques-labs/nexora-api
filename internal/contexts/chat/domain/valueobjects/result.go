package valueobjects

// FinishReason indicates why the model stopped generating text.
type FinishReason string

const (
	FinishReasonStop FinishReason = "stop"
)

// Result is the full inference response (no streaming in v0).
type Result struct {
	Message      Message
	FinishReason FinishReason
}
