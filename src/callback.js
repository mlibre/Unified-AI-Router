const { genButtons } = require( "./button-generator.js" );
const { generateMessage } = require( "./message-generator.js" );
const { generateSaanNuzulMessage, generateKhameneiMessage, generateTafsirNemunehMessage, markTafsirNemunehAsRead, markTafsirNemunehAsUnread, markKhameneiAsRead, markKhameneiAsUnread } = require( "./interpretations.js" );
const { actionCodes, all_translations, quranData } = require( "./config.js" );

async function handleCallback ( telegramClient, input, chatId, messageId )
{
	const messageOptions = {
		chat_id: chatId,
		message_id: messageId,
		parse_mode: "MarkdownV2"
	};

	let { actionCode, previousActionCode, lastTranslaction, readStatusCode, searchResultIndexes, refIndex, verseRefIndex } = parseCallbackData( input );

	const userOptions = {
		actionCode,
		previousActionCode,
		lastTranslaction,
		chatId,
		messageId
	};

	if ( all_translations[actionCode] )
	{ // translation
		userOptions.lastTranslaction = actionCode;
		const message = generateMessage( verseRefIndex, actionCode );
		await telegramClient.editMessageWithRetry( message, {
			...messageOptions,
			reply_markup: {
				inline_keyboard: await genButtons( verseRefIndex, refIndex, searchResultIndexes, userOptions )
			},
		});
	}
	else if ( actionCodes.nextVerse === actionCode )
	{ // next ayeh
		if ( verseRefIndex + 1 < quranData.length )
		{
			verseRefIndex += 1;
		}
		let message;
		if ( previousActionCode == actionCodes.saanNuzul )
		{
			userOptions.actionCode = actionCodes.saanNuzul;
			message = await generateSaanNuzulMessage( verseRefIndex );
		}
		else
		{
			message = generateMessage( verseRefIndex, userOptions.lastTranslaction );
		}
		await telegramClient.editMessageWithRetry( message, {
			...messageOptions,
			reply_markup: {
				inline_keyboard: await genButtons( verseRefIndex, refIndex, searchResultIndexes, userOptions )
			},
		});
	}
	else if ( actionCodes.prevVerse === actionCode )
	{ // previous ayeh
		if ( verseRefIndex - 1 >= 0 )
		{
			verseRefIndex -= 1;
		}
		let message;
		if ( previousActionCode == actionCodes.saanNuzul )
		{
			userOptions.actionCode = actionCodes.saanNuzul;
			message = await generateSaanNuzulMessage( verseRefIndex );
		}
		else
		{
			message = generateMessage( verseRefIndex, userOptions.lastTranslaction );
		}
		await telegramClient.editMessageWithRetry( message, {
			...messageOptions,
			reply_markup: {
				inline_keyboard: await genButtons( verseRefIndex, refIndex, searchResultIndexes, userOptions )
			},
		});
	}
	else if ( actionCode === actionCodes.mainPage )
	{ // main page
		const message = generateMessage( verseRefIndex, userOptions.lastTranslaction );
		await telegramClient.editMessageWithRetry( message, {
			...messageOptions,
			reply_markup: {
				inline_keyboard: await genButtons( verseRefIndex, refIndex, searchResultIndexes, userOptions )
			},
		});
	}
	else
	{
		throw new Error( "Invalid callback data" );
	}
}

function parseCallbackData ( input )
{
	const actionCode = input[0];
	const previousActionCode = input[1];
	const lastTranslaction = input[2];
	const readStatusCode = input[3];
	const [verseRefIndexStr, searchResultIndexesStr] = input.slice( 4 ).split( "_" );
	let refIndex = -1;
	const searchResultIndexes = searchResultIndexesStr.split( "," ).map( ( num ) =>
	{
		const tmp = parseInt( num.replace( "@", "" ), 10 );
		if ( num.includes( "@" ) )
		{
			refIndex = tmp;
		}
		return tmp;
	});
	return {
		actionCode,
		previousActionCode,
		lastTranslaction,
		readStatusCode,
		searchResultIndexes,
		refIndex,
		verseRefIndex: parseInt( verseRefIndexStr )
	};
}

module.exports = {
	handleCallback
};