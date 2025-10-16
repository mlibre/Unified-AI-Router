import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
	base: "/Unified-AI-Router/",
	title: "Lite OpenAI Compatible Server",
	description: "The OpenAI-compatible server provides a drop-in replacement for the OpenAI API. It routes requests through the unified router with fallback logic, ensuring high availability. ",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/markdown-examples" }
		],

		sidebar: [
			{
				text: "Examples",
				items: [
					{ text: "Markdown Examples", link: "/markdown-examples" },
					{ text: "Runtime API Examples", link: "/api-examples" }
				]
			}
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/mlibre/Unified-AI-Router" }
		]
	}
})
