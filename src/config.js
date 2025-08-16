require( "dotenv" ).config();

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
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
		name: "openai",
		apiKey: process.env.OPENAI_API_KEY,
		model: "gpt-4.1-mini-2025-04-14"
	},
	{
		name: "grok",
		apiKey: process.env.GROK_API_KEY,
		model: "grok-3-mini"
	}
];

module.exports = {
	productionUrl,
	webhookPath,
	token,
	providers
};