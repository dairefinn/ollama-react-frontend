# Ollama React front-end

A basic react front-end which lets you interact with locally hosted LLMs using Ollama.

## Setup

- Install [Ollama](https://github.com/ollama/ollama) to run LLMs locally
- Install [Node.js](https://nodejs.org/en/) to run the front-end
- Install *deepseek-r1* using `ollama run deepseek-r1`, it's the only LLM I've added support for so far. You can use `/bye` to end the initial conversation it opens
- Run `npm install` in the root directory to install the dependencies for this project

## Usage

Run `npm run dev` in the root directory to start the React front-end at [http://localhost:5173/](http://localhost:5173/)

Any API calls will automatically start the model if it's not already running, you just have to make sure that Ollama is running.

## Features

### Query

Type in a prompt and click submit to send a request to the LLM. The LLM will generate a response and display it on the page. Only one prompt and response will be displayed at a time.

### Chat

Type in a message and click submit to send a request to the LLM. The LLM will generate a response and display it on the page. The conversation history will be displayed on the page.

You have the option to regenerate the latest response by the LLM or to revert the conversation back to a previous point.

Conversation history can be exported to a JSON file and re-imported to restore the conversation. There is also the option to clear the conversation history.

## Other notes

The generate and chat APIs are currently hardcoded so if you want to change between the endpoints, `src/App.tsx` will need to be modified. It probably just make sense to use the chat API anyways as it's mostly the same AND supports conversation history.

## Potential future features

**Saving**
Store conversation history in a lightweight local db or file. The ability to export and import conversations are already there so writing to a file would be fairly easy.
