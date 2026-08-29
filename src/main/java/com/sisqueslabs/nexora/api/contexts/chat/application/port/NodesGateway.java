package com.sisqueslabs.nexora.api.contexts.chat.application.port;

import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.RequestValueObject;
import com.sisqueslabs.nexora.api.contexts.chat.domain.valueobjects.ResultValueObject;

/**
 * Resolves the node/agent that will handle the job and runs the
 * inference against it. In v0 this includes simulating the agent (the
 * "fake agent"); in the future nexora-nodes will bridge to the real
 * nexora-agent.
 */
public interface NodesGateway {

    ResultValueObject dispatch(String nodeId, RequestValueObject request);
}
