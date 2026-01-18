# Ollama React front-end

<img width="600" alt="image" src="https://github.com/user-attachments/assets/b76a06ee-be14-4140-b96e-06b091548b08" />

A basic react front-end which lets you interact with locally hosted LLMs using Ollama.

## Setup

- Install [Node.js](https://nodejs.org/en/) to run the front-end
- Run `yarn install` or `npm install` in the root directory to install the dependencies for this project
- Install [Ollama](https://github.com/ollama/ollama) to run LLMs locally
- This project cannot force Ollama to install models for you so you will have to run `ollama pull <<MODEL_NAME>>` to download the ones you want to use. You only need to do this the first time you use a model.

## Supported models

The selection is only limited because I haven't added a way to type a model name yet :) - in future it should support the [full library](https://ollama.com/library).

These are the ones I've added presets for:
- deepseek-r1
- llama3.3
- phi4
- gemma2
- mistral
- moondream
- neural-chat
- starling-lm
- codellama
- llama2-uncensored
- llava
- solar

## Usage

Run `yarn dev` or `npm run dev` in the project root to start the React front-end at [http://localhost:5173/](http://localhost:5173/)

Any API calls will automatically start the model if it's not already running, you just have to make sure that Ollama is running. To do this, type `ollama serve` in the terminal or set it to run as a service in the background.

## Features

### Query

Type in a prompt and click submit to send a request to the LLM. The LLM will generate a response and display it on the page. Only one prompt and response will be displayed at a time.

### Chat

Type in a message and click submit to send a request to the LLM. The LLM will generate a response and display it on the page. The conversation history will be displayed on the page.

You have the option to regenerate the latest response by the LLM or to revert the conversation back to a previous point.

### State persistence

Conversation history can be exported to a JSON file and re-imported to restore the conversation. There is also the option to clear the conversation history.

The most recent conversation and model usd will be stored in your browser storage so they can be remembered between uses.
