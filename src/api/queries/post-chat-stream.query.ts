import { OllamaConversation } from "../../models/ollama-conversation.model";
import { OllamaSupportedModel } from "../../models/ollama-supported-model.model";
import { validatePrompt } from "../validators/query.validator";
import { OllamaChatRequest, OllamaToolRequest } from "./post-chat.query";

export const queryPostChatStream = (baseUrl: string) => {
    return async (model: OllamaSupportedModel, conversation: OllamaConversation, tools?: OllamaToolRequest[]): Promise<Response> => {
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

        const response = fetch(
            `${baseUrl}/api/chat`,
            {
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    messages: conversation.messages,
                    tools: tools || [],
                    stream: true
                } as OllamaChatRequest)
            }
        );

        return response;
    }
}
