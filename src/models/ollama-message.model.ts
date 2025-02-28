export type OllamaMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export class OllamaMessage {

    public role: OllamaMessageRole;
    public content: string;

    constructor(prompt: string, role?: OllamaMessageRole) {
        this.content = prompt;
        this.role = role || 'user';
    }

}
