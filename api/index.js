const TelegramClient = require( "../src/telegram" );
const { productionUrl } = require( "../src/config" );

module.exports = async ( req, res ) =>
{
	const telegramClient = new TelegramClient();

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