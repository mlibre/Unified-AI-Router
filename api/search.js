// api/search.js - simple proxy to a SearxNG instance
// Put SEARX_URL in your Vercel environment (e.g. https://searx.perennialte.ch)

module.exports = async ( req, res ) =>
{
	try
	{
	  const q = req.query && req.query.q || req.body && req.body.q;
	  if ( !q )
		{
		 return res.status( 400 ).json({ error: "q (query) parameter is required" });
	  }

	  const base = ( process.env.SEARX_URL || "https://searx.perennialte.ch" ).replace( /\/+$/, "" );
	  const url = `${base}/search?q=${encodeURIComponent( q )}&format=json&language=all`;

	  // Use fetch available on Node 18+ / Vercel runtime
	  const r = await fetch( url, {
		 method: "GET",
		 headers: {
				"User-Agent": "AI-Router-Searx-Proxy/1.0",
				Accept: "application/json",
		 },
	  });

	  if ( !r.ok )
		{
		 const t = await r.text().catch( () => { return null });
		 // return structured, concise error info (front-end will show friendly messages)
		 return res.status( 502 ).json({
				error: "Searx returned non-OK",
				status: r.status,
				details: t,
		 });
	  }

	  const json = await r.json();

	  // Lightweight caching headers for Vercel CDN
	  res.setHeader( "Cache-Control", "s-maxage=60, stale-while-revalidate=120" );
	  return res.status( 200 ).json( json );
	}
	catch ( err )
	{
	  console.error( "search proxy error:", err );
	  return res.status( 500 ).json({ error: err.message });
	}
};
