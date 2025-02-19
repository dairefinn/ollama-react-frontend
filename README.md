# Ollama React front-end

A basic react front-end which lets you interact with locally hosted LLMs using Ollama.

## Setup

- Install [Ollama](https://github.com/ollama/ollama) to run LLMs locally
- Install *deepseek-r1* using `ollama run deepseek-r1`, it's the only LLM I've added support for so far. You can use `/bye` to end the conversation
- Run `npm run dev` to start the React front-end at [http://localhost:5173/](http://localhost:5173/)

Any API calls will automatically start the model if it's not already running, you just have to make sure that Ollama is running.

## Usage

Type in a search query and click submit to send a request to the LLM. The results will be displayed on the page.

# Potential future features

- Try some other LLMs, maybe allow switching between them
- Implement the Ollama chat API (I think this one will remember the context of the conversation)
- Implement support for streaming responses so that the user can see the response as it's being generated
