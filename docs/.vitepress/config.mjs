import { defineConfig } from "vitepress"

export default defineConfig({
	base: "/Unified-AI-Router/",
	server: {
   	host: true,
	},
	title: "Unified AI Router",
	description: "OpenAI-compatible router with multi-provider fallback, supporting both Chat Completions and Responses API.",
	head: [
		["link", { rel: "icon", href: "favicon.png" }],
		["link", { rel: "icon", type: "image/png", href: "favicon.png" }],
		["link", { rel: "apple-touch-icon", href: "favicon.png" }]
	 ],
	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Quickstart", link: "/quickstart" },
			{ text: "Configuration", link: "/configuration" },
			{ text: "SDK Usage", link: "/sdk-usage" },
			{ text: "API Examples", link: "/api-examples" },
			{ text: "Providers", link: "/providers" },
			{ text: "Testing", link: "/testing" },
			{ text: "Deployment", link: "/deployment" }
		],
		sidebar: [
			{
				text: "Getting Started",
				items: [
					{ text: "Quickstart", link: "/quickstart" },
					{ text: "Configuration", link: "/configuration" }
				]
			},
			{
				text: "Usage",
				items: [
					{ text: "SDK Usage", link: "/sdk-usage" },
					{ text: "API Examples", link: "/api-examples" },
					{ text: "Providers", link: "/providers" }
				]
			},
			{
				text: "Testing & Deployment",
				items: [
					{ text: "Testing Guide", link: "/testing" },
					{ text: "Deployment Guide", link: "/deployment" }
				]
			}
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/mlibre/Unified-AI-Router" },
			{ icon: "npm", link: "https://www.npmjs.com/package/unified-ai-router" }

		]
	}
})
