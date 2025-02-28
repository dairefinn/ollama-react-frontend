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
    return (
        <div className='container-conversation'>
            <div className='area-conversation-messages'>
            {
                conversation.messages.map((message, index) => {
                return (
                    <ChatMessage key={index} message={message} onEvent={onEvent ? (type) => onEvent(index, type) : undefined} isLatest={index === conversation.messages.length - 1} />
                )
                })
            }
            {
                loading && <Loading />
            }
            </div>
        </div>
    )
}

export default Conversation;
