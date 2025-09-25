const AIRouter = require( "../main" );
const { tool } = require( "langchain" );
const z = require( "zod" );
require( "dotenv" ).config({ quiet: true });

const providers = require( "../provider" )
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
async function main ()
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

		const toolResults = [];
		if ( response.tool_calls && response.tool_calls.length > 0 )
		{
			for ( const toolCall of response.tool_calls )
			{
				let selectedTool;
				if ( toolCall.name === "multiply" )
				{
					selectedTool = multiplyTool;
				}
				else if ( toolCall.name === "get_weather" )
				{
					selectedTool = weatherTool;
				}

				if ( selectedTool )
				{
					try
					{
						const result = await selectedTool.call( toolCall.args );
						console.log( `Tool "${toolCall.name}" executed with result:`, result );
						toolResults.push({
							tool_call_id: toolCall.id,
							content: JSON.stringify( result )
						});
					}
					catch ( toolError )
					{
						console.error( `Error executing tool "${toolCall.name}":`, toolError.message );
						toolResults.push({
							tool_call_id: toolCall.id,
							content: `Error: ${toolError.message}`
						});
					}
				}
				else
				{
					console.warn( `Unknown tool: ${toolCall.name}` );
				}
			}

			if ( toolResults.length > 0 )
			{
				const updatedMessages = [
					...messages,
					{
						role: "assistant",
						content: response.content,
						tool_calls: response.tool_calls
					},
					...toolResults.map( tr =>
					{
						return {
							role: "tool",
							content: tr.content,
							tool_call_id: tr.tool_call_id
						}
					})
				];
				const finalResponse = await llm.chatCompletion( updatedMessages, {
					temperature: 0,
					tools: [multiplyTool, weatherTool]
				});
				console.log( "Final response after tool execution:", finalResponse.content || finalResponse );
			}
		}
	}
	catch ( error )
	{
		console.error( "Tool example failed:", error.message );
	}
}

main();