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

		// Use sensible browser-like headers and prefer the client's User-Agent when available
		const incomingUA = req.headers && req.headers["user-agent"] || "";
		const ua = incomingUA || "Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0";
		const acceptHeader = req.headers && req.headers.accept || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
		const acceptLang = req.headers && req.headers["accept-language"] || "en-US,en;q=0.5";

		const fetchHeaders = {
			"User-Agent": ua,
			"Accept": acceptHeader,
			"Accept-Language": acceptLang,
			"DNT": req.headers && req.headers["dnt"] || "1",
			"Sec-GPC": req.headers && req.headers["sec-gpc"] || "1",
			"Upgrade-Insecure-Requests": "1",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			"Referer": base,
		};

		// Try a few times on 429 or transient failures with exponential backoff
		const maxAttempts = 3;
		let attempt = 0;
		let r = null;
		while ( attempt < maxAttempts )
		{
			attempt++;
			try
			{
			// Use fetch available on Node 18+ / Vercel runtime
				r = await fetch( url, {
					method: "GET",
					headers: fetchHeaders,
				});

				if ( r.ok )
				{
				// success — parse below
					break;
				}

				// If rate-limited, wait and retry (honor Retry-After header if present)
				if ( r.status === 429 )
				{
					const retryAfter = r.headers.get( "retry-after" );
					const waitMs = retryAfter ? parseInt( retryAfter, 10 ) * 1000 : 200 * attempt ; // small backoff
					await new Promise( resolve => { return setTimeout( resolve, waitMs ) });
					continue; // retry
				}

				// non-429 non-ok — parse body if possible and return helpful info
				const t = await r.text().catch( () => { return null });
				return res.status( 502 ).json({
					error: "Searx returned non-OK",
					status: r.status,
					details: t,
				});
			}
			catch ( err )
			{
			// transient network failure — small backoff and retry
				if ( attempt < maxAttempts )
				{
					await new Promise( resolve => { return setTimeout( resolve, 150 * attempt ) });
					continue;
				}
				else
				{
					console.error( "search proxy fetch error:", err );
					return res.status( 502 ).json({ error: "Searx fetch failed", details: String( err && err.message ? err.message : err ) });
				}
			}
		} // end retry loop

		if ( !r )
		{
			return res.status( 502 ).json({ error: "No response from Searx" });
		}

		if ( !r.ok )
		{
			const t = await r.text().catch( () => { return null });
			return res.status( 502 ).json({
				error: "Searx returned non-OK after retries",
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
