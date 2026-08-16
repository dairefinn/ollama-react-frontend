import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const ALLOWLIST_PATH = path.resolve(process.cwd(), 'fs-allowlist.json');
const MAX_SEARCH_RESULTS = 100;

type AllowlistEntry = { path: string; permission: 'read' | 'write' };

function readAllowlist(): AllowlistEntry[] {
    try {
        const raw = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf-8')) as unknown[];
        if (raw.length > 0 && typeof raw[0] === 'string') {
            const migrated = (raw as string[]).map(p => ({ path: p, permission: 'read' as const }));
            writeAllowlist(migrated);
            return migrated;
        }
        return raw as AllowlistEntry[];
    } catch { return []; }
}

function writeAllowlist(entries: AllowlistEntry[]): void {
    fs.writeFileSync(ALLOWLIST_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}

function isPathAllowed(target: string, allowlist: AllowlistEntry[], operation: 'read' | 'write'): boolean {
    const norm = path.normalize(target);
    return allowlist.some(e => {
        const ne = path.normalize(e.path);
        const pathMatch = norm === ne || norm.startsWith(ne + path.sep);
        if (!pathMatch) return false;
        return operation === 'read' || e.permission === 'write';
    });
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let d = '';
        req.on('data', (c: Buffer) => { d += c.toString(); });
        req.on('end', () => resolve(d));
        req.on('error', reject);
    });
}

function globToRegex(pattern: string): RegExp {
    const esc = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    return new RegExp(`^${esc}$`, 'i');
}

function searchRecursive(dir: string, regex: RegExp, results: string[]): void {
    if (results.length >= MAX_SEARCH_RESULTS) return;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
        if (results.length >= MAX_SEARCH_RESULTS) break;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) searchRecursive(full, regex, results);
        else if (regex.test(e.name)) results.push(full);
    }
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

export function fsMiddlewarePlugin(): Plugin {
    return {
        name: 'vite-fs-middleware',
        configureServer(server) {
            server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
                if (!req.url?.startsWith('/api/fs')) return next();
                const url = new URL(req.url, 'http://localhost');
                const route = url.pathname;
                const method = req.method?.toUpperCase() ?? 'GET';
                try {
                    if (route === '/api/fs/allowlist' && method === 'GET') {
                        return sendJson(res, 200, readAllowlist());
                    }
                    if (route === '/api/fs/allowlist' && method === 'POST') {
                        const { path: p, permission } = JSON.parse(await readBody(req)) as { path: string; permission: 'read' | 'write' };
                        const list = readAllowlist();
                        if (!list.some(e => e.path === p)) writeAllowlist([...list, { path: p, permission }]);
                        return sendJson(res, 200, { ok: true });
                    }
                    if (route === '/api/fs/allowlist' && method === 'PATCH') {
                        const { path: p, permission } = JSON.parse(await readBody(req)) as { path: string; permission: 'read' | 'write' };
                        writeAllowlist(readAllowlist().map(e => e.path === p ? { ...e, permission } : e));
                        return sendJson(res, 200, { ok: true });
                    }
                    if (route === '/api/fs/allowlist' && method === 'DELETE') {
                        const { path: p } = JSON.parse(await readBody(req)) as { path: string };
                        writeAllowlist(readAllowlist().filter(e => e.path !== p));
                        return sendJson(res, 200, { ok: true });
                    }
                    if (route === '/api/fs/read' && method === 'GET') {
                        const p = url.searchParams.get('path') ?? '';
                        if (!isPathAllowed(p, readAllowlist(), 'read')) return sendJson(res, 403, { error: 'Path not in allowlist' });
                        return sendJson(res, 200, { content: fs.readFileSync(p, 'utf-8') });
                    }
                    if (route === '/api/fs/list' && method === 'GET') {
                        const p = url.searchParams.get('path') ?? '';
                        if (!isPathAllowed(p, readAllowlist(), 'read')) return sendJson(res, 403, { error: 'Path not in allowlist' });
                        const entries = fs.readdirSync(p, { withFileTypes: true });
                        return sendJson(res, 200, { entries: entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() })) });
                    }
                    if (route === '/api/fs/search' && method === 'GET') {
                        const p = url.searchParams.get('path') ?? '';
                        const pattern = url.searchParams.get('pattern') ?? '*';
                        if (!isPathAllowed(p, readAllowlist(), 'read')) return sendJson(res, 403, { error: 'Path not in allowlist' });
                        const matches: string[] = [];
                        searchRecursive(p, globToRegex(pattern), matches);
                        return sendJson(res, 200, { matches });
                    }
                    if (route === '/api/fs/write' && method === 'POST') {
                        const { path: p, content } = JSON.parse(await readBody(req)) as { path: string; content: string };
                        if (!isPathAllowed(p, readAllowlist(), 'write')) return sendJson(res, 403, { error: 'Path not in allowlist or permission is read-only' });
                        fs.mkdirSync(path.dirname(p), { recursive: true });
                        fs.writeFileSync(p, content, 'utf-8');
                        return sendJson(res, 200, { ok: true });
                    }
                    if (route === '/api/fs/mkdir' && method === 'POST') {
                        const { path: p } = JSON.parse(await readBody(req)) as { path: string };
                        if (!isPathAllowed(p, readAllowlist(), 'write')) return sendJson(res, 403, { error: 'Path not in allowlist or permission is read-only' });
                        fs.mkdirSync(p, { recursive: true });
                        return sendJson(res, 200, { ok: true });
                    }
                    next();
                } catch (e) {
                    const code = (e as NodeJS.ErrnoException).code;
                    sendJson(res, code === 'ENOENT' ? 404 : 500, { error: String(e) });
                }
            });
        }
    };
}
