const AIRouter = require( "../main" );
require( "dotenv" ).config({ quiet: true });

const providers = require( "../provider" )
const llm = new AIRouter( providers );

// Tool functions
async function multiply ({ a, b })
{
	return {
		result: a * b,
	}
}

async function getWeather ({ city })
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
}

const tools = [
	{
		type: "function",
		name: "multiply",
		description: "Multiply two numbers",
		parameters: {
			type: "object",
			properties: {
				a: {
					type: "number",
					description: "First number"
				},
				b: {
					type: "number",
					description: "Second number"
				},
			},
			required: ["a", "b"],
		},
	},
	{
		type: "function",
		name: "get_weather",
		description: "Get the current weather forecast for a given city.",
		parameters: {
			type: "object",
			properties: {
				city: {
					type: "string",
					description: "The name of the city (e.g., Tehran) to get the weather for."
				}
			},
			required: ["city"],
		},
	},
];

async function main ()
{
	try
	{
		const messages = [
			{ role: "system", content: "You are a helpful assistant with access to tools for calculations, weather forecasts, and horoscopes. Use the multiply tool for calculations, the get_weather tool for weather information, and the get_horoscope tool for horoscopes." },
			{ role: "user", content: "What's the horoscope for Taurus today?" }
		];

		const response = await llm.chatCompletion( messages, {
			temperature: 0,
			tools,
		});

		console.log( "Horoscope tool example response:", response );

		const toolResults = [];
		if ( response.tool_calls && response.tool_calls.length > 0 )
		{
			for ( const toolCall of response.tool_calls )
			{
				let result;
				try
				{
					if ( toolCall.name === "multiply" )
					{
						result = await multiply( toolCall.args );
					}
					else if ( toolCall.name === "get_weather" )
					{
						result = await getWeather( toolCall.args );
					}
					else
					{
						throw new Error( `Unknown tool: ${toolCall.name}` );
					}

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
					tools
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