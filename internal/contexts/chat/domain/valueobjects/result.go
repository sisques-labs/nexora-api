package valueobjects

// FinishReasonValueObject indicates why the model stopped generating text.
type FinishReasonValueObject string

const (
	FinishReasonStop FinishReasonValueObject = "stop"
)

// ResultValueObject is the full inference response (no streaming in v0).
type ResultValueObject struct {
	Message      MessageValueObject
	FinishReason FinishReasonValueObject
}
