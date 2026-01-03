const axios = require( "axios" );
require( "dotenv" ).config({ quiet: true });

void async function main ()
{
	const PORT = 3000;
	try
	{
		const streamPayload = {
			messages: [
				{ role: "system", content: "You are a helpful assistant." },
				{ role: "user", content: "Hello, say something short." }
			],
			model: "no-need",
			stream: true,
			temperature: 0.7
		};
		const streamRes = await axios.post( `http://localhost:${PORT}/v1/chat/completions`, streamPayload, {
			responseType: "stream",
			headers: { "Accept": "text/event-stream" }
		});

		let fullContent = "";
		let chunks = [];
		streamRes.data.on( "data", ( chunk ) =>
		{
			const data = chunk.toString();
			const lines = data.split( "\n" );
			for ( const line of lines )
			{
				if ( line.startsWith( "data: " ) )
				{
					const jsonStr = line.slice( 6 );
					if ( jsonStr === "[DONE]" ) break;
					try
					{
						const payload = JSON.parse( jsonStr );
						if ( payload.choices && payload.choices[0].delta.content )
						{
							fullContent += payload.choices[0].delta.content;
							chunks.push( payload );
						}
					}
					catch ( e )
					{
						// Ignore parse errors
					}
				}
			}
		});

		await new Promise( ( resolve, reject ) =>
		{
			streamRes.data.on( "end", resolve );
			streamRes.data.on( "error", reject );
		});

		console.log( "Streaming chunks count:", chunks.length );
		console.log( "Full streamed content:", fullContent );
		console.log( "Last chunk finish_reason:", chunks[chunks.length - 1]?.choices[0].finish_reason );
	}
	catch ( error )
	{
		console.error( "❌ Test failed:", error.message );
	}
}()