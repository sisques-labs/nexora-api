// Package bus implements an in-process CQRS mediator, equivalent to
// Nest's CommandBus/QueryBus: each Command (or Query) has a single
// Handler registered, and the caller dispatches it by type without
// knowing the concrete implementation. The difference from Nest is
// that here the "type" is the Command's Go type, and dispatch is
// resolved with generics + reflection instead of a decorator and a DI
// container.
package bus

import (
	"context"
	"fmt"
	"reflect"
)

// Handler executes a Command or Query C and returns a result R.
type Handler[C any, R any] interface {
	Handle(ctx context.Context, msg C) (R, error)
}

// Bus is a generic mediator. One instance is used as a CommandBus and,
// if needed, a separate one as a QueryBus — the implementation is the
// same, the separation is one of intent.
type Bus struct {
	handlers map[reflect.Type]any
}

func New() *Bus {
	return &Bus{handlers: make(map[reflect.Type]any)}
}

// Register associates C's type with the handler that resolves it. It
// must be called once per Command/Query type, typically during the
// wiring in main.go.
func Register[C any, R any](b *Bus, handler Handler[C, R]) {
	var zero C
	b.handlers[reflect.TypeOf(zero)] = handler
}

// Dispatch looks up the handler registered for msg's type and runs it.
func Dispatch[C any, R any](ctx context.Context, b *Bus, msg C) (R, error) {
	var zero R
	raw, ok := b.handlers[reflect.TypeOf(msg)]
	if !ok {
		return zero, fmt.Errorf("bus: no handler registered for %T", msg)
	}
	handler, ok := raw.(Handler[C, R])
	if !ok {
		return zero, fmt.Errorf("bus: handler registered for %T has an unexpected signature", msg)
	}
	return handler.Handle(ctx, msg)
}
