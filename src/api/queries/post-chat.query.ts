import { OllamaConversation } from "../../models/ollama-conversation.model";
import { OllamaMessage } from "../../models/ollama-message.model";
import { OllamaSupportedModel } from "../../models/ollama-supported-model.model";
import { validatePrompt } from "../validators/query.validator";

export type OllamaToolRequest = {
    type: string;
    function: {
        name: string;
        properties: unknown;
    };
};

export type OllamaChatRequest = {
    model: OllamaSupportedModel;
    messages: OllamaMessage[];
    tools?: OllamaToolRequest[];
    stream?: boolean;
}

export type OllamaChatResponse = {
    model: OllamaSupportedModel;
    created_at: string;
    message: OllamaMessage;
    done: boolean;
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
};

export const queryPostChat = (baseUrl: string) => {
    return async (model: OllamaSupportedModel, conversation: OllamaConversation, tools?: OllamaToolRequest[]): Promise<OllamaChatResponse> => {
        try {
            const latestMessage = conversation.latestMessage;
            if (latestMessage === null) {
                return Promise.reject(new Error("No messages in conversation"));
            }

            validatePrompt(conversation.latestMessage.content);
        } catch (e: unknown) {
            if (e instanceof Error) {
                throw Promise.reject(new Error(`Invalid prompt: ${e.message || 'Unknown error'}`));
            } else {
                throw Promise.reject(new Error('Invalid prompt: Unknown error'));
            }
        }

        const response = await fetch(
            `${baseUrl}/api/chat`,
            {
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    messages: conversation.messages,
                    tools: tools || [],
                    stream: false
                } as OllamaChatRequest)
            }
        );
        return await response.json();
    }
}
