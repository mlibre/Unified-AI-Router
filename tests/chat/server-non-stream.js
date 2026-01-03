const axios = require( "axios" );
require( "dotenv" ).config({ quiet: true });

void async function main ()
{
	const PORT = 3000;
	try
	{
		const nonStreamPayload = {
			messages: [
				{ role: "system", content: "You are a helpful assistant." },
				{ role: "user", content: "Hello, say something short." }
			],
			model: "gpt-3.5-turbo",
			temperature: 0.7
		};
		const nonStreamRes = await axios.post( `http://localhost:${PORT}/v1/chat/completions`, nonStreamPayload );
		console.log( "Non-streaming response:", {
			id: nonStreamRes.data.id,
			content: nonStreamRes.data.choices[0].message.content,
			finish_reason: nonStreamRes.data.choices[0].finish_reason
		});
		console.log( "\n✅ All tests completed successfully!" );
	}
	catch ( error )
	{
		console.error( "❌ Test failed:", error.message );
	}
}()