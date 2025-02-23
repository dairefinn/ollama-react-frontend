
export enum OllamaSupportedModel {
    DeepseekR1 = 'deepseek-r1',
    Llama33 = 'llama3.3',
    Phi4 = 'phi4',
    Gemma2 = 'gemma2',
    Mistral = 'mistral',
    Moondream2 = 'moondream',
    NeuralChat = 'neural-chat',
    Starling = 'starling-lm',
    CodeLlama = 'codellama',
    Llama2Uncensored = 'llama2-uncensored',
    LLaVA = 'llava',
    Solar = 'solar'
}

export type OllamaMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
};

export type OllamaGenerateRequest = {
    model: OllamaSupportedModel;
    prompt: string;
    stream?: boolean;
};

export type OllamaToolRequest = {
    type: string;
    function: {
        name: string;
        properties: unknown;
    };
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
