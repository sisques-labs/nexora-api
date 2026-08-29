package entities

// Hardware is what the agent auto-detects on the remote machine.
// In v0 the real registry lives in nexora-nodes; here it's just the
// shape nexora-api needs to reason about which node it routes to.
type Hardware struct {
	CPU     string
	RAMGB   int
	GPU     string
	VRAMGB  int
	Runtime string
}

// Node is an available inference node.
type Node struct {
	ID       string
	Hardware Hardware
}
