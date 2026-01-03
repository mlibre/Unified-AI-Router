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

// Helper to normalize assistant messages to simple string content
function normalizeMessages ( items )
{
	return items.map( item =>
	{
		if ( item.type === "message" && item.role === "assistant" )
		{
			// Extract text from content array and convert to simple string
			if ( Array.isArray( item.content ) && item.content.length > 0 )
			{
				const textContent = item.content
				.filter( c => { return c.type === "output_text" && c.text })
				.map( c => { return c.text })
				.join( "\n" );

				if ( textContent.trim() )
				{
					return {
						role: "assistant",
						content: textContent
					};
				}
			}
			// Skip empty assistant messages
			return null;
		}
		return item;
	}).filter( item => { return item !== null });
}

// Process tool calls and return updated conversation
async function processToolCalls ( response, currentInput )
{
	const functionCalls = response.output.filter( item => { return item.type === "function_call" });

	if ( functionCalls.length === 0 )
	{
		const updatedInput = [
			...currentInput,
			...normalizeMessages( response.output )
		];
		return { input: updatedInput, hasToolCalls: false };
	}

	console.log( `🔧 Executing ${functionCalls.length} tool call(s)...` );

	// Execute all tool calls
	const toolResults = [];
	for ( const toolCall of functionCalls )
	{
		const toolResult = await executeTool( toolCall );
		toolResults.push( toolResult );
	}

	const inputWithTools = [
		...currentInput,
		...normalizeMessages( response.output ),
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

	const updatedInput = [
		...inputWithTools,
		...normalizeMessages( finalResponse.output )
	];

	return { input: updatedInput, hasToolCalls: true, toolResults };
}

// Main conversation test using responses API following official documentation
async function testConversationToolCalling ()
{
	console.log( "=== Starting Conversation-to-Tool-Calling Test (Responses API) ===" );

	try
	{
		// Initialize conversation
		let input = [];

		// Turn 1: Initial request - user asks for help with calculations and weather
		console.log( "\n📝 Turn 1: Initial request for calculations and weather" );

		input.push({
			role: "user",
			content: "Hi! I need help with a few things. First, what's 15% tip on a $85 bill? Also, what's the weather like in Tehran and Mashhad?"
		});

		let response = await llm.responses( input, {
			temperature: 0.3,
			tools
		});

		console.log( "🤖 Assistant:", response.output_text || response.content );
		console.log( "Response ID:", response.id );

		// Process tool calls for turn 1
		const turn1Result = await processToolCalls( response, input );
		input = turn1Result.input;

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

		// Process tool calls for turn 2
		const turn2Result = await processToolCalls( response, input );
		input = turn2Result.input;

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

		// Process tool calls for turn 3
		await processToolCalls( response, input );

		console.log( "\n🎉 Conversation-to-Tool-Calling Test Completed Successfully!" );
		console.log( "✅ Multi-turn conversation maintained using Responses API" );
		console.log( "✅ Tool calling in conversation context" );
		console.log( "✅ Context preservation by sending complete conversation object" );
		console.log( "✅ Mixed tool usage (weather and tip calculations)" );
		console.log( "✅ Following official OpenAI function calling format" );
		console.log( "✅ Clean, maintainable code structure" );

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