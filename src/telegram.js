const { webhookPath, token } = require( "./config.js" );
const AIRouter = require( "../main.js" );
const { providers } = require( "./config.js" );

class TelegramClient
{
	constructor ()
	{
		this.token = token;
		this.apiBaseUrl = `https://api.telegram.org/bot${token}`;
		this.aiRouter = new AIRouter( providers );
	}
	isNetworkError ( error )
	{
		// TODO: check with fetch
		return error.message.includes( "socket hang up" ) ||
			error.message.includes( "network socket disconnected" ) ||
			error.message.includes( "fetch failed" );
	}

	async sleep ( ms )
	{
		await new Promise( resolve => { return setTimeout( resolve, ms ) });
	}

	async sendMessageWithRetry ( chatId, message, options = {})
	{
		return await this.withRetry( () =>
		{
			return this.makeRequest( "sendMessage", {
				chat_id: chatId,
				text: message,
				...options,
			});
		}, options );
	}

	async withRetry ( operation, options, retries = 10, delay = 50 )
	{
		for ( let i = 0; i < retries; i++ )
		{
			try
			{
				return await operation( options );
			}
			catch ( error )
			{
				if ( this.isNetworkError( error ) )
				{
					console.log( `Retrying... Attempts left: ${retries - i - 1}`, error.cause, error.message );
					await this.sleep( delay );
				}
				else
				{
					throw error;
				}
			}
		}
		throw new Error( "Max retries reached" );
	}

	async makeRequest ( method, params = {})
	{
		const url = `${this.apiBaseUrl}/${method}`;
		const response = await fetch( url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify( params ),
		});

		if ( !response.ok )
		{
			const error = await response.json();
			throw new Error( `Telegram API error: ${JSON.stringify( error )}` );
		}

		return await response.json();
	}

	async handleUpdate ( update )
	{
		if ( "message" in update && update.message.text )
		{
			const { text } = update.message;
			const chatId = update.message.chat.id;

			const messages = [{ role: "user", content: text }];
			const response = await this.aiRouter.chatCompletion( messages );

			await this.sendMessageWithRetry( chatId, response );
		}
	}

	async registerWebhook ( productionUrl )
	{
		const response = await this.makeRequest( "setWebhook", {
			url: `${productionUrl}${webhookPath}`,
			drop_pending_updates: true,
		});
		return { response, url: `${productionUrl}${webhookPath}` };
	}

	async unRegisterWebhook ()
	{
		const response = await this.makeRequest( "setWebhook", { url: "" });
		return response.ok === true;
	}
}

module.exports = TelegramClient;