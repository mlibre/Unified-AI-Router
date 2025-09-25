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
				const id = `chatcmpl-${Date.now()}`;
				const created = Math.floor( Date.now() / 1000 );
				const modelName = model || "unknown";
				let fullResponse = null;
				for await ( const chunk of s )
				{
					const delta = chunk.delta || { content: chunk.content || "" };
					if ( chunk.content && !fullResponse ) fullResponse = chunk; // Capture full for reasoning if available
					const payload = {
						id,
						provider: "OpenAI",
						object: "chat.completion.chunk",
						created,
						model: modelName,
						choices: [
							{
								logprobs: null,
								delta,
								index: 0,
								finish_reason: null,
							},
						],
					};
					res.write( `data: ${JSON.stringify( payload )}\n\n` );
				}
				// Optional: Send final chunk with full message if reasoning available
				if ( fullResponse && fullResponse.additional_kwargs?.reasoning )
				{
					const finalPayload = {
						id,
						provider: "OpenAI",
						object: "chat.completion.chunk",
						created,
						model: modelName,
						choices: [
							{
								logprobs: null,
								finish_reason: "stop",
								native_finish_reason: "stop",
								index: 0,
								delta: {
									content: "",
									role: "assistant",
									refusal: fullResponse.additional_kwargs?.refusal || null,
									reasoning: fullResponse.additional_kwargs?.reasoning || null
								},
							},
						],
					};
					res.write( `data: ${JSON.stringify( finalPayload )}\n\n` );
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
			const response = await aiRouter.chatCompletion( messages, { model, ...rest }, false );
			let reasoning = null;
			let refusal = null;
			if ( response.contentBlocks )
			{
				const reasoningBlocks = response.contentBlocks.filter( b => { return b.type === "reasoning" || b.type === "thinking" });
				reasoning = reasoningBlocks.length > 0 ? reasoningBlocks.map( b => { return b.text }).join( "\n" ) : null;
				const refusalBlocks = response.contentBlocks.filter( b => { return b.type === "refusal" });
				refusal = refusalBlocks.length > 0 ? refusalBlocks.map( b => { return b.text }).join( "\n" ) : null;
			}
			res.json({
				id: `chatcmpl_${Date.now()}`,
				provider: "OpenAI",
				object: "chat.completion",
				created: Math.floor( Date.now() / 1000 ),
				model: model || "unknown",
				choices: [
					{
						logprobs: null,
						finish_reason: "stop",
						native_finish_reason: "stop",
						index: 0,
						message: {
							role: "assistant",
							content: response.content,
							refusal,
							reasoning
						},
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
