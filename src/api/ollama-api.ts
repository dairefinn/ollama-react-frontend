import { queryPostChatStream } from "./queries/post-chat-stream.query";
import { queryPostChat } from "./queries/post-chat.query";
import { queryPostGenerateStream } from "./queries/post-generate-stream.query";
import { queryPostGenerate } from "./queries/post-generate.query";

const BASE_URL: string = "http://localhost:11434";

export const OllamaAPI = {

    generate: queryPostGenerate(BASE_URL),
    chat: queryPostChat(BASE_URL),
    generateStream: queryPostGenerateStream(BASE_URL),
    chatStream: queryPostChatStream(BASE_URL)

}
