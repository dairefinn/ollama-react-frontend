let dataDirCache: string | null = null;

async function getDataDir(): Promise<string> {
    if (dataDirCache) return dataDirCache;
    const res = await fetch('/api/fs/data-dir');
    const data = await res.json() as { path: string };
    dataDirCache = data.path;
    return dataDirCache;
}

export async function readStorageFile(filename: string): Promise<string | null> {
    const dir = await getDataDir();
    const res = await fetch(`/api/fs/read?path=${encodeURIComponent(dir + '/' + filename)}`);
    if (!res.ok) return null;
    const data = await res.json() as { content: string };
    return data.content;
}

export async function writeStorageFile(filename: string, content: string): Promise<void> {
    const dir = await getDataDir();
    await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dir + '/' + filename, content }),
    });
}

export async function deleteStorageFile(filename: string): Promise<void> {
    const dir = await getDataDir();
    await fetch('/api/fs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dir + '/' + filename }),
    });
}
