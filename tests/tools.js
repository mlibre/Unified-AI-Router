const AIRouter = require( "../main" );
const { tool } = require( "langchain" );
const z = require( "zod" );
require( "dotenv" ).config();

const providers = [
	{
		name: "llm7",
		apiKey: process.env.LLM7_API_KEY,
		model: "gpt-o4-mini-2025-04-16",
		apiUrl: "https://api.llm7.io/v1",
	},
	{
		name: "cerebras",
		apiKey: process.env.CEREBRAS_API_KEY,
		model: "gpt-oss-120b",
		apiUrl: "https://api.cerebras.ai/v1",
	},
	{
		name: "vercel",
		apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
		model: "openai/gpt-oss-120b",
		apiUrl: "https://ai-gateway.vercel.sh/v1",
	},
	{
		name: "qroq",
		apiKey: process.env.QROQ_API_KEY,
		model: "openai/gpt-oss-120b",
		apiUrl: "https://api.groq.com/openai/v1",
	},
	{
		name: "openrouter",
		apiKey: process.env.OPENROUTER_API_KEY,
		model: "z-ai/glm-4.5-air:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "google",
		apiKey: process.env.GOOGLE_API_KEY,
		model: "gemini-2.5-pro",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "google",
		apiKey: process.env.GOOGLE_API_KEY,
		model: "gemini-2.5-flash",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "z.ai",
		apiKey: process.env.ZAI_API_KEY,
		model: "glm-4.5-flash",
		apiUrl: "https://api.z.ai/api/paas/v4",
	},
	{
		name: "openai",
		apiKey: process.env.OPENAI_API_KEY,
		model: "gpt-4.1-mini-2025-04-14",
		apiUrl: "https://api.openai.com/v1",
	},
	{
		name: "cohere",
		apiKey: process.env.COHERE_API_KEY,
		model: "command-a-03-2025",
		apiUrl: "https://api.cohere.ai/compatibility/v1",
	},
	{
		name: "grok",
		apiKey: process.env.GROK_API_KEY,
		model: "grok-3-mini",
		apiUrl: "https://api.x.ai/v1",
	},
];

const llm = new AIRouter( providers );

// Example tool: Multiply two numbers
const multiplyTool = tool(
	async ({ a, b }) =>
	{
		return {
			result: a * b,
		}
	},
	{
		name: "multiply",
		description: "Multiply two numbers",
		schema: z.object({
			a: z.number().describe( "First number" ),
			b: z.number().describe( "Second number" ),
		}),
	}
);

const weatherTool = tool(
	async ({ city }) =>
	{
		// Mock weather data for demonstration
		const mockWeather = {
			city,
			temperature: 25,
			condition: "Sunny",
			humidity: 50,
			wind: "10 km/h"
		};
		return mockWeather;
	},
	{
		name: "get_weather",
		description: "Get the current weather forecast for a given city.",
		schema: z.object({
			city: z.string().describe( "The name of the city (e.g., Tehran) to get the weather for." )
		})
	}
);
void async function main ()
{
	try
	{
		const messages = [
			{ role: "system", content: "You are a helpful assistant with access to tools for calculations and weather forecasts. Use the multiply tool for calculations and the get_weather tool for weather information." },
			{ role: "user", content: "What's the weather like in Tehran today?" }
		];

		const response = await llm.chatCompletion( messages, {
			temperature: 0,
			tools: [multiplyTool, weatherTool],
		});

		console.log( "Weather tool example response:", response );
	}
	catch ( error )
	{
		console.error( "Tool example failed:", error.message );
	}
}()