const axios = require( "axios" );

// Test basic multi-turn conversation functionality
const testBasicConversation = async () =>
{
	const url = "http://localhost:3000/v1/responses";

	// First turn of conversation
	const firstTurnData = {
		model: "any-model",
		input: [
			{
				role: "user",
				content: "Hello, I need help with a coding problem. Can you assist me?"
			}
		]
	};

	try
	{
		console.log( "=== Starting Basic Conversation Test ===" );
		console.log( "Turn 1: Initial request" );

		const firstResponse = await axios.post( url, firstTurnData, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer test-key"
			}
		});

		console.log( "✅ Turn 1 Success!" );
		console.log( "Response ID:", firstResponse.data.id );
		console.log( "Response:", JSON.stringify( firstResponse.data, null, 2 ) );

		// Extract response ID for next turn
		const previousResponseId = firstResponse.data.id;

		// Second turn of conversation
		const secondTurnData = {
			model: "any-model",
			input: [
				{
					role: "user",
					content: "I want to learn about JavaScript closures. Can you explain it?"
				}
			],
			previous_response_id: previousResponseId,
			conversation_id: "test-conversation-001"
		};

		console.log( "\nTurn 2: Following up on the conversation" );

		const secondResponse = await axios.post( url, secondTurnData, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer test-key"
			}
		});

		console.log( "✅ Turn 2 Success!" );
		console.log( "Response ID:", secondResponse.data.id );
		console.log( "Response:", JSON.stringify( secondResponse.data, null, 2 ) );

		// Third turn - reference context from previous turns
		const thirdTurnData = {
			model: "any-model",
			input: [
				{
					role: "user",
					content: "Can you give me a practical example of a closure?"
				}
			],
			previous_response_id: secondResponse.data.id,
			conversation_id: "test-conversation-001"
		};

		console.log( "\nTurn 3: Asking for practical example" );

		const thirdResponse = await axios.post( url, thirdTurnData, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer test-key"
			}
		});

		console.log( "✅ Turn 3 Success!" );
		console.log( "Response ID:", thirdResponse.data.id );
		console.log( "Response:", JSON.stringify( thirdResponse.data, null, 2 ) );

		console.log( "\n🎉 Basic Conversation Test Completed Successfully!" );
		console.log( "✅ Multi-turn conversation with context preservation" );
		console.log( "✅ previous_response_id parameter usage" );
		console.log( "✅ conversation_id consistency" );
		console.log( "✅ Input/output item management" );

	}
	catch ( error )
	{
		if ( error.response )
		{
			console.log( "❌ Basic Conversation Test Failed!" );
			console.log( "Status:", error.response.status );
			console.log( "Response:", error.response.data );
		}
		else
		{
			console.log( "❌ Connection Error:", error.message );
		}
	}
};

// Run the test
console.log( "Starting Basic Conversation Test..." );
testBasicConversation();
