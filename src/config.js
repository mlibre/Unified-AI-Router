require( "dotenv" ).config();

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const webhookPath = "/api";

const token = process.env.TELEGRAM_BOT_TOKEN;
if ( !token )
{
	throw new Error( "TELEGRAM_BOT_TOKEN is required" );
}

// Define AI providers
const providers = [
	{
		name: "OpenAI",
		apiKey: process.env.OPENAI_API_KEY,
		model: "gpt-3.5-turbo"
	},
	{
		name: "Google",
		apiKey: process.env.GOOGLE_API_KEY,
		model: "gemini-pro"
	},
	// Add other providers here as needed
];

module.exports = {
	productionUrl,
	webhookPath,
	token,
	providers
};