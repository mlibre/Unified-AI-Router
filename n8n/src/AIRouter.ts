const AIRouter = require('../../main.js');

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