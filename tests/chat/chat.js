const AIRouter = require( "../../src/main" );
require( "dotenv" ).config({ quiet: true });

const providers = require( "../../src/provider" )
const llm = new AIRouter( providers );

async function getResponse ()
{
	try
	{
		const messages = [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "Hello, say something short." }
		];

		const stream = await llm.chatCompletion( messages, {
			temperature: 0.7,
			stream: true,
		});

		for await ( const chunk of stream )
		{
			console.log( chunk.reasoning || chunk.content );
		}
	}
	catch ( error )
	{
		console.error( "All providers failed: ", error.message );
	}
}

getResponse();