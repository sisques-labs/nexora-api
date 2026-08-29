package valueobjects

import "fmt"

// Role identifies who is speaking within a conversation turn.
type Role string

const (
	RoleSystem    Role = "system"
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
)

func (r Role) Valid() bool {
	switch r {
	case RoleSystem, RoleUser, RoleAssistant:
		return true
	default:
		return false
	}
}

// Message is a conversation turn sent in the request.
type Message struct {
	Role    Role
	Content string
}

func NewMessage(role Role, content string) (Message, error) {
	if !role.Valid() {
		return Message{}, fmt.Errorf("chat: invalid role %q", role)
	}
	if content == "" {
		return Message{}, fmt.Errorf("chat: content must not be empty")
	}
	return Message{Role: role, Content: content}, nil
}
