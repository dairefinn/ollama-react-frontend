export type OnMessageCallback = (message: string) => void;
export type OnErrorCallback = (error: Error) => void;
export type OnCompleteCallback = () => void;

export class ResponseStreamer {

    static async Stream(
        source: Response,
        onMessage: OnMessageCallback,
        onError: OnErrorCallback = (error: Error) => {
            console.error(error);
        },
        onComplete: OnCompleteCallback = () => {},
        decoder: TextDecoder = new TextDecoder("utf-8")
    ): Promise<void> {
        const reader = source.body?.getReader();
        if (!reader) {
            onError(new Error("Failed to get reader from response body."));
            return;
        }
    
        while (true) {
            try {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
        
                const chunk = decoder.decode(value);
                onMessage(chunk);
            } catch (e) {
                onError(new Error(`Failed to process chunk: ${e}`));
            }
        }
    
        onComplete();
    }

}
