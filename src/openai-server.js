const http = require( "http" );
const fs = require( "fs" );
const path = require( "path" );
const crypto = require( "crypto" );
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

const adminEnabled =	process.env.ADMIN_USERNAME &&	process.env.ADMIN_PASSWORD;
const PORT = process.env.PORT || 3000;
const sessions = new Map();

const chatbotIndex = path.join( __dirname, "chatbot", "chatbot.html" );
const chatbotStaticDir = path.join( __dirname, "chatbot" );

function createSession ( username )
{
	const token = crypto.randomBytes( 24 ).toString( "hex" );
	sessions.set( token, { username, created: Date.now() });
	return token;
}

function requireAdminSession ( req, res, next )
{
	const token = req.cookies?.admin_session;
	if ( !token || !sessions.has( token ) )
	{
		return res.sendFile( path.join( __dirname, "admin", "login.html" ) );
	}
	next();
}

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

const app = express();
app.use( cors() );
app.use( express.json({ limit: "50mb" }) );

app.use( ( req, res, next ) =>
{
	const cookie = req.headers.cookie || "";
	req.cookies = Object.fromEntries( cookie.split( ";" ).map( v => { return v.trim().split( "=" ) }) );
	next();
});

app.post( "/v1/responses", handleResponses );
app.post( "/responses", handleResponses );

app.post( "/v1/chat/completions", handleChatCompletion );
app.post( "/chat/completions", handleChatCompletion );

app.get( "/v1/models", handleGetModels );
app.get( "/models", handleGetModels );

app.get( "/health", ( req, res ) => { return res.json({ status: "ok" }) });

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

app.post( "/admin/login", ( req, res ) =>
{
	const { username, password } = req.body;

	if (
		username === process.env.ADMIN_USERNAME &&
		password === process.env.ADMIN_PASSWORD
	)
	{
		const token = createSession( username );
		res.setHeader(
			"Set-Cookie",
			`admin_session=${token}; HttpOnly; Path=/; SameSite=Strict`
		);
		return res.json({ ok: true });
	}

	res.status( 401 ).json({ error: "Invalid credentials" });
});

app.post( "/admin/logout", requireAdminSession, ( req, res ) =>
{
	sessions.delete( req.cookies.admin_session );
	res.setHeader( "Set-Cookie", "admin_session=; Max-Age=0; Path=/" );
	res.json({ ok: true });
});

app.get( "/", ( req, res ) =>
{
	if ( !adminEnabled )
	{
		return res.sendFile( chatbotIndex );
	}

	const token = req.cookies?.admin_session;
	if ( !token || !sessions.has( token ) )
	{
		return res.sendFile( path.join( __dirname, "admin", "login.html" ) );
	}

	res.sendFile( chatbotIndex );
});

app.get( "/admin", requireAdminSession, ( req, res ) =>
{
	res.sendFile( path.join( __dirname, "admin", "admin.html" ) );
});

app.get( "/admin/provider", requireAdminSession, ( req, res ) =>
{
	res.json( require( "./provider" ) );
});

app.post( "/admin/provider", requireAdminSession, ( req, res ) =>
{
	const content =
`module.exports = ${JSON.stringify( req.body, null, 2 )};\n`;
	fs.writeFileSync( path.join( __dirname, "provider.js" ), content );
	res.json({ status: "saved" });
});

app.get( "/:filename", ( req, res, next ) =>
{
	const filePath = path.join( chatbotStaticDir, req.params.filename );
	const ext = path.extname( filePath ).toLowerCase();

	if ( fs.existsSync( filePath ) && fs.statSync( filePath ).isFile() )
	{
		return res.sendFile( filePath );
	}

	// If not a static file, continue to the next handler
	next();
});

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