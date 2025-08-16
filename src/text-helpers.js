const { markdownCodes } = require( "./config.js" );

function normalizeMessage ( message )
{
	if ( typeof message !== "string" )
	{
		console.warn( "normalizeMessage received non-string input:", message );
		message = String( message ); // Attempt to convert
	}
	const escapedMessage = message
	.replace( /[!._*\[\](){}=-]/g, char => { return `\\${char}` });

	return toPersian( escapedMessage.replace(
		new RegExp( `${markdownCodes.bold}(.*?)${markdownCodes.bold}`, "g" ),
		( _, text ) => { return `*${text}*` }
	) );
}

function toPersian ( text )
{
	if ( typeof text !== "string" )
	{
		return ""; // Return empty string for non-string input
	}
	return text
	.split( "" )
	.map( char => { return PERSIAN_NUMBERS[char] || char })
	.join( "" );
}

module.exports = {
	extractInfoByRefIndex,
	normalizeMessage,
	toPersian,
	PERSIAN_NUMBERS
};