import { queryPostChat } from "./queries/post-chat.query";
import { queryPostGenerate } from "./queries/post-generate.query";

const BASE_URL: string = "http://localhost:11434";

export const OllamaAPIHandler = {

    generate: queryPostGenerate(BASE_URL),
    chat: queryPostChat(BASE_URL),

}

export default OllamaAPIHandler;
