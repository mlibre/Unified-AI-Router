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

			await this.makeRequest( "sendMessage", {
				chat_id: chatId,
				text: response,
			});
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