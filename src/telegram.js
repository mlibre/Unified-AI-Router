const { webhookPath, token, productionUrl } = require( "./config.js" );
const AIRouter = require( "../main.js" );
const { providers } = require( "./config.js" );

class TelegramClient
{
	constructor ()
	{
		this.token = token;
		this.apiBaseUrl = `https://api.telegram.org/bot${token}`;
		this.aiRouter = new AIRouter( providers );
		this.chatHistories = {}; // In-memory store for chat histories
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
		console.log( `Starting operation with ${retries} retries` );
		for ( let i = 0; i < retries; i++ )
		{
			try
			{
				return await operation();
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
			console.log( "text", text, "chatId", chatId );
			// console.log( "chat history for ", chatId, this.chatHistories[chatId] );

			// --- Command to launch the Mini App ---
			if ( text === "/start" || text === "/app" )
			{
			    const miniAppUrl = productionUrl; // Your Vercel deployment URL

			    const keyboard = {
			        inline_keyboard: [
			            [
			                {
			                    text: "🚀 Open AI Router App",
			                    web_app: { url: miniAppUrl }
			                }
			            ]
			        ]
			    };

			    await this.sendMessageWithRetry( chatId, "Click the button below to open the AI Router Mini App!", {
			        reply_markup: JSON.stringify( keyboard )
			    });
			    return; // Stop processing further to avoid AI response
			}
			// --- END ---

			if ( !this.chatHistories[chatId] )
			{
				this.chatHistories[chatId] = [];
			}

			const history = this.chatHistories[chatId];
			history.push({ role: "user", content: text });
			if ( history.length > 100 )
			{
				this.chatHistories[chatId] = history.slice( history.length - 100 );
			}
			// console.log( "chat history for ", chatId, "after update", this.chatHistories[chatId] );
			const systemPrompt = {
				role: "system",
				content: "You are a kind and selfless AI assistant. Be helpful and compassionate in your responses. Speak in user's language",
			};

			const messages = [
				systemPrompt,
				...this.chatHistories[chatId],
			];

			const response = await this.aiRouter.chatCompletion( messages );
			history.push({ role: "assistant", content: response });
			await this.sendMessageWithRetry( chatId, response );
		}
	}

	async registerWebhook ( productionUrl )
	{
		console.log( `Registering webhook with URL: ${productionUrl}${webhookPath}` );
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