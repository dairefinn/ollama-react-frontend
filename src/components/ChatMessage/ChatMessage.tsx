import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { OllamaMessage } from "../../models/ollama-message.model";
import './ChatMessage.css';
import { useState } from "react";
import { ArrowClockwise, CaretDown, CaretRight, Copy, Info, Rewind } from "@phosphor-icons/react";

export type ChatMessageEventType = 'retry' | 'revert';

interface ChatMessageProps {
    message: OllamaMessage;
    onEvent?: (event: ChatMessageEventType) => void;
    isLatest?: boolean;
}

function extractThinkContent(text: string): [string, string] {
    let [messageParsed, thinkContext] = ['', ''];

    const thinkTagRegex = /<think>(.*?)<\/think>/gs;
    const matches = text.match(thinkTagRegex);
    if (matches) {
        thinkContext = matches.map(match => match.replace(/<\/?think>/g, '')).join(' ');
    }

    messageParsed = text.replace(thinkTagRegex, '');
    
    return [messageParsed, thinkContext];
}

function ChatMessage({ message, onEvent, isLatest }: ChatMessageProps) {
    const [viewingContext, setViewingContext] = useState(false);
    const [systemExpanded, setSystemExpanded] = useState(false);
    const [messageContextExpanded, setMessageContextExpanded] = useState(false);
    const [messageParsed, thinkContext] = extractThinkContent(message.content);

    function toggleViewingContext() {
        setViewingContext(!viewingContext);
    }

    if (message.role === 'system') {
        return (
            <div className="chat-message chat-message-system">
                <div className="system-context-header" onClick={() => setSystemExpanded(!systemExpanded)}>
                    {systemExpanded ? <CaretDown size={10} /> : <CaretRight size={10} />}
                    <span>initial context</span>
                </div>
                {systemExpanded && (
                    <div className="system-context-body">
                        <pre>{message.content}</pre>
                    </div>
                )}
            </div>
        );
    }

    const renderAuthor = () => {
        switch (message.role) {
            case 'user':
                return <strong>You</strong>;
            case 'assistant':
                return <strong>Assistant</strong>;
            case 'tool':
                return <strong>Tool</strong>;
            default:
                return <strong>Unknown</strong>;
        }
    };

    if (message.role === 'user') {
        return (
            <div className="chat-message chat-message-user">
                <div className="user-bubble">
                    <div className="chat-message-content">
                        <Markdown remarkPlugins={[remarkGfm]}>{messageParsed}</Markdown>
                    </div>
                </div>
                {message.context && (
                    <div className={`message-context${messageContextExpanded ? ' message-context--open' : ''}`}>
                            {messageContextExpanded && (
                            <pre className="message-context-body">{message.context}</pre>
                        )}
                        <button
                            className="message-context-toggle"
                            title="Message context"
                            onClick={() => setMessageContextExpanded(!messageContextExpanded)}
                        >
                            <Info size={12} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`chat-message chat-message-${message.role}`} >
            {message.role !== 'user' && message.role !== 'assistant' && (
                <div className='chat-message-author'>
                    {renderAuthor()}
                </div>
            )}
            <div className="chat-message-content">
                {/* TODO: Figure out how to improve word wrapping here for long strings */}
                <Markdown remarkPlugins={[remarkGfm]}>{messageParsed}</Markdown>
                {thinkContext && thinkContext.length > 2 && (
                    <>
                        <div className='toggle-think-context' onClick={toggleViewingContext}>Toggle thinking context</div>
                        {viewingContext && <div className="think-content">{thinkContext}</div>}
                    </>
                )}
            </div>
            {message.role === 'assistant' && (
                <div className="chat-message-actions">
                    {onEvent !== undefined && !isLatest && <button className="chat-message-action-btn" title="Rewind to this message" onClick={() => onEvent('revert')}><Rewind size={14} /></button>}
                    {onEvent !== undefined && isLatest && <button className="chat-message-action-btn" title="Generate again" onClick={() => onEvent('retry')}><ArrowClockwise size={14} /></button>}
                    <button className="chat-message-action-btn" title="Copy markdown" onClick={() => navigator.clipboard.writeText(message.content)}><Copy size={14} /></button>
                </div>
            )}
        </div>
    );
}

export default ChatMessage;
