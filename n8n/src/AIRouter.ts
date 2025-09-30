const AIRouter = require('unified-ai-router');

export interface Provider {
  name: string;
  apiKey: string;
  model: string;
  apiUrl: string;
}

export interface Message {
  role: string;
  content: string;
}

export { AIRouter };