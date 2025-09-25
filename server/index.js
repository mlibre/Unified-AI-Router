const express = require( "express" );
const bodyParser = require( "body-parser" );
const cors = require( "cors" );
const AIRouter = require( "../main" ); // your existing class
const pino = require( "pino" );
const pretty = require( "pino-pretty" );
const stream = pretty({ colorize: true, ignore: "pid,hostname" });
const logger = pino({ base: false }, stream );

const app = express();
app.use( cors() );
app.use( bodyParser.json() );

/**
 * Initialize router with providers (could load from env/config)
 */
const providers = [
	{
		name: "openai",
		apiKey: process.env.OPENAI_API_KEY,
		apiUrl: "https://api.openai.com/v1",
		model: "gpt-4o-mini",
	},
	// add more providers here
];
const aiRouter = new AIRouter( providers );

/**
 * OpenAI-compatible endpoint: POST /v1/chat/completions
 */
app.post( "/v1/chat/completions", async ( req, res ) =>
{
	try
	{
		const { messages, model, stream, ...rest } = req.body;

		if ( !messages || !Array.isArray( messages ) )
		{
			return res.status( 400 ).json({ error: { message: "messages must be an array" } });
		}

		if ( stream )
		{
			// Streaming mode → use Server-Sent Events (SSE)
			res.setHeader( "Content-Type", "text/event-stream" );
			res.setHeader( "Cache-Control", "no-cache" );
			res.setHeader( "Connection", "keep-alive" );

			try
			{
				const s = await aiRouter.chatCompletion( messages, { model, ...rest }, true );
				for await ( const chunk of s )
				{
					const delta = chunk.delta || { content: chunk.content || "" };
					const payload = {
						id: `chatcmpl_${Date.now()}`,
						object: "chat.completion.chunk",
						created: Math.floor( Date.now() / 1000 ),
						model: model || "unknown",
						choices: [
							{
								delta,
								index: 0,
								finish_reason: null,
							},
						],
					};
					res.write( `data: ${JSON.stringify( payload )}\n\n` );
				}

				// Send done signal
				res.write( "data: [DONE]\n\n" );
				res.end();
			}
			catch ( err )
			{
				logger.error( err );
				res.write( `data: ${JSON.stringify({ error: err.message })}\n\n` );
				res.write( "data: [DONE]\n\n" );
				res.end();
			}
		}
		else
		{
			// Non-streaming → return one-shot completion
			const content = await aiRouter.chatCompletion( messages, { model, ...rest }, false );
			res.json({
				id: `chatcmpl_${Date.now()}`,
				object: "chat.completion",
				created: Math.floor( Date.now() / 1000 ),
				model: model || "unknown",
				choices: [
					{
						index: 0,
						message: { role: "assistant", content },
						finish_reason: "stop",
					},
				],
			});
		}
	}
	catch ( err )
	{
		logger.error( err );
		res.status( 500 ).json({ error: { message: err.message } });
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
