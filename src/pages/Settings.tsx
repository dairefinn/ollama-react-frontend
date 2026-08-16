import { JSX, useState } from "react";
import { TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { useSystemContext } from "../utils/use-system-context";
import { useMessageContext } from "../utils/use-message-context";
import { useFsAllowlist } from "../utils/use-fs-allowlist";
import { useFsPermission } from "../utils/use-fs-permission";
import { FsPermission } from "../tools/tool.types";

function SettingsPage(): JSX.Element {
    const [systemContext, setSystemContext] = useSystemContext();
    const [messageContext, setMessageContext] = useMessageContext();
    const { allowlist, loading, error, addEntry, updatePermission, removeEntry } = useFsAllowlist();
    const [fsPermission, setFsPermission] = useFsPermission();
    const [newPath, setNewPath] = useState('');
    const [newPermission, setNewPermission] = useState<'read' | 'write'>('read');
    const [addError, setAddError] = useState<string | null>(null);

    const handleAddPath = async () => {
        const p = newPath.trim();
        if (!p) return;
        try {
            await addEntry(p, newPermission);
            setNewPath('');
            setAddError(null);
        } catch (e) {
            setAddError(String(e));
        }
    };

    return (
        <div className="settings-page">
            <h2 className="settings-title">Settings</h2>

            <section className="settings-section">
                <h3 className="settings-section-title">Chat</h3>
                <div className="settings-field">
                    <label className="settings-label" htmlFor="initial-context">Initial context</label>
                    <p className="settings-description">Injected as a system message at the start of every new conversation. Not shown in the chat unless expanded.</p>
                    <textarea
                        id="initial-context"
                        className="settings-textarea"
                        value={systemContext}
                        onChange={(e) => setSystemContext(e.target.value)}
                        placeholder="e.g. You are a helpful assistant with expertise in..."
                        rows={6}
                    />
                </div>
                <div className="settings-field">
                    <label className="settings-label" htmlFor="message-context">Message context</label>
                    <p className="settings-description">Appended to every message you send. Supports variables: <code>{"{{timestamp}}"}</code>, <code>{"{{date}}"}</code>, <code>{"{{time}}"}</code>.</p>
                    <textarea
                        id="message-context"
                        className="settings-textarea"
                        value={messageContext}
                        onChange={(e) => setMessageContext(e.target.value)}
                        placeholder={"e.g. Current time: {{timestamp}}"}
                        rows={6}
                    />
                </div>
            </section>

            <section className="settings-section">
                <h3 className="settings-section-title">Filesystem</h3>
                <div className="settings-field">
                    <label className="settings-label">Access level</label>
                    <p className="settings-description">Controls which filesystem tools the AI can use.</p>
                    <div className="fs-permission-group">
                        {(['none', 'read', 'write'] as FsPermission[]).map(level => (
                            <button
                                key={level}
                                className={`fs-permission-btn${fsPermission === level ? ' fs-permission-btn--active' : ''}`}
                                onClick={() => setFsPermission(level)}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="settings-field">
                    <label className="settings-label">Allowlist</label>
                    <p className="settings-description">
                        Paths the AI can access. Each entry can be independently set to read-only or read/write.
                    </p>
                    {loading && <p className="settings-description">Loading…</p>}
                    {error && <p className="settings-error">{error}</p>}
                    {!loading && (
                        <div className="allowlist-list">
                            {allowlist.map(entry => (
                                <div key={entry.path} className="allowlist-entry">
                                    <span className="allowlist-entry-path">{entry.path}</span>
                                    <div className="allowlist-entry-actions">
                                        {entry.permission === 'write' && fsPermission === 'read' && (
                                            <span className="allowlist-warning" title="Write permission has no effect while global access is set to Read">
                                                <WarningIcon size={16} />
                                            </span>
                                        )}
                                        <div className="allowlist-permission-group">
                                            {(['read', 'write'] as const).map(level => (
                                                <button
                                                    key={level}
                                                    className={`allowlist-permission-btn${entry.permission === level ? ' allowlist-permission-btn--active' : ''}`}
                                                    onClick={() => void updatePermission(entry.path, level)}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        <button className="icon-btn" title="Remove" onClick={() => void removeEntry(entry.path)}>
                                            <TrashIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="allowlist-add-row">
                        <input
                            type="text"
                            className="settings-input"
                            placeholder="e.g. C:\Users\me\Projects"
                            value={newPath}
                            onChange={e => setNewPath(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && void handleAddPath()}
                        />
                        <div className="allowlist-permission-group">
                            {(['read', 'write'] as const).map(level => (
                                <button
                                    key={level}
                                    className={`allowlist-permission-btn${newPermission === level ? ' allowlist-permission-btn--active' : ''}`}
                                    onClick={() => setNewPermission(level)}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button className="btn" onClick={() => void handleAddPath()}>Add</button>
                    </div>
                    {addError && <p className="settings-error">{addError}</p>}
                </div>
            </section>
        </div>
    );
}

export default SettingsPage;
