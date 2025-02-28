import Markdown from "react-markdown";
import { OllamaMessage } from "../../models/ollama-message.model";
import './ChatMessage.css';
import { useState } from "react";

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
    const [messageParsed, thinkContext] = extractThinkContent(message.content);

    function toggleViewingContext() {
        setViewingContext(!viewingContext);
    }

    const renderAuthor = () => {
        switch (message.role) {
            case 'user':
                return <strong>You</strong>;
            case 'system':
                return <strong>System</strong>;
            case 'assistant':
                return <strong>Assistant</strong>;
            case 'tool':
                return <strong>Tool</strong>;
            default:
                return <strong>Unknown</strong>;
        }
    };

    return (
        <div className={`chat-message chat-message-${message.role}`} >
            <div className='chat-message-author'>
                {/* TODO: This will probably be a picture in future but for now it's just text */}
                {renderAuthor()}
            </div>
            <div className="chat-message-content">
                {/* TODO: Figure out how to improve word wrapping here for long strings */}
                <Markdown>{messageParsed}</Markdown>
                {thinkContext && thinkContext.length > 2 && (
                    <>
                        <div className='toggle-think-context' onClick={toggleViewingContext}>Toggle thinking context</div>
                        {viewingContext && <div className="think-content">{thinkContext}</div>}
                    </>
                )}
            </div>
            {onEvent !== undefined && (
                <div className="chat-message-actions">
                    {message.role === 'assistant' && !isLatest && <button onClick={() => onEvent('revert')}>Rewind to this message</button>}
                    {message.role === 'assistant' && isLatest && <button onClick={() => onEvent('retry')}>Generate again</button>}
                </div>
            )}
        </div>
    );
}

export default ChatMessage;
