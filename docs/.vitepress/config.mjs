import { defineConfig } from "vitepress"

export default defineConfig({
	base: "/Unified-AI-Router/",
	title: "Unified AI Router",
	description: "OpenAI-compatible router with multi-provider fallback.",
	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Quickstart", link: "/quickstart" },
			{ text: "Configuration", link: "/configuration" }
		],
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Quickstart", link: "/quickstart" },
					{ text: "Configuration", link: "/configuration" }
				]
			}
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/mlibre/Unified-AI-Router" }
		]
	}
})