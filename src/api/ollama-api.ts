import { OllamaSupportedModel, OllamaGenerateResponse, OllamaGenerateRequest, OllamaMessage, OllamaToolRequest, OllamaChatResponse } from "./ollama-models";

class OllamaAPIHandler
{

    private baseUrl: string = "http://localhost:11434"
    
    public async generate(model: OllamaSupportedModel, prompt: string): Promise<OllamaGenerateResponse>
    {
        console.info(`Generating with model ${model} and prompt ${prompt}`)
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

    public async chat(model: OllamaSupportedModel, messages?: OllamaMessage[], tools?: OllamaToolRequest[]): Promise<OllamaChatResponse>
    {
        console.info(`Chatting with model ${model} and messages ${messages} and tools ${tools}`)
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

}

const OllamaAPI = new OllamaAPIHandler();

export default OllamaAPI;
