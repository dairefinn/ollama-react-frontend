import { JSX } from "react";
import { useSystemContext } from "../utils/use-system-context";
import { useMessageContext } from "../utils/use-message-context";

function SettingsPage(): JSX.Element {
    const [systemContext, setSystemContext] = useSystemContext();
    const [messageContext, setMessageContext] = useMessageContext();

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
        </div>
    );
}

export default SettingsPage;
