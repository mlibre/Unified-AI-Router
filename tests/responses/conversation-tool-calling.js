const AIRouter = require( "../../main" );
require( "dotenv" ).config({ quiet: true });

const providers = require( "../../provider" );
const llm = new AIRouter( providers );

// Tool functions for the conversation
async function getWeather ({ city })
{
	// Mock weather data for demonstration
	const mockWeatherData = {
		"Tehran": { temperature: 22, condition: "Sunny", humidity: 45 },
		"Mashhad": { temperature: 18, condition: "Cloudy", humidity: 60 },
		"Isfahan": { temperature: 20, condition: "Partly cloudy", humidity: 50 },
		"Shiraz": { temperature: 25, condition: "Clear", humidity: 40 }
	};

	const weather = mockWeatherData[ city ] || {
		temperature: 20,
		condition: "Unknown",
		humidity: 50
	};

	return {
		city,
		...weather,
		forecast: `The weather in ${city} is ${weather.condition} with ${weather.temperature}°C and ${weather.humidity}% humidity.`
	};
}

async function calculateTip ({ amount, percentage })
{
	const tip = amount * percentage / 100;
	const total = amount + tip;

	return {
		originalAmount: amount,
		tipPercentage: percentage,
		tipAmount: tip.toFixed( 2 ),
		totalAmount: total.toFixed( 2 ),
		summary: `${percentage}% tip on $${amount} is $${tip.toFixed( 2 )}, total: $${total.toFixed( 2 )}`
	};
}

const tools = [
	{
		type: "function",
		name: "get_weather",
		description: "Get the current weather forecast for a given city",
		parameters: {
			type: "object",
			properties: {
				city: { type: "string", description: "The name of the city to get weather for" }
			},
			required: ["city"],
			additionalProperties: false
		},
		strict: true
	},
	{
		type: "function",
		name: "calculate_tip",
		description: "Calculate tip amount and total for a bill",
		parameters: {
			type: "object",
			properties: {
				amount: { type: "number", description: "The bill amount" },
				percentage: { type: "number", description: "Tip percentage (e.g., 15 for 15%)" }
			},
			required: ["amount", "percentage"],
			additionalProperties: false
		},
		strict: true
	}
];

const toolMap = {
	get_weather: getWeather,
	calculate_tip: calculateTip
};

// Execute tool calls according to official OpenAI documentation
async function executeTool ( toolCall )
{
	const toolFn = toolMap[ toolCall.name ];
	if ( !toolFn )
	{
		throw new Error( `Unknown tool: ${toolCall.name}` );
	}

	try
	{
		const args = JSON.parse( toolCall.arguments );
		const result = await toolFn( args );
		console.log( `✅ Tool "${toolCall.name}" executed:`, result );

		// Return in official OpenAI format for function_call_output
		return {
			call_id: toolCall.call_id,
			output: typeof result === "object" ? JSON.stringify( result ) : result.toString(),
			name: toolCall.name
		};
	}
	catch ( toolError )
	{
		console.error( `❌ Error executing tool "${toolCall.name}":`, toolError.message );
		return {
			call_id: toolCall.call_id,
			output: `Error: ${toolError.message}`,
			name: toolCall.name
		};
	}
}

