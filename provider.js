module.exports = [
	{
		name: "gemini_1",
		apiKey: process.env.GEMINI_API_KEY,
		model: "gemini-2.5-pro",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "gemini_2",
		apiKey: process.env.GEMINI_API_KEY_2,
		model: "gemini-2.5-pro",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "gemini_3",
		apiKey: process.env.GEMINI_API_KEY_3,
		model: "gemini-2.5-pro",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "cerebras_2",
		apiKey: process.env.CEREBRAS_API_KEY_2,
		model: "gpt-oss-120b",
		apiUrl: "https://api.cerebras.ai/v1",
	},
	{
		name: "cerebras",
		apiKey: process.env.CEREBRAS_API_KEY,
		model: "gpt-oss-120b",
		apiUrl: "https://api.cerebras.ai/v1",
	},
	{
		name: "openrouter_2",
		apiKey: process.env.OPENROUTER_API_KEY_2,
		model: "z-ai/glm-4.5-air:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "qroq",
		apiKey: process.env.QROQ_API_KEY,
		model: "openai/gpt-oss-120b",
		apiUrl: "https://api.groq.com/openai/v1",
	},
	{
		name: "openrouter_2",
		apiKey: process.env.OPENROUTER_API_KEY_2,
		model: "qwen/qwen3-coder:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "openrouter_3",
		apiKey: process.env.OPENROUTER_API_KEY_3,
		model: "z-ai/glm-4.5-air:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "gemini_1",
		apiKey: process.env.GEMINI_API_KEY,
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
		name: "llm7", // does not support tool calling
		apiKey: process.env.LLM7_API_KEY,
		model: "gpt-o4-mini-2025-04-16",
		apiUrl: "https://api.llm7.io/v1",
	},
];