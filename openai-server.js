const express = require( "express" );
const cors = require( "cors" );
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const pinoStream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, pinoStream );
require( "dotenv" ).config({ quiet: true });
const AIRouter = require( "./main" );
const providers = require( "./provider" )
const aiRouter = new AIRouter( providers );

const app = express();
app.use( cors() );
app.use( express.json({ limit: "50mb" }) );


const handleChatCompletion = async ( req, res ) =>
{
	const { messages, model, stream, ...rest } = req.body;

	if ( !messages || !Array.isArray( messages ) )
	{
		return res.status( 400 ).json({ error: { message: "messages must be an array" } });
	}

	if ( stream )
	{
		res.setHeader( "Content-Type", "text/event-stream" );
		res.setHeader( "Cache-Control", "no-cache" );
		res.setHeader( "Connection", "keep-alive" );

		try
		{
			const result = await aiRouter.chatCompletionWithResponse( messages, { model, stream, ...rest });

			for await ( const chunk of result.data )
			{
				res.write( `data: ${JSON.stringify( chunk )}\n\n` );
			}

			res.write( "data: [DONE]\n\n" );
		}
		catch ( err )
		{
			logger.error( err );
			res.write( `data: ${JSON.stringify({ error: { message: err.message } })}\n\n` );
			res.write( "data: [DONE]\n\n" );
		}
		res.end();
	}
	else
	{
		try
		{
			const result = await aiRouter.chatCompletionWithResponse( messages, { model, stream, ...rest });
			res.json( result.data );
		}
		catch ( err )
		{
			logger.error( err );
			res.status( 500 ).json({ error: { message: err.message } });
		}
	}
};

const handleGetModels = async ( req, res ) =>
{
	try
	{
		const models = await aiRouter.getModels();
		res.json({ data: models });
	}
	catch ( error )
	{
		logger.error( `Error in /v1/models: ${error.message}` );
		res.status( 500 ).json({ error: { message: error.message } });
	}
};

app.post( "/v1/chat/completions", handleChatCompletion );
app.post( "/chat/completions", handleChatCompletion );

app.get( "/v1/models", handleGetModels );
app.get( "/models", handleGetModels );

app.get( "/health", ( req, res ) => { return res.json({ status: "ok" }) });

// Start server
const PORT = process.env.PORT || 3000;
app.listen( PORT, () =>
{
	logger.info( `🚀 OpenAI-compatible API listening at http://localhost:${PORT}/v1/chat/completions` );
});
