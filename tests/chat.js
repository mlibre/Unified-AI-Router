const AIRouter = require( "../main" );
require( "dotenv" ).config({ quiet: true });

const providers = require( "../provider" )
const llm = new AIRouter( providers );

async function getResponse ()
{
	try
	{
		const messages = [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "Explain quantum computing in simple terms. explain in 2000 lines" }
		];

		const stream = await llm.chatCompletion( messages, {
			temperature: 0.7,
			stream: true,
		});

		for await ( const chunk of stream )
		{
			process.stdout.write( chunk.content );
		}
	}
	catch ( error )
	{
		console.error( "All providers failed:", error.message );
	}
}

getResponse();