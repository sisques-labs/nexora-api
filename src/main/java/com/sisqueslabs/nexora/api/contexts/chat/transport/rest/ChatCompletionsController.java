package com.sisqueslabs.nexora.api.contexts.chat.transport.rest;

import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion.CreateChatCompletionCommand;
import com.sisqueslabs.nexora.api.contexts.chat.application.command.createchatcompletion.CreateChatCompletionResult;
import com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto.ChatCompletionRequestDto;
import com.sisqueslabs.nexora.api.contexts.chat.transport.rest.dto.ChatCompletionResponseDto;

@RestController
@RequestMapping("/v1/chat")
public class ChatCompletionsController {

    private final CommandGateway commandGateway;

    public ChatCompletionsController(CommandGateway commandGateway) {
        this.commandGateway = commandGateway;
    }

    @PostMapping("/completions")
    public ChatCompletionResponseDto createChatCompletion(@RequestBody ChatCompletionRequestDto requestDto) {
        var request = requestDto.toDomain();

        CreateChatCompletionResult result = commandGateway.sendAndWait(new CreateChatCompletionCommand(request));

        return ChatCompletionResponseDto.from(result, request.model());
    }
}
