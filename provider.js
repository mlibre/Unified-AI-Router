module.exports = [
	{
		name: "gemini_pro",
		apiKey: [
			process.env.GEMINI_API_KEY,
			process.env.GEMINI_API_KEY_2,
			process.env.GEMINI_API_KEY_3,
			process.env.GEMINI_API_KEY_4,
		],
		model: "gemini-2.5-pro",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "cerebras",
		apiKey: [
			process.env.CEREBRAS_API_KEY,
			process.env.CEREBRAS_API_KEY_2,
		],
		model: "gpt-oss-120b",
		apiUrl: "https://api.cerebras.ai/v1",
	},
	{
		name: "openrouter_qwen",
		apiKey: [
			process.env.OPENROUTER_API_KEY,
			process.env.OPENROUTER_API_KEY_2,
			process.env.OPENROUTER_API_KEY_3,
			process.env.OPENROUTER_API_KEY_4,
			process.env.OPENROUTER_API_KEY_5,
			process.env.OPENROUTER_API_KEY_6
		],
		model: "qwen/qwen3-coder:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "openrouter_glm",
		apiKey: [
			process.env.OPENROUTER_API_KEY,
			process.env.OPENROUTER_API_KEY_2,
			process.env.OPENROUTER_API_KEY_3,
			process.env.OPENROUTER_API_KEY_4,
			process.env.OPENROUTER_API_KEY_5,
			process.env.OPENROUTER_API_KEY_6
		],
		model: "z-ai/glm-4.5-air:free",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		name: "qroq",
		apiKey: [
			process.env.QROQ_API_KEY,
			process.env.QROQ_API_KEY_2
		],
		model: "openai/gpt-oss-120b",
		apiUrl: "https://api.groq.com/openai/v1",
	},
	{
		name: "gemini_flash",
		apiKey: [
			process.env.GEMINI_API_KEY,
			process.env.GEMINI_API_KEY_2,
			process.env.GEMINI_API_KEY_3,
			process.env.GEMINI_API_KEY_4,
		],
		model: "gemini-2.5-flash",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	{
		name: "z.ai",
		apiKey: [
			process.env.ZAI_API_KEY,
			process.env.ZAI_API_KEY_2
		],
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