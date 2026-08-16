import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ALLOWLIST_PATH = path.resolve(process.cwd(), 'fs-allowlist.json');
const OLLAMA_BASE = 'http://localhost:11434';
const MAX_SEARCH_RESULTS = 100;

// --- Types ---

type FsPermission = 'none' | 'read' | 'write';

type OllamaMessageRole = 'system' | 'user' | 'assistant' | 'tool';

type OllamaMessage = {
    role: OllamaMessageRole;
    content: string;
    context?: string;
    tool_calls?: OllamaToolCall[];
};

type OllamaToolCall = {
    function: {
        name: string;
        arguments: Record<string, unknown>;
    };
};

type OllamaToolRequest = {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, unknown>;
            required: string[];
        };
    };
};

type OllamaChatResponse = {
    message: {
        role: string;
        content: string;
        tool_calls?: OllamaToolCall[];
    };
    done: boolean;
};

export type AgentEventType =
    | 'assistant_start'
    | 'chunk'
    | 'tool_call'
    | 'message_complete'
    | 'tool_result'
    | 'done'
    | 'error';

export type AgentEvent = {
    type: AgentEventType;
    data: unknown;
};

type AgentSession = {
    conversationId: string;
    model: string;
    tools: OllamaToolRequest[];
    fsPermission: FsPermission;
    status: 'running' | 'done' | 'error' | 'aborted';
    error?: string;
    events: AgentEvent[];
    clients: Set<ServerResponse>;
    abort: AbortController;
    currentPartial: string | null; // null = not mid-stream
};

// --- Sessions ---

const sessions = new Map<string, AgentSession>();

// --- Allowlist ---

type AllowlistEntry = { path: string; permission: 'read' | 'write' };

function readAllowlist(): AllowlistEntry[] {
    try { return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf-8')) as AllowlistEntry[]; }
    catch { return []; }
}

function isPathAllowed(target: string, allowlist: AllowlistEntry[], operation: 'read' | 'write'): boolean {
    const norm = path.normalize(target);
    const normDataDir = path.normalize(DATA_DIR);
    if (norm === normDataDir || norm.startsWith(normDataDir + path.sep)) return true;
    return allowlist.some(e => {
        const ne = path.normalize(e.path);
        const pathMatch = norm === ne || norm.startsWith(ne + path.sep);
        if (!pathMatch) return false;
        return operation === 'read' || e.permission === 'write';
    });
}

// --- Storage helpers ---

function readDataFile(filename: string): string | null {
    try { return fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'); }
    catch { return null; }
}

function writeDataFile(filename: string, content: string): void {
    const p = path.join(DATA_DIR, filename);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf-8');
}

// --- Tool execution ---

async function executeTool(call: OllamaToolCall, fsPermission: FsPermission): Promise<string> {
    const { name, arguments: args } = call.function;
    const allowlist = readAllowlist();

    switch (name) {
        case 'save_memory': {
            const title = args.title as string;
            const content = args.content as string;
            try {
                const existing = readDataFile('memories.json');
                const memories = existing ? JSON.parse(existing) as unknown[] : [];
                memories.push({ id: randomUUID(), title, content, timestamp: new Date().toISOString() });
                writeDataFile('memories.json', JSON.stringify(memories));
                return `Memory saved: "${title}"`;
            } catch { return `Failed to save memory: "${title}"`; }
        }
        case 'search_memory': {
            const query = ((args.query as string) ?? '').toLowerCase();
            try {
                const existing = readDataFile('memories.json');
                const memories = (existing ? JSON.parse(existing) : []) as { id: string; title: string; content: string }[];
                const matches = query
                    ? memories.filter(m => m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query))
                    : memories;
                if (matches.length === 0) return `No memories found matching: "${args.query as string}"`;
                return JSON.stringify(matches.map(({ id, title, content }) => ({ id, title, content })), null, 2);
            } catch { return 'Failed to search memories.'; }
        }
        case 'read_memory': {
            const targetId = args.id as string;
            try {
                const existing = readDataFile('memories.json');
                const memories = (existing ? JSON.parse(existing) : []) as { id: string; title: string; content: string }[];
                const found = memories.find(m => m.id === targetId);
                if (!found) return `No memory found with id: "${targetId}"`;
                return JSON.stringify(found, null, 2);
            } catch { return `Failed to read memory: "${targetId}"`; }
        }
        case 'delete_memory': {
            const targetId = args.id as string;
            try {
                const existing = readDataFile('memories.json');
                const memories = (existing ? JSON.parse(existing) : []) as { id: string }[];
                const filtered = memories.filter(m => m.id !== targetId);
                if (filtered.length === memories.length) return `No memory found with id: "${targetId}"`;
                writeDataFile('memories.json', JSON.stringify(filtered));
                return `Memory deleted: "${targetId}"`;
            } catch { return `Failed to delete memory: "${targetId}"`; }
        }
        case 'read_file': {
            if (fsPermission === 'none') return 'Filesystem access is disabled.';
            const filePath = args.path as string;
            if (!isPathAllowed(filePath, allowlist, 'read')) return 'Error: Path not in allowlist';
            try { return fs.readFileSync(filePath, 'utf-8'); }
            catch (e) { return `Error reading file: ${String(e)}`; }
        }
        case 'write_file': {
            if (fsPermission !== 'write') return 'Write access is disabled.';
            const filePath = args.path as string;
            const content = args.content as string;
            if (!isPathAllowed(filePath, allowlist, 'write')) return 'Error: Path not in allowlist or permission is read-only';
            try {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, content, 'utf-8');
                return `File written: ${filePath}`;
            } catch (e) { return `Error writing file: ${String(e)}`; }
        }
        case 'list_directory': {
            if (fsPermission === 'none') return 'Filesystem access is disabled.';
            const dirPath = args.path as string;
            if (!isPathAllowed(dirPath, allowlist, 'read')) return 'Error: Path not in allowlist';
            try {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                return JSON.stringify(entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() })), null, 2);
            } catch (e) { return `Error listing directory: ${String(e)}`; }
        }
        case 'search_files': {
            if (fsPermission === 'none') return 'Filesystem access is disabled.';
            const searchPath = args.path as string;
            const pattern = (args.pattern as string) ?? '*';
            if (!isPathAllowed(searchPath, allowlist, 'read')) return 'Error: Path not in allowlist';
            const globToRegex = (p: string): RegExp => {
                const esc = p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
                return new RegExp(`^${esc}$`, 'i');
            };
            const results: string[] = [];
            const searchRec = (dir: string): void => {
                if (results.length >= MAX_SEARCH_RESULTS) return;
                let entries: fs.Dirent[];
                try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
                for (const e of entries) {
                    if (results.length >= MAX_SEARCH_RESULTS) break;
                    const full = path.join(dir, e.name);
                    if (e.isDirectory()) searchRec(full);
                    else if (globToRegex(pattern).test(e.name)) results.push(full);
                }
            };
            searchRec(searchPath);
            return JSON.stringify(results, null, 2);
        }
        case 'create_directory': {
            if (fsPermission !== 'write') return 'Write access is disabled.';
            const dirPath = args.path as string;
            if (!isPathAllowed(dirPath, allowlist, 'write')) return 'Error: Path not in allowlist or permission is read-only';
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                return `Directory created: ${dirPath}`;
            } catch (e) { return `Error creating directory: ${String(e)}`; }
        }
        default:
            return `Unknown tool: ${name}`;
    }
}

