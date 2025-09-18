const AIRouter = require( "./main" );
require( "dotenv" ).config();

const providers = [
	{
		name: "grok",
		apiKey: process.env.GROK_API_KEY,
		model: "grok-3-mini"
	},
	{
		name: "llm7",
		apiKey: process.env.LLM7_API_KEY,
		model: "gpt-o4-mini-2025-04-16"
	},
	{
		name: "cerebras",
		apiKey: process.env.CEREBRAS_API_KEY,
		model: "gpt-oss-120b"
	},
	{
		name: "vercel",
		apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
		model: "openai/gpt-oss-120b"
	},
	{
		name: "cohere",
		apiKey: process.env.COHERE_API_KEY,
		model: "command-a-03-2025"
	},
	{
		name: "qroq",
		apiKey: process.env.QROQ_API_KEY,
		model: "openai/gpt-oss-120b"
	},
	{
		name: "openrouter",
		apiKey: process.env.OPENROUTER_API_KEY,
		model: "z-ai/glm-4.5-air:free"
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
		name: "z.ai",
		apiKey: process.env.ZAI_API_KEY,
		model: "glm-4.5-flash"
	},
	{
		name: "openai",
		apiKey: process.env.OPENAI_API_KEY,
		model: "gpt-4.1-mini-2025-04-14"
	},

];

const llm = new AIRouter( providers );

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
		});

		console.log( "Response:", response );
	}
	catch ( error )
	{
		console.error( "All providers failed:", error.message );
	}
}

getResponse();