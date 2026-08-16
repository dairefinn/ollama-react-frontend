import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { OllamaMessage } from "../../models/ollama-message.model";
import './ChatMessage.css';
import { useState } from "react";
import { ArrowClockwise, CaretDown, CaretRight, Copy, Info, Rewind } from "@phosphor-icons/react";
import { getToolLabel } from "../../tools/built-in-tools";

export type ChatMessageEventType = 'retry' | 'revert';

interface ChatMessageProps {
    message: OllamaMessage;
    toolResults?: string[];
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

function ChatMessage({ message, toolResults, onEvent, isLatest }: ChatMessageProps) {
    const [viewingContext, setViewingContext] = useState(false);
    const [systemExpanded, setSystemExpanded] = useState(false);
    const [messageContextExpanded, setMessageContextExpanded] = useState(false);
    const [toolCallsExpanded, setToolCallsExpanded] = useState(false);
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
        <div className={`chat-message chat-message-${message.role}${message.tool_calls?.length ? ' chat-message--tool-call' : ''}`} >
            <div className="chat-message-content">
                {/* TODO: Figure out how to improve word wrapping here for long strings */}
                <Markdown remarkPlugins={[remarkGfm]}>{messageParsed}</Markdown>
                {thinkContext && thinkContext.length > 2 && (
                    <>
                        <div className='toggle-think-context' onClick={toggleViewingContext}>Toggle thinking context</div>
                        {viewingContext && <div className="think-content">{thinkContext}</div>}
                    </>
                )}
                {message.tool_calls?.length && (
                    <>
                        <div className='toggle-tool-calls' onClick={() => setToolCallsExpanded(!toolCallsExpanded)}>
                            {toolCallsExpanded ? <CaretDown size={10} /> : <CaretRight size={10} />}
                            {message.tool_calls.map(tc => getToolLabel(tc.function.name, tc.function.arguments)).join(', ')}
                        </div>
                        {toolCallsExpanded && (
                            <div className="tool-calls-content">
                                {message.tool_calls.map((tc, i) => (
                                    <div key={i} className="tool-call-entry">
                                        <pre className="tool-call-args">{JSON.stringify(tc.function.arguments, null, 2)}</pre>
                                        {toolResults?.[i] && <pre className="tool-call-result">{toolResults[i]}</pre>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {message.role === 'assistant' && !message.tool_calls?.length && (
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
