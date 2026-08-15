# Ollama React front-end

<img width="1262" height="1179" alt="image" src="https://github.com/user-attachments/assets/3ede87c5-f8c1-4650-be54-3902bbb0cd5b" />

A tool for interacting with locally hosted LLMs running on Ollama.

## Setup

- Install [Node.js](https://nodejs.org/en/) to run the front-end
- Run `yarn install` or `npm install` in the root directory to install the dependencies for this project
- Install [Ollama](https://github.com/ollama/ollama) to run LLMs locally
- This project cannot force Ollama to install models for you so you will have to run `ollama pull <<MODEL_NAME>>` to download the ones you want to use. You only need to do this the first time you use a model.
- The model selector should automatically find any models you have installed

## Usage

Run `yarn dev` or `npm run dev` in the project root to start the React front-end at [http://localhost:5173/](http://localhost:5173/)

## Requirements

- Ollama should be running already.

## Features

### Chat

Type in a message and click submit to send a request to the LLM. The LLM will generate a response and display it on the page. The conversation history will be displayed on the page.

You have the option to regenerate the latest response by the LLM or to revert the conversation back to a previous point.

### State persistence

Conversation history can be exported to a JSON file and re-imported to restore the conversation. There is also the option to clear the conversation history.

The most recent conversation and model used will be stored in your browser storage so they can be remembered between uses.

### Context control

You can configure context to be sent alongside the first message to a chat.

You can also configure context to be sent alongside each message. The current timestamp will be sent by default.

### Tools

The chat has the ability to call tools. Currently there are some built in tools for interacting with it's memory.

### Memory

The agent can use some built-in tools to read and write memories.
