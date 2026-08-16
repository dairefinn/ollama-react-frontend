import { OllamaToolCall } from "../models/ollama-message.model";
import { OllamaToolRequest } from "../api/queries/post-chat.query";
import { BuiltInTool, FsPermission } from "./tool.types";
import { saveMemoryTool } from "./save-memory.tool";
import { searchMemoryTool } from "./search-memory.tool";
import { readMemoryTool } from "./read-memory.tool";
import { readFileTool } from "./read-file.tool";
import { listDirectoryTool } from "./list-directory.tool";
import { searchFilesTool } from "./search-files.tool";
import { writeFileTool } from "./write-file.tool";
import { createDirectoryTool } from "./create-directory.tool";

const BUILT_IN_TOOLS: BuiltInTool[] = [
    saveMemoryTool,
    searchMemoryTool,
    readMemoryTool,
    readFileTool,
    listDirectoryTool,
    searchFilesTool,
    writeFileTool,
    createDirectoryTool,
];

export function getToolDefinitions(fsPermission: FsPermission): OllamaToolRequest[] {
    return BUILT_IN_TOOLS
        .filter(t => {
            if (!t.fsPermission) return true;
            if (fsPermission === 'none') return false;
            if (fsPermission === 'read') return t.fsPermission === 'read';
            return true;
        })
        .map(t => t.definition);
}

export async function executeTool(call: OllamaToolCall): Promise<string> {
    const tool = BUILT_IN_TOOLS.find(t => t.definition.function.name === call.function.name);
    if (!tool) return `Unknown tool: ${call.function.name}`;
    return tool.execute(call.function.arguments);
}

export function getToolFriendlyName(name: string): string {
    return BUILT_IN_TOOLS.find(t => t.definition.function.name === name)?.friendlyName ?? name;
}

export function getToolLabel(name: string, args: Record<string, unknown>): string {
    const tool = BUILT_IN_TOOLS.find(t => t.definition.function.name === name);
    if (!tool) return name;
    return tool.renderLabel ? tool.renderLabel(args) : tool.friendlyName;
}
