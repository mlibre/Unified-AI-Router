module.exports = [
	{
		name: "openrouter",
		apiKey: process.env.OPENROUTER_API_KEY,
		model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "openrouter",
		apiKey: process.env.OPENROUTER_API_KEY,
		model: "x-ai/grok-4-fast:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "cerebras",
		apiKey: process.env.CEREBRAS_API_KEY,
		model: "gpt-oss-120b",
		apiUrl: "https://api.cerebras.ai/v1",
	},
	{
		name: "openrouter",
		apiKey: process.env.OPENROUTER_API_KEY,
		model: "z-ai/glm-4.5-air:free",
		apiUrl: "https://openrouter.ai/api/v1",
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
	{
		name: "llm7", // does not support tool calling
		apiKey: process.env.LLM7_API_KEY,
		model: "gpt-o4-mini-2025-04-16",
		apiUrl: "https://api.llm7.io/v1",
	},
];