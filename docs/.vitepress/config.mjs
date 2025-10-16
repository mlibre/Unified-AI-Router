import { defineConfig } from "vitepress"

export default defineConfig({
	base: "/Unified-AI-Router/",
	title: "Unified AI Router",
	description: "OpenAI-compatible router with multi-provider fallback.",
	head: [
		["link", { rel: "icon", href: "favicon.png" }],
		["link", { rel: "icon", type: "image/png", href: "favicon.png" }],
		["link", { rel: "apple-touch-icon", href: "favicon.png" }]
	 ],
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
