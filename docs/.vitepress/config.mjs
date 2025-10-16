import { defineConfig } from "vitepress"

export default defineConfig({
	base: "/Unified-AI-Router/",
	title: "Unified AI Router",
	description: "OpenAI-compatible router with multi-provider fallback.",
	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Quickstart", link: "/quickstart" },
			{ text: "Overview", link: "/overview" }
		],
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Quickstart", link: "/quickstart" },
					{ text: "Overview & API", link: "/overview" }
				]
			}
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/mlibre/Unified-AI-Router" }
		]
	}
})