// Main conversation test using responses API following official documentation
async function testConversationToolCalling ()
{
	console.log( "=== Starting Conversation-to-Tool-Calling Test (Responses API) ===" );

	try
	{
		// Turn 1: Initial request - user asks for help with calculations and weather
		console.log( "\n📝 Turn 1: Initial request for calculations and weather" );

		let input = [
			{
				role: "user",
				content: "Hi! I need help with a few things. First, what's 15% tip on a $85 bill? Also, what's the weather like in Tehran and Mashhad?"
			}
		];

		let response = await llm.responses( input, {
			temperature: 0.3,
			tools
		});

		console.log( "🤖 Assistant:", response.output_text || response.content );
		console.log( "Response ID:", response.id );

		// Handle tool calls if any - following official documentation
		const functionCalls = response.output.filter( item => { return item.type === "function_call" });

		if ( functionCalls.length > 0 )
		{
			console.log( `🔧 Executing ${functionCalls.length} tool call(s)...` );

			// Execute tool calls
			const toolResults = [];
			for ( const toolCall of functionCalls )
			{
				const toolResult = await executeTool( toolCall );
				toolResults.push( toolResult );
			}

			// Prepare input for next turn with tool results - using official format
			const inputWithTools = [
				...input,
				{
					role: "assistant",
					content: response.output_text || ""
				},
				// Add tool results in official format - NOT as role: "tool"
				...toolResults.map( tr =>
				{
					return {
						type: "function_call_output",
						call_id: tr.call_id,
						output: tr.output
					}
				})
			];

			// Get final response with tool results
			const finalResponse = await llm.responses( inputWithTools, {
				temperature: 0.3,
				tools
			});

			console.log( "🤖 Final Assistant:", finalResponse.output_text || finalResponse.content );

			// Update conversation with final response for next turn
			input = [
				...inputWithTools,
				{
					role: "assistant",
					content: finalResponse.output_text || finalResponse.content
				}
			];
		}
		else
		{
			// Update conversation with response
			input.push({
				role: "assistant",
				content: response.output_text || response.content
			});
		}

		// Turn 2: Follow-up question referencing previous context
		console.log( "\n📝 Turn 2: Follow-up question about calculations" );

		input.push({
			role: "user",
			content: "Thanks! Those calculations were helpful. Now, what if I wanted to calculate a 20% tip on the same $85 bill instead?"
		});

		response = await llm.responses( input, {
			temperature: 0.3,
			tools
		});

		console.log( "🤖 Assistant:", response.output_text || response.content );

		// Handle tool calls for turn 2
		const functionCalls2 = response.output.filter( item => { return item.type === "function_call" });

		if ( functionCalls2.length > 0 )
		{
			console.log( `🔧 Executing ${functionCalls2.length} tool call(s)...` );

			const toolResults = [];
			for ( const toolCall of functionCalls2 )
			{
				const toolResult = await executeTool( toolCall );
				toolResults.push( toolResult );
			}

			// Prepare input with tool results in official format
			const inputWithTools = [
				...input,
				{
					role: "assistant",
					content: response.output_text || ""
				},
				...toolResults.map( tr =>
				{
					return {
						type: "function_call_output",
						call_id: tr.call_id,
						output: tr.output
					}
				})
			];

			const finalResponse = await llm.responses( inputWithTools, {
				temperature: 0.3,
				tools
			});

			console.log( "🤖 Final Assistant:", finalResponse.output_text || finalResponse.content );

			// Update conversation with final response
			input = [
				...inputWithTools,
				{
					role: "assistant",
					content: finalResponse.output_text || finalResponse.content
				}
			];
		}
		else
		{
			input.push({
				role: "assistant",
				content: response.output_text || response.content
			});
		}

		// Turn 3: Another follow-up with different tools
		console.log( "\n📝 Turn 3: Weather comparison request" );

		input.push({
			role: "user",
			content: "Perfect! Now I'm planning to visit Isfahan next week. Can you compare the weather between Tehran and Isfahan? Also, what if I needed to split that $85 bill with 5 friends - how much would each person pay including the 20% tip?"
		});

		response = await llm.responses( input, {
			temperature: 0.3,
			tools
		});

		console.log( "🤖 Assistant:", response.output_text || response.content );

		// Handle tool calls for turn 3
		const functionCalls3 = response.output.filter( item => { return item.type === "function_call" });

		if ( functionCalls3.length > 0 )
		{
			console.log( `🔧 Executing ${functionCalls3.length} tool call(s)...` );

			const toolResults = [];
			for ( const toolCall of functionCalls3 )
			{
				const toolResult = await executeTool( toolCall );
				toolResults.push( toolResult );
			}

			// Prepare input with tool results in official format
			const inputWithTools = [
				...input,
				{
					role: "assistant",
					content: response.output_text || ""
				},
				...toolResults.map( tr =>
				{
					return {
						type: "function_call_output",
						call_id: tr.call_id,
						output: tr.output
					}
				})
			];

			const finalResponse = await llm.responses( inputWithTools, {
				temperature: 0.3,
				tools
			});

			console.log( "🤖 Final Assistant:", finalResponse.output_text || finalResponse.content );
		}

		console.log( "\n🎉 Conversation-to-Tool-Calling Test Completed Successfully!" );
		console.log( "✅ Multi-turn conversation maintained using Responses API" );
		console.log( "✅ Tool calling in conversation context" );
		console.log( "✅ Context preservation by sending complete conversation object" );
		console.log( "✅ Mixed tool usage (weather and tip calculations)" );
		console.log( "✅ Following official OpenAI function calling format" );

	}
	catch ( error )
	{
		console.log( "❌ Conversation-to-Tool-Calling Test Failed!" );
		console.log( "Error:", error.message );
		if ( error.response )
		{
			console.log( "Response:", error.response.data );
		}
	}
}

// Run the test
console.log( "Starting Conversation-to-Tool-Calling Test (Responses API)..." );
testConversationToolCalling();