const UnifiedLLMProvider = require( "./main" );
require( "dotenv" ).config();
const providers = [
	{
	  name: "openai",
	  apiKey: process.env.OPENAI_API_KEY,
	  model: "gpt-4.1-mini-2025-04-14"
	},
	{
	  name: "google",
	  apiKey: process.env.GOOGLE_API_KEY,
	  model: "gemini-2.5-pro"
	},
	{
		name: "google",
		apiKey: process.env.GOOGLE_API_KEY,
		model: "gemini-2.5-flash"
	 },
	{
	  name: "grok",
	  apiKey: process.env.GROK_API_KEY,
	  model: "grok-beta"
	},
	{
	  name: "openrouter",
	  apiKey: process.env.OPENROUTER_API_KEY,
	  model: "openrouter/gpt-3.5-turbo"
	},
	{
	  name: "z.ai",
	  apiKey: process.env.ZAI_API_KEY,
	  model: "zai-gpt-4"
	}
];

const llm = new UnifiedLLMProvider( providers );

async function getResponse ()
{
	try
	{
	  const messages = [
		 { role: "system", content: "You are a helpful assistant." },
		 { role: "user", content: "Explain quantum computing in simple terms." }
	  ];

	  const response = await llm.chatCompletion( messages, {
		 temperature: 0.7,
		 maxTokens: 500
	  });

	  console.log( "Response:", response );
	}
	catch ( error )
	{
	  console.error( "All providers failed:", error.message );
	}
}

getResponse();