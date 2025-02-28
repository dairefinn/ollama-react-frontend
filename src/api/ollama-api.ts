import { queryPostChat } from "./queries/post-chat.query";
import { queryPostGenerate } from "./queries/post-generate.query";

export const OllamaAPIHandler = {

    BASE_URL: "http://localhost:11434",

    generate: queryPostGenerate,
    chat: queryPostChat,

}

export default OllamaAPIHandler;
