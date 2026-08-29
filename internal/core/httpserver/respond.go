package httpserver

import (
	"encoding/json"
	"net/http"

	"github.com/sisques-labs/nexora-api/internal/core/apperr"
)

// ErrorResponse follows the OpenAI API's error shape, so existing
// clients that already know how to read OpenAI errors don't need a
// separate code path for Nexora. It's shared by every context, just
// like core/filters/base-exception.filter.ts in the Nest template.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

func WriteJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func WriteError(w http.ResponseWriter, status int, errType string, message string) {
	WriteJSON(w, status, ErrorResponse{Error: ErrorBody{Message: message, Type: errType}})
}

// StatusAndTypeFor translates an apperr category to an HTTP status and
// an OpenAI-style error "type".
func StatusAndTypeFor(err error) (int, string) {
	switch apperr.KindOf(err) {
	case apperr.KindNotFound:
		return http.StatusNotFound, "invalid_request_error"
	case apperr.KindInvalid:
		return http.StatusBadRequest, "invalid_request_error"
	default:
		return http.StatusInternalServerError, "internal_error"
	}
}