// --- SSE helpers ---

function sendEvent(client: ServerResponse, event: AgentEvent, index: number): void {
    client.write(`id: ${index}\nevent: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
}

function broadcast(session: AgentSession, event: AgentEvent): void {
    const index = session.events.length;
    session.events.push(event);
    for (const client of session.clients) {
        sendEvent(client, event, index);
    }
}

function closeAllClients(session: AgentSession): void {
    for (const client of session.clients) {
        client.end();
    }
    session.clients.clear();
}

// --- Conversation persistence ---

function saveConversation(id: string, messages: OllamaMessage[]): void {
    writeDataFile(`conversations/${id}.json`, JSON.stringify({ messages }));
}

function toApiMessages(messages: OllamaMessage[]): { role: string; content: string }[] {
    return messages.map(m => ({
        role: m.role,
        content: m.context ? `${m.content}\n\n<auto-context>\n${m.context}\n</auto-context>` : m.content,
    }));
}

// --- Agent loop ---

async function runAgentLoop(session: AgentSession, messages: OllamaMessage[]): Promise<void> {
    broadcast(session, { type: 'assistant_start', data: {} });

    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: session.model,
            messages: toApiMessages(messages),
            tools: session.tools,
            stream: true,
        }),
        signal: session.abort.signal,
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const assistantMsg: OllamaMessage = { role: 'assistant', content: '' };
    messages.push(assistantMsg);
    session.currentPartial = '';

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let lineBuffer = '';
    let toolCalls: OllamaToolCall[] | undefined;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });

        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const parsed = JSON.parse(trimmed) as OllamaChatResponse;
                if (parsed.message.tool_calls?.length) {
                    toolCalls = parsed.message.tool_calls;
                    assistantMsg.tool_calls = toolCalls;
                    broadcast(session, { type: 'tool_call', data: toolCalls });
                    continue;
                }
                const content = parsed.message.content;
                assistantMsg.content += content;
                session.currentPartial = assistantMsg.content;
                broadcast(session, { type: 'chunk', data: { content } });
            } catch {
                // skip unparseable line
            }
        }
    }

    // Handle any remaining buffer content
    if (lineBuffer.trim()) {
        try {
            const parsed = JSON.parse(lineBuffer.trim()) as OllamaChatResponse;
            if (parsed.message.tool_calls?.length) {
                toolCalls = parsed.message.tool_calls;
                assistantMsg.tool_calls = toolCalls;
                broadcast(session, { type: 'tool_call', data: toolCalls });
            } else {
                const content = parsed.message.content;
                assistantMsg.content += content;
                broadcast(session, { type: 'chunk', data: { content } });
            }
        } catch {
            // skip
        }
    }

    session.currentPartial = null;
    broadcast(session, { type: 'message_complete', data: { content: assistantMsg.content, tool_calls: assistantMsg.tool_calls } });
    saveConversation(session.conversationId, messages);

    if (toolCalls?.length) {
        for (const call of toolCalls) {
            const result = await executeTool(call, session.fsPermission);
            messages.push({ role: 'tool', content: result });
            broadcast(session, { type: 'tool_result', data: { name: call.function.name, result } });
            saveConversation(session.conversationId, messages);
        }
        await runAgentLoop(session, messages);
    }
}

// --- HTTP helpers ---

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let d = '';
        req.on('data', (c: Buffer) => { d += c.toString(); });
        req.on('end', () => resolve(d));
        req.on('error', reject);
    });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

// --- Plugin ---

export function agentMiddlewarePlugin(): Plugin {
    return {
        name: 'vite-agent-middleware',
        configureServer(server) {
            server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
                if (!req.url?.startsWith('/api/agent')) return next();

                const url = new URL(req.url, 'http://localhost');
                const route = url.pathname;
                const method = req.method?.toUpperCase() ?? 'GET';

                try {
                    // POST /api/agent/start
                    if (route === '/api/agent/start' && method === 'POST') {
                        const body = JSON.parse(await readBody(req)) as {
                            conversationId: string;
                            model: string;
                            messages: OllamaMessage[];
                            tools: OllamaToolRequest[];
                            fsPermission: FsPermission;
                        };

                        const existing = sessions.get(body.conversationId);
                        if (existing?.status === 'running') existing.abort.abort();

                        const session: AgentSession = {
                            conversationId: body.conversationId,
                            model: body.model,
                            tools: body.tools,
                            fsPermission: body.fsPermission,
                            status: 'running',
                            events: [],
                            clients: new Set(),
                            abort: new AbortController(),
                            currentPartial: null,
                        };
                        sessions.set(body.conversationId, session);

                        runAgentLoop(session, body.messages)
                            .then(() => {
                                session.status = 'done';
                                broadcast(session, { type: 'done', data: {} });
                                closeAllClients(session);
                            })
                            .catch((e: Error) => {
                                if (e.name === 'AbortError') {
                                    session.status = 'aborted';
                                } else {
                                    session.status = 'error';
                                    session.error = e.message;
                                    broadcast(session, { type: 'error', data: { message: e.message } });
                                }
                                closeAllClients(session);
                            });

                        return sendJson(res, 200, { ok: true });
                    }

                    // GET /api/agent/status/:id
                    const statusMatch = /^\/api\/agent\/status\/(.+)$/.exec(route);
                    if (statusMatch && method === 'GET') {
                        const id = decodeURIComponent(statusMatch[1]);
                        const session = sessions.get(id);
                        if (!session) return sendJson(res, 200, { status: 'idle' });
                        return sendJson(res, 200, {
                            status: session.status,
                            eventCount: session.events.length,
                            partial: session.currentPartial,
                        });
                    }

                    // POST /api/agent/abort/:id
                    const abortMatch = /^\/api\/agent\/abort\/(.+)$/.exec(route);
                    if (abortMatch && method === 'POST') {
                        const id = decodeURIComponent(abortMatch[1]);
                        const session = sessions.get(id);
                        if (session?.status === 'running') session.abort.abort();
                        return sendJson(res, 200, { ok: true });
                    }

                    // GET /api/agent/stream/:id  (SSE)
                    const streamMatch = /^\/api\/agent\/stream\/(.+)$/.exec(route);
                    if (streamMatch && method === 'GET') {
                        const id = decodeURIComponent(streamMatch[1]);
                        const session = sessions.get(id);

                        res.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'X-Accel-Buffering': 'no',
                        });

                        if (!session) {
                            res.end();
                            return;
                        }

                        // Determine starting event index: prefer Last-Event-ID header (EventSource auto-reconnect)
                        const lastIdHeader = req.headers['last-event-id'];
                        const since = lastIdHeader !== undefined
                            ? parseInt(lastIdHeader, 10) + 1
                            : parseInt(url.searchParams.get('since') ?? '0', 10);

                        // Replay any missed events
                        for (let i = since; i < session.events.length; i++) {
                            sendEvent(res, session.events[i], i);
                        }

                        // If session already ended, close immediately
                        if (session.status !== 'running') {
                            res.end();
                            return;
                        }

                        // Register as a live client
                        session.clients.add(res);
                        req.on('close', () => {
                            session.clients.delete(res);
                        });
                        return;
                    }

                    next();
                } catch (e) {
                    sendJson(res, 500, { error: String(e) });
                }
            });
        }
    };
}
