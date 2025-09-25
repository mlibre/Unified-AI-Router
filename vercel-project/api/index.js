const TelegramClient = require( "../src/telegram" );
const { productionUrl, token } = require( "../src/config" );
const telegramClient = new TelegramClient();
const crypto = require( "crypto" );

// --- Function to validate Mini App data ---
function validateTelegramData ( telegramData, botToken )
{
	if ( !telegramData )
	{
		return false;
	}
	const data = new URLSearchParams( telegramData );
	const hash = data.get( "hash" );
	data.delete( "hash" );

	const dataCheckString = Array.from( data.entries() )
	.sort( ( [a], [b] ) => { return a.localeCompare( b ) })
	.map( ( [key, value] ) => { return `${key}=${value}` })
	.join( "\n" );

	const secretKey = crypto.createHmac( "sha256", "WebAppData" ).update( botToken ).digest();
	const calculatedHash = crypto.createHmac( "sha256", secretKey ).update( dataCheckString ).digest( "hex" );

	return calculatedHash === hash;
}

module.exports = async ( req, res ) =>
{
	// --- Handle Mini App API requests ---
	if ( req.url.startsWith( "/api/chat" ) )
	{
		try
		{
			const telegramData = req.headers["telegram-data"];
			if ( !validateTelegramData( telegramData, token ) )
			{
				return res.status( 403 ).json({ error: "Unauthorized: Invalid Telegram data" });
			}

			//  Expect 'messages' array instead of 'prompt'
			const { messages } = req.body;
			if ( !messages || !Array.isArray( messages ) || messages.length === 0 )
			{
				return res.status( 400 ).json({ error: "Messages array is required" });
			}

			const params = new URLSearchParams( telegramData );
			const user = JSON.parse( params.get( "user" ) );
			console.log( `Processing chat for user ${user.id}. History length: ${messages.length}` );

			// Use your existing AI Router with the full message history
			const aiResponse = await telegramClient.aiRouter.chatCompletion( messages );

			return res.status( 200 ).json({ response: aiResponse.content });

		}
		catch ( error )
		{
			console.error( "Error in /api/chat:", error );
			return res.status( 500 ).json({ error: "Internal Server Error" });
		}
	}

	// ... (rest of the webhook handling code remains the same) ...
	if ( req.query.register_webhook === "true" )
	{
		try
		{
			const response = await telegramClient.registerWebhook( productionUrl );
			return res.status( 200 ).json({ success: true, message: "Webhook setup completed", response });
		}
		catch ( error )
		{
			console.error( "Error setting up webhook:", error );
			return res.status( 500 ).json({ success: false, error: error.message });
		}
	}
	else if ( req.query.unregister_webhook === "true" )
	{
		try
		{
			await telegramClient.unRegisterWebhook();
			return res.status( 200 ).json({ success: true, message: "Webhook unregistered" });
		}
		catch ( error )
		{
			console.error( "Error unregistering webhook:", error );
			return res.status( 500 ).json({ success: false, error: error.message });
		}
	}
	try
	{
		const update = req.body;
		if ( !update )
		{
			console.error( "Received empty request body" );
			return res.status( 400 ).send( "Bad Request: Empty body" );
		}

		await telegramClient.handleUpdate( update );
		res.status( 200 ).send( "OK" );
	}
	catch ( error )
	{
		console.error( "Error processing update:", error );
		res.status( 500 ).send( "Internal Server Error" );
	}
};