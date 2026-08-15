import { OllamaToolRequest } from "../api/queries/post-chat.query";

export type BuiltInTool = {
    friendlyName: string;
    definition: OllamaToolRequest;
    execute: (args: Record<string, unknown>) => string;
};
