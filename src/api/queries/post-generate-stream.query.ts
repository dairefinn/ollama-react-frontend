import { OllamaMessage } from "../../models/ollama-message.model";
import { OllamaSupportedModel } from "../../models/ollama-supported-model.model";
import { validatePrompt } from "../validators/query.validator";

export type OllamaGenerateRequest = {
    model: OllamaSupportedModel;
    prompt: string;
    stream?: boolean;
};

export type OllamaGenerateResponse = {
    model: OllamaSupportedModel;
    created_at: string;
    response: string;
    done: boolean;
    done_reason: string;
    context: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
};

export const queryPostGenerateStream = (baseUrl: string) => {
    return async (model: OllamaSupportedModel, message: OllamaMessage): Promise<Response> => {
        try {
            if (message === null) {
                throw new Error("No messages in conversation");
            }

            validatePrompt(message.content);
        } catch (e: unknown) {
            if (e instanceof Error) {
                throw new Error(`Invalid prompt: ${e.message || 'Unknown error'}`);
            } else {
                throw new Error('Invalid prompt: Unknown error');
            }
        }

        const response = await fetch(
            `${baseUrl}/api/generate`,
            {
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    prompt: message.content,
                    stream: true
                } as OllamaGenerateRequest)
            }
        );

        return response;
    }
}
