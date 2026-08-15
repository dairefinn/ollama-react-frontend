# Ollama React front-end

<img width="2241" height="1064" alt="image" src="https://github.com/user-attachments/assets/6ff82c93-e6b0-4b00-951d-a22c4e730540" />

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
