import { OllamaSupportedModel, OllamaGenerateResponse, OllamaGenerateRequest, OllamaMessage, OllamaToolRequest, OllamaChatResponse } from "./ollama-models";

class OllamaAPIHandler
{

    private baseUrl: string = "http://localhost:11434"
    
    public async generate(model: OllamaSupportedModel, prompt: string): Promise<OllamaGenerateResponse>
    {
        OllamaAPIHandler.validatePrompt(prompt);

        return fetch(
            `${this.baseUrl}/api/generate`,
            {
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false
                } as OllamaGenerateRequest)
            }
        ).then(response => response.json());
    }

    public async chat(model: OllamaSupportedModel, messages: OllamaMessage[], tools?: OllamaToolRequest[]): Promise<OllamaChatResponse>
    {
        const lastMessage: string = messages[messages.length - 1].content || "";
        OllamaAPIHandler.validatePrompt(lastMessage);

        return fetch(
            `${this.baseUrl}/api/chat`,
            {
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    tools: tools || [],
                    stream: false
                })
            }
        ).then(response => response.json())
    }

    private static validatePrompt(prompt: string): void
    {
        console.info(`Validating prompt ${prompt}`)
        if (!prompt || prompt.length === 0)
        {
            throw new Error("Prompt cannot be empty");
        }

        if (prompt.length > 2048)
        {
            throw new Error("Prompt cannot be longer than 2048 characters");
        }
    }

}

const OllamaAPI = new OllamaAPIHandler();

export default OllamaAPI;
