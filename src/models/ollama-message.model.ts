export type OllamaMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type OllamaToolCall = {
    function: {
        name: string;
        arguments: Record<string, unknown>;
    };
};

export class OllamaMessage {

    public role: OllamaMessageRole;
    public content: string;
    public context?: string;
    public tool_calls?: OllamaToolCall[];

    constructor(prompt: string, role?: OllamaMessageRole) {
        this.content = prompt;
        this.role = role || 'user';
    }

}
