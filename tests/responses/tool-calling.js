const axios = require( "axios" );

// Test Responses API with tool calling
const testResponsesAPIToolCalling = async () =>
{
	const url = "http://localhost:3000/v1/responses";
	const data = {
		"model": "gemini-2.5-pro",
		"input": "how is the weather in mashhad, tehran. use tools",
		"tools": [
			{
				"type": "function",
				"name": "multiply",
				"description": "Multiply two numbers",
				"parameters": {
					"type": "object",
					"properties": {
						"a": {
							"type": "number",
							"description": "First number"
						},
						"b": {
							"type": "number",
							"description": "Second number"
						}
					},
					"required": [
						"a",
						"b"
					],
					"additionalProperties": false
				}
			},
			{
				"type": "function",
				"name": "get_weather",
				"description": "Get the current weather forecast for a given city.",
				"parameters": {
					"type": "object",
					"properties": {
						"city": {
							"type": "string",
							"description": "The name of the city (e.g., Tehran) to get the weather for."
						}
					},
					"required": [
						"city"
					],
					"additionalProperties": false
				}
			}
		],
		"temperature": 0.7,
		"stream": false
	};

	try
	{
		console.log( "Testing Responses API with Tool Calling..." );
		const response = await axios.post( url, data, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer test-key"
			}
		});

		console.log( "✅ Responses API Tool Calling Test Success!" );
		console.log( "Response:", JSON.stringify( response.data, null, 2 ) );
	}
	catch ( error )
	{
		if ( error.response )
		{
			console.log( "❌ Responses API Tool Calling Test Failed!" );
			console.log( "Status:", error.response.status );
			console.log( "Response:", error.response.data );
		}
		else
		{
			console.log( "❌ Connection Error:", error.message );
		}
	}
};

// Run test
console.log( "Starting Responses API Tool Calling Test..." );
testResponsesAPIToolCalling();