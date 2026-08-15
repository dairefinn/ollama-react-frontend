import { OllamaToolRequest } from "../api/queries/post-chat.query";

export type FsPermission = 'none' | 'read' | 'write';

export type BuiltInTool = {
    friendlyName: string;
    definition: OllamaToolRequest;
    execute: (args: Record<string, unknown>) => Promise<string>;
    fsPermission?: 'read' | 'write';
};
