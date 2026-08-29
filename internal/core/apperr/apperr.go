// Package apperr defines the error categories the application layer
// exposes to transport, so an HTTP handler can map to a status code
// without knowing the details of each gateway.
package apperr

import "errors"

type Kind string

const (
	KindNotFound Kind = "not_found"
	KindInvalid  Kind = "invalid"
	KindInternal Kind = "internal"
)

type Error struct {
	Kind Kind
	Err  error
}

func (e *Error) Error() string { return e.Err.Error() }
func (e *Error) Unwrap() error { return e.Err }

func NotFound(err error) error { return &Error{Kind: KindNotFound, Err: err} }
func Invalid(err error) error  { return &Error{Kind: KindInvalid, Err: err} }

// KindOf returns the error's category, or KindInternal if it's not an
// *Error (e.g. an unexpected infrastructure failure).
func KindOf(err error) Kind {
	var appErr *Error
	if errors.As(err, &appErr) {
		return appErr.Kind
	}
	return KindInternal
}
