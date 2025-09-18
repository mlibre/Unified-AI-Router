require( "dotenv" ).config();

const productionUrl = `https://${ process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
const webhookPath = "/api";

const token = process.env.TELEGRAM_BOT_TOKEN;
if ( !token )
{
	throw new Error( "TELEGRAM_BOT_TOKEN is required" );
}

const providers = [
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
		name: "qroq",
		apiKey: process.env.QROQ_API_KEY,
		model: "openai/gpt-oss-120b"
	},
	{
		name: "vercel",
		apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
		model: "openai/gpt-oss-120b"
	},
	{
		name: "cerebras",
		apiKey: process.env.CEREBRAS_API_KEY,
		model: "gpt-oss-120b"
	},
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
		name: "cohere",
		apiKey: process.env.COHERE_API_KEY,
		model: "command-a-03-2025"
	},
];

module.exports = {
	productionUrl,
	webhookPath,
	token,
	providers
};