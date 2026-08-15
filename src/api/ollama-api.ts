import { queryPostChatStream } from "./queries/post-chat-stream.query";
import { queryPostChat } from "./queries/post-chat.query";
import { queryPostGenerateStream } from "./queries/post-generate-stream.query";
import { queryPostGenerate } from "./queries/post-generate.query";
import { queryGetModels } from "./queries/get-models.query";

const BASE_URL: string = "http://localhost:11434";

export const OllamaAPI = {

    models: queryGetModels(BASE_URL),
    generate: queryPostGenerate(BASE_URL),
    chat: queryPostChat(BASE_URL),
    generateStream: queryPostGenerateStream(BASE_URL),
    chatStream: queryPostChatStream(BASE_URL)

}
