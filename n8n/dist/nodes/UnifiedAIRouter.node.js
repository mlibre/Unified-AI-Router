"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedAIRouter = void 0;
const AIRouter_1 = require("../AIRouter");
class UnifiedAIRouter {
    constructor() {
        this.description = {
            displayName: 'Unified AI Router',
            name: 'unifiedAIRouter',
            icon: 'file:unifiedai.svg',
            group: ['transform'],
            version: 1,
            description: 'Unified interface for multiple LLM providers with automatic fallback',
            defaults: {
                name: 'Unified AI Router',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Providers',
                    name: 'providers',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    default: {},
                    description: 'List of AI providers to try',
                    options: [
                        {
                            name: 'provider',
                            displayName: 'Provider',
                            values: [
                                {
                                    displayName: 'Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Provider name',
                                },
                                {
                                    displayName: 'API Key',
                                    name: 'apiKey',
                                    type: 'string',
                                    typeOptions: {
                                        password: true,
                                    },
                                    default: '',
                                    description: 'API key for the provider',
                                },
                                {
                                    displayName: 'Model',
                                    name: 'model',
                                    type: 'string',
                                    default: '',
                                    description: 'Model to use',
                                },
                                {
                                    displayName: 'API URL',
                                    name: 'apiUrl',
                                    type: 'string',
                                    default: '',
                                    description: 'Base URL for the API',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Messages',
                    name: 'messages',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    default: {},
                    description: 'The messages to send',
                    options: [
                        {
                            name: 'message',
                            displayName: 'Message',
                            values: [
                                {
                                    displayName: 'Role',
                                    name: 'role',
                                    type: 'options',
                                    options: [
                                        { name: 'System', value: 'system' },
                                        { name: 'User', value: 'user' },
                                        { name: 'Assistant', value: 'assistant' },
                                    ],
                                    default: 'user',
                                    description: 'Role of the message',
                                },
                                {
                                    displayName: 'Content',
                                    name: 'content',
                                    type: 'string',
                                    default: '',
                                    description: 'Content of the message',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    default: {},
                    description: 'Additional options',
                    options: [
                        {
                            displayName: 'Stream',
                            name: 'stream',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to stream the response',
                        },
                        {
                            displayName: 'Temperature',
                            name: 'temperature',
                            type: 'number',
                            default: 1,
                            description: 'Temperature for generation',
                        },
                        {
                            displayName: 'Max Tokens',
                            name: 'max_tokens',
                            type: 'number',
                            default: null,
                            description: 'Maximum number of tokens to generate',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const providersInput = this.getNodeParameter('providers', 0);
        const providerList = providersInput.provider || [];
        const messagesInput = this.getNodeParameter('messages', 0);
        const messageList = messagesInput.message || [];
        const options = this.getNodeParameter('options', 0);
        const aiRouter = new AIRouter_1.AIRouter(providerList);
        const response = await aiRouter.chatCompletion(messageList, options);
        return [[{ json: response }]];
    }
}
exports.UnifiedAIRouter = UnifiedAIRouter;
