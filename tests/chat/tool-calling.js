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
		function: {
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
				additionalProperties: false,
			},
			strict: true,
		},
	},
	{
		type: "function",
		function: {
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
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

const toolMap = {
	multiply,
	get_weather: getWeather,
};

async function executeTool ( toolCall )
{
	const toolFn = toolMap[toolCall.function.name];
	if ( !toolFn )
	{
		throw new Error( `Unknown tool: ${toolCall.function.name}` );
	}

	let result;
	try
	{
		const args = JSON.parse( toolCall.function.arguments );
		result = await toolFn( args );
		console.log( `Tool "${toolCall.function.name}" executed with result:`, result );
	}
	catch ( toolError )
	{
		console.error( `Error executing tool "${toolCall.function.name}":`, toolError.message );
		result = `Error: ${toolError.message}`;
	}

	return {
		tool_call_id: toolCall.id,
		content: typeof result === "object" ? JSON.stringify( result ) : result,
		name: toolCall.function.name
	};
}
async function main ()
{
	try
	{
		const messages = [
			{ role: "system", content: "You are a helpful assistant with access to tools for calculations and weather forecasts. Use the multiply tool for calculations, the get_weather tool for weather information." },
			{ role: "user", content: "how is weather in tehran today and what 1099*45?" }
		];

		const response = await llm.chatCompletion( messages, {
			temperature: 0,
			tools,
		});

		console.log( "weather tool example response:", response );

		const toolResults = [];
		if ( response.tool_calls && response.tool_calls.length > 0 )
		{
			for ( const toolCall of response.tool_calls )
			{
				const toolResult = await executeTool( toolCall );
				toolResults.push( toolResult );
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
							tool_call_id: tr.tool_call_id,
							name: tr.name
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