import { OllamaToolCall } from "../models/ollama-message.model";
import { OllamaToolRequest } from "../api/queries/post-chat.query";
import { BuiltInTool } from "./tool.types";
import { saveMemoryTool } from "./save-memory.tool";
import { searchMemoryTool } from "./search-memory.tool";
import { readMemoryTool } from "./read-memory.tool";

const BUILT_IN_TOOLS: BuiltInTool[] = [
    saveMemoryTool,
    searchMemoryTool,
    readMemoryTool,
];

export function getToolDefinitions(): OllamaToolRequest[] {
    return BUILT_IN_TOOLS.map(t => t.definition);
}

export function executeTool(call: OllamaToolCall): string {
    const tool = BUILT_IN_TOOLS.find(t => t.definition.function.name === call.function.name);
    if (!tool) return `Unknown tool: ${call.function.name}`;
    return tool.execute(call.function.arguments);
}

export function getToolFriendlyName(name: string): string {
    return BUILT_IN_TOOLS.find(t => t.definition.function.name === name)?.friendlyName ?? name;
}
