# Ollama React front-end

A basic react front-end which lets you interact with locally hosted LLMs using Ollama.

## Setup

- Install [Ollama](https://github.com/ollama/ollama) to run LLMs locally
- Install *deepseek-r1* using `ollama run deepseek-r1`, it's the only LLM I've added support for so far. You can use `/bye` to end the initial conversation it opens
- Run `npm install` to install the dependencies for this project
- Run `npm run dev` to start the React front-end at [http://localhost:5173/](http://localhost:5173/)

Any API calls will automatically start the model if it's not already running, you just have to make sure that Ollama is running.

The generate and chat APIs are currently hardcoded so if you want to change between the endpoints, `src/App.tsx` will need to be modified. It probably just make sense to use the chat API anyways as it's mostly the same AND supports conversation history.

## Usage

Type in a search query and click submit to send a request to the LLM. The results will be displayed on the page.

# Potential future features

- Try some other LLMs, maybe allow switching between them
- Implement support for streaming responses so that the user can see the response as it's being generated
