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
				const response = await aiRouter.chatCompletion( messages, { model, ...rest }, true );
				const id = `chatcmpl-${Date.now()}`;
				const created = Math.floor( Date.now() / 1000 );
				let fullResponse = null;
				for await ( const chunk of response )
				{
					const modelName = chunk?.response_metadata?.model_name || model || "unknown";
					const systemFingerprint = chunk?.response_metadata?.system_fingerprint || null;
					let delta = { ... chunk.delta || { content: chunk.content || "" } };
					if ( !delta.role ) delta.role = "assistant";
					delta.reasoning = delta.reasoning || null;
					delta.reasoning_details = delta.reasoning_details || [];
					let toolCallsDelta = null;
					if ( chunk.tool_calls && chunk.tool_calls.length > 0 )
					{
						toolCallsDelta = chunk.tool_calls.map( ( tc, index ) =>
						{
							return {
								id: tc.id || `call_${Date.now()}_${Math.random().toString( 36 ).substr( 2, 9 )}`,
								type: "function",
								index,
								function: {
									name: tc.name,
									arguments: JSON.stringify( tc.args || {})
								}
							};
						});
						delta.tool_calls = toolCallsDelta;
						delta.content = "";
					}
					const chunkFinishReason = delta.finish_reason || chunk?.response_metadata?.finish_reason || null;
					const chunkNativeFinishReason = delta.native_finish_reason || chunk?.response_metadata?.native_finish_reason || chunkFinishReason || null;
					if ( chunk.content && !fullResponse ) fullResponse = chunk; // Capture full for reasoning if available
					const payload = {
						id,
						provider: "OpenAI",
						object: "chat.completion.chunk",
						created,
						model: modelName,
						system_fingerprint: systemFingerprint,
						choices: [
							{
								logprobs: null,
								delta,
								index: 0,
								finish_reason: chunkFinishReason,
								native_finish_reason: chunkNativeFinishReason,
							},
						],
					};
					const usage = chunk?.response_metadata?.usage;
					if ( usage && typeof usage === "object" && !Array.isArray( usage ) && Object.keys( usage ).length > 0 )
					{
						payload.usage = chunk?.response_metadata?.usage || null;
					}
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
			const response = await aiRouter.chatCompletion( messages, { model, ...rest }, false );
			let reasoning = null;
			let refusal = null;
			let toolCalls = null;
			if ( response.contentBlocks )
			{
				const reasoningBlocks = response.contentBlocks.filter( b => { return b.type === "reasoning" || b.type === "thinking" });
				reasoning = reasoningBlocks.length > 0 ? reasoningBlocks.map( b => { return b.text }).join( "\n" ) : null;
				const refusalBlocks = response.contentBlocks.filter( b => { return b.type === "refusal" });
				refusal = refusalBlocks.length > 0 ? refusalBlocks.map( b => { return b.text }).join( "\n" ) : null;
			}
			if ( response.tool_calls && response.tool_calls.length > 0 )
			{
				toolCalls = response.tool_calls.map( ( tc, index ) =>
				{
				  return {
					 id: tc.id || `call_${Date.now()}_${Math.random().toString( 36 ).substr( 2, 9 )}`,
					 type: "function",
					 index,
					 function: {
							name: tc.name,
							arguments: JSON.stringify( tc.args || {})
					 }
				  };
				});
			}
			const systemFingerprint = response.response_metadata?.system_fingerprint || null;
			const finishReason = response.response_metadata?.finish_reason || null;
			const nativeFinishReason = response.response_metadata?.native_finish_reason || finishReason || null;
			const messageContent = toolCalls && toolCalls.length > 0 ? "" : response.content;
			let finalResult = {
				id: `chatcmpl_${Date.now()}`,
				provider: "OpenAI",
				object: "chat.completion",
				created: Math.floor( Date.now() / 1000 ),
				model: response.response_metadata?.model_name || model || "unknown",
				system_fingerprint: systemFingerprint,
				choices: [
					{
						logprobs: null,
						finish_reason: finishReason,
						native_finish_reason: nativeFinishReason,
						index: 0,
						message: {
							role: "assistant",
							content: messageContent,
							refusal,
							reasoning,
							tool_calls: toolCalls
						},
					},
				],
			}
			const usage = response?.response_metadata?.usage;
			if ( usage && typeof usage === "object" && !Array.isArray( usage ) && Object.keys( usage ).length > 0 )
			{
				finalResult.usage = response?.response_metadata?.usage || null;
			}
			res.json( finalResult );
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
