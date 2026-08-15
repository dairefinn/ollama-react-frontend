import './Conversation.css';

import { JSX } from "react";
import { OllamaConversation } from "../../models/ollama-conversation.model";
import ChatMessage, { ChatMessageEventType } from "../ChatMessage/ChatMessage";
import Loading from "../Loading/Loading";

export type ConversationEventType = ChatMessageEventType;

interface ConversationProps {
    conversation: OllamaConversation;
    loading: boolean;
    onEvent?: (index: number, event: ConversationEventType) => void;
}

function Conversation({ conversation, loading, onEvent }: ConversationProps): JSX.Element {
    // Group each assistant+tool_calls message with its following tool result messages
    const renderList: { messageIndex: number; toolResults?: string[] }[] = [];

    let i = 0;
    while (i < conversation.messages.length) {
        const message = conversation.messages[i];
        if (message.role === 'tool') {
            i++;
            continue;
        }
        if (message.role === 'assistant' && message.tool_calls?.length) {
            const toolResults: string[] = [];
            let j = i + 1;
            while (j < conversation.messages.length && conversation.messages[j].role === 'tool') {
                toolResults.push(conversation.messages[j].content);
                j++;
            }
            renderList.push({ messageIndex: i, toolResults });
            i = j;
        } else {
            renderList.push({ messageIndex: i });
            i++;
        }
    }

    return (
        <div className='container-conversation'>
            <div className='area-conversation-messages'>
            {renderList.map(({ messageIndex, toolResults }, renderIndex) => {
                const message = conversation.messages[messageIndex];
                return (
                    <ChatMessage
                        key={messageIndex}
                        message={message}
                        toolResults={toolResults}
                        onEvent={onEvent ? (type) => onEvent(messageIndex, type) : undefined}
                        isLatest={renderIndex === renderList.length - 1}
                    />
                );
            })}
            {loading && <Loading />}
            </div>
        </div>
    );
}

export default Conversation;
