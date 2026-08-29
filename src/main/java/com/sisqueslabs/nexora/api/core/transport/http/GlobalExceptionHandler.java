package com.sisqueslabs.nexora.api.core.transport.http;

import org.axonframework.commandhandling.CommandExecutionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.sisqueslabs.nexora.api.core.domain.apperr.NotFoundException;

/**
 * The single place that translates an exception to an HTTP status +
 * OpenAI-style error body — don't duplicate this mapping in a controller.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException notFoundException) {
        return errorResponse(HttpStatus.NOT_FOUND, notFoundException.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleInvalidArgument(IllegalArgumentException invalidArgumentException) {
        return errorResponse(HttpStatus.BAD_REQUEST, invalidArgumentException.getMessage());
    }

    /**
     * Axon's CommandGateway wraps whatever a @CommandHandler throws in a
     * CommandExecutionException. Unwrap it and re-dispatch by the real
     * cause's type instead of collapsing every command failure to 500.
     */
    @ExceptionHandler(CommandExecutionException.class)
    public ResponseEntity<ErrorResponse> handleCommandExecutionFailure(CommandExecutionException commandExecutionException) {
        Throwable cause = commandExecutionException.getCause();
        if (cause instanceof NotFoundException notFoundException) {
            return handleNotFound(notFoundException);
        }
        if (cause instanceof IllegalArgumentException invalidArgumentException) {
            return handleInvalidArgument(invalidArgumentException);
        }
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, commandExecutionException.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception unexpectedException) {
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, unexpectedException.getMessage());
    }

    private static ResponseEntity<ErrorResponse> errorResponse(HttpStatus status, String message) {
        String type = status == HttpStatus.INTERNAL_SERVER_ERROR ? "internal_error" : "invalid_request_error";
        return ResponseEntity.status(status).body(ErrorResponse.of(message, type));
    }
}
