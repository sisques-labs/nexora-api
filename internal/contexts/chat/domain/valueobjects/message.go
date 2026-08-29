package valueobjects

import "fmt"

// RoleValueObject identifies who is speaking within a conversation turn.
type RoleValueObject string

const (
	RoleSystem    RoleValueObject = "system"
	RoleUser      RoleValueObject = "user"
	RoleAssistant RoleValueObject = "assistant"
)

func (r RoleValueObject) Valid() bool {
	switch r {
	case RoleSystem, RoleUser, RoleAssistant:
		return true
	default:
		return false
	}
}

// MessageValueObject is a conversation turn sent in the request.
type MessageValueObject struct {
	Role    RoleValueObject
	Content string
}

func NewMessageValueObject(role RoleValueObject, content string) (MessageValueObject, error) {
	if !role.Valid() {
		return MessageValueObject{}, fmt.Errorf("chat: invalid role %q", role)
	}
	if content == "" {
		return MessageValueObject{}, fmt.Errorf("chat: content must not be empty")
	}
	return MessageValueObject{Role: role, Content: content}, nil
}
