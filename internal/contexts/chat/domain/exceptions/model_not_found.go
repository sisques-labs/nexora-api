package exceptions

import "fmt"

// ModelNotFound is the domain exception for a requested model that
// doesn't exist in the catalog. The infrastructure layer wraps it with
// apperr.NotFound so transport can translate it to the right HTTP status.
type ModelNotFound struct {
	Requested string
	Available string
}

func (e *ModelNotFound) Error() string {
	return fmt.Sprintf("model %q not found, only %q is available in v0", e.Requested, e.Available)
}

func NewModelNotFound(requested, available string) *ModelNotFound {
	return &ModelNotFound{Requested: requested, Available: available}
}
