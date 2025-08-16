const path = require( "path" );
const fs = require( "fs" );
require( "dotenv" ).config();
const quranData = require( "../sources/quran.json" );
const sourcesText = fs.readFileSync( path.resolve( __dirname, "../sources/sources.txt" ), "utf-8" );

const appUrl = process.env.VERCEL_URL;
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const webhookPath = "/api";

if ( !appUrl )
{
	console.warn( "VERCEL_URL not set. Skipping webhook setup." );
	throw new Error( "VERCEL_URL is required" );
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if ( !token )
{
	throw new Error( "TELEGRAM_BOT_TOKEN is required" );
}

const redisUrl = process.env.REDIS_URL

// Basic validation for KV config
if ( !redisUrl )
{
	console.warn( "Vercel KV environment variables (REDIS_URL) not fully set. KV features will be disabled." );
	throw new Error( "REDIS_URL is required" );
}


const messageLength = 2100;
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days for HTML cache

const markdownCodes = {
	bold: "booold@",
	italic: "italic@",
	underline: "underline@",
	strikethrough: "strikethrough@",
	code: "code@",
	spoiler: "spoiler@"
};

const actionCodes = {
	nextResult: "a",
	prevResult: "b",
	ansarian: "c",
	fooladvand: "d",
	mojtabavi: "e",
	makarem: "f",
	arabicText: "g",
	arabicIrabText: "h",
	nextVerse: "i",
	prevVerse: "j",
	tafsirNemooneh: ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w"],
	mainPage: "x",
	hasRead: "y",
	hasNotRead: "z",
	toggleRead: "A",
	others: "B",
	saanNuzul: "C",
	khamenei: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"],
};


module.exports = {
	appUrl,
	productionUrl,
	webhookPath,
	token,
	redisUrl,
	quranData,
	sourcesText,
	messageLength,
	CACHE_TTL_SECONDS,
	markdownCodes,
	actionCodes,
	perian_translations,
	arabic_texts,
	all_translations,
	fuseKeys,
};