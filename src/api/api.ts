
type OllamaSupportedModels = 'deepseek-r1';

type OllamaGenerateRequest = {
    model: OllamaSupportedModels,
    prompt: string,
    stream?: boolean
}

export type OllamaGenerateResponse = {
    model: OllamaSupportedModels,
    created_at: string,
    response: string,
    done: boolean,
    done_reason: string,
    context: number[],
    total_duration: number,
    load_duration: number,
    prompt_eval_count: number,
    prompt_eval_duration: number,
    eval_count: number,
    eval_duration: number
}

class OllamaAPIHandler
{

    private baseUrl: string = "http://localhost:11434"
    
    public async generate(model: OllamaSupportedModels, prompt: string): Promise<OllamaGenerateResponse>
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

}

const OllamaAPI = new OllamaAPIHandler();

export default OllamaAPI;
