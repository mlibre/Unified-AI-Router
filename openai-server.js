const http = require( "http" );
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
const path = require( "path" );
app.use( cors() );
app.use( express.json({ limit: "50mb" }) );


const handleResponses = async ( req, res ) =>
{
	const { input, model, stream, ...rest } = req.body;

	if ( !input )
	{
		return res.status( 400 ).json({ error: { message: "input is required" } });
	}

	if ( stream )
	{
		res.setHeader( "Content-Type", "text/event-stream" );
		res.setHeader( "Cache-Control", "no-cache" );
		res.setHeader( "Connection", "keep-alive" );

		try
		{
			const result = await aiRouter.responsesWithResponse( input, { model, stream, ...rest });

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
			const result = await aiRouter.responsesWithResponse( input, { model, stream, ...rest });
			res.json( result.data );
		}
		catch ( err )
		{
			logger.error( err );
			res.status( 500 ).json({ error: { message: err.message } });
		}
	}
};

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

app.post( "/v1/responses", handleResponses );
app.post( "/responses", handleResponses );

app.post( "/v1/chat/completions", handleChatCompletion );
app.post( "/chat/completions", handleChatCompletion );

app.get( "/v1/models", handleGetModels );
app.get( "/models", handleGetModels );

// Serve chatbot static files
app.use( express.static( path.join( __dirname, "chatbot" ) ) );

app.get( "/health", ( req, res ) => { return res.json({ status: "ok" }) });

app.get( "/", ( req, res ) =>
{
	res.sendFile( path.join( __dirname, "chatbot", "chatbot.html" ) );
});

app.get( "/providers/status", async ( req, res ) =>
{
	try
	{
		const statuses = await aiRouter.checkProvidersStatus();
		res.json({ data: statuses });
	}
	catch ( error )
	{
		logger.error( `Error in /providers/status: ${error.message}` );
		res.status( 500 ).json({ error: { message: error.message } });
	}
});

const PORT = process.env.PORT || 3000;
app.listen( PORT, ( e ) =>
{
	if ( e )
	{
		logger.error( `Failed to start server: ${e.message}` );
		process.exit( 1 );
	}
	else
	{
		logger.info( `🚀 OpenAI-compatible API listening at http://localhost:${PORT}/v1/chat/completions and /v1/responses` );
		logger.info( `🌐 Chatbot interface available at http://localhost:${PORT}/` );

		setTimeout( () =>
		{
			const url = `http://localhost:${PORT}/health`;
			http.get( url, ( res ) =>
			{
				if ( res.statusCode === 200 )
				{
					logger.info( "Keep-alive ping successful." );
				}
				else
				{
					logger.error( `Keep-alive ping failed with status code: ${res.statusCode}` );
				}
			}).on( "error", ( err ) =>
			{
				logger.error( "Error sending keep-alive ping:", err.message );
			});
		}, 14 * 60 * 1000 ); // 14 minutes
	}
});
