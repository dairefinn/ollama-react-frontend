export enum OllamaSupportedModel {
    DeepseekR1 = 'deepseek-r1'
}

export type OllamaMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string;
}

type OllamaGenerateRequest = {
    model: OllamaSupportedModel;
    prompt: string;
    stream?: boolean;
}

type OllamaToolRequest = {
    type: string;
    function: {
        name: string;
        properties: unknown;
    }
}

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
}

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
        )
            .then(response => response.json())
            .then(response => {
                console.info("Response", response);
                return response as OllamaGenerateResponse;
            })
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
        )
            .then(response => response.json())
    }

}

const OllamaAPI = new OllamaAPIHandler();

export default OllamaAPI;
