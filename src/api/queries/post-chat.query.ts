import { OllamaConversation } from "../../models/ollama-conversation.model";
import { OllamaMessage } from "../../models/ollama-message.model";
import { validatePrompt } from "../validators/query.validator";

export type OllamaToolRequest = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, unknown>;
            required: string[];
        };
    };
};

export type OllamaChatRequest = {
    model: string;
    messages: OllamaMessage[];
    tools?: OllamaToolRequest[];
    stream?: boolean;
}

export type OllamaChatResponse = {
    model: string;
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
    return async (model: string, conversation: OllamaConversation, tools?: OllamaToolRequest[]): Promise<OllamaChatResponse> => {
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
                    messages: conversation.apiMessages(),
                    tools: tools || [],
                    stream: false
                } as OllamaChatRequest)
            }
        );

        return await response.json();
    }
}
