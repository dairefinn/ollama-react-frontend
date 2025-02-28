import './Conversation.css';

import { JSX } from "react";
import { OllamaConversation } from "../../models/ollama-conversation.model";
import ChatMessage from "../ChatMessage/ChatMessage";
import Loading from "../Loading/Loading";

interface ConversationProps {
    conversation: OllamaConversation;
    loading: boolean;
}

function Conversation({ conversation, loading }: ConversationProps): JSX.Element {
    return (
        <div className='container-conversation'>
            <div className='area-conversation-messages'>
            {
                conversation.messages.map((message, index) => {
                return (
                    <ChatMessage key={index} message={message} />
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
