const express = require( "express" );
const cors = require( "cors" );
const AIRouter = require( "../main" ); // your existing class
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const stream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, stream );
require( "dotenv" ).config({ quiet: true });

const app = express();
app.use( cors() );
app.use( express.json() );

/**
 * Initialize router with providers (could load from env/config)
 */
const providers = require( "../provider" )

const aiRouter = new AIRouter( providers );

/**
 * OpenAI-compatible endpoint: POST /v1/chat/completions
 */
app.post( "/v1/chat/completions", async ( req, res ) =>
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
			const result = await aiRouter.chatCompletionWithResponse( messages, { model, ...rest });

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
			const result = await aiRouter.chatCompletionWithResponse( messages, { model, ...rest });

			res.json( result.data );
		}
		catch ( err )
		{
			logger.error( err );
			res.status( 500 ).json({ error: { message: err.message } });
		}
	}
});

// Health check
app.get( "/health", ( req, res ) => { return res.json({ status: "ok" }) });

// Start server
const PORT = process.env.PORT || 3000;
app.listen( PORT, () =>
{
	logger.info( `🚀 OpenAI-compatible API listening at http://localhost:${PORT}/v1/chat/completions` );
});
