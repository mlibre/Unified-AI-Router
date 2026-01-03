const axios = require( "axios" );

// Test Responses API endpoint
const testResponsesAPI = async () =>
{
	const url = "http://localhost:3000/v1/responses";
	const data = {
		model: "any-model",
		input: "Hello, this is a test of the Responses API!"
	};

	try
	{
		console.log( "Testing Responses API..." );
		const response = await axios.post( url, data, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer test-key"
			}
		});

		console.log( "✅ Responses API Test Success!" );
		console.log( "Response:", JSON.stringify( response.data, null, 2 ) );
	}
	catch ( error )
	{
		if ( error.response )
		{
			console.log( "❌ Responses API Test Failed!" );
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
console.log( "Starting Responses API Test..." );
testResponsesAPI();