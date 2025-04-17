import { OllamaMessage } from "./ollama-message.model";

export class OllamaConversation {

    // public title: string; // TODO: When saving, pass all messages into the model and generate a short title
    public messages: OllamaMessage[];

    public get latestMessage(): OllamaMessage {
        if (this.messages.length === 0) return null!;
        return this.messages[this.messages.length - 1];
    }

    constructor(messages?: OllamaMessage[]) {
        this.messages = messages || [];
    }

    public addMessage(message: OllamaMessage): void {
        this.messages.push(message);
    }
    
    public revertToMessage(index: number): void {
        if (index < 0) return;
        if (index >= this.messages.length) return;
        this.messages = this.messages.slice(0, index + 1);
    }

    public undoLatestMessage(): void {
        if (this.messages.length === 1) {
            this.messages = [];
        }

        this.revertToMessage(this.messages.length - 2);        
    }

    public appendToLatestMessage(content: string): void {
        if (this.messages.length === 0) return;
        this.messages[this.messages.length - 1].content += content;
    }

}
