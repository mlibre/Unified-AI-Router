// public/app.js - Vanilla JS front-end for Telegram Mini App (drop-in)
// Updated: sanitize assistant text, friendly search error handling, theme variables mapping,
// removed separate search toggle (single composer + include-search checkbox used)

( function ()
{
	const WebApp = window.Telegram?.WebApp;
	if ( !WebApp )
	{
	  console.warn( "Telegram WebApp object not available." );
	}

	// UI elements
	const messagesEl = document.getElementById( "messages" );
	const inputEl = document.getElementById( "input" );
	const formEl = document.getElementById( "composer" );
	const sendBtn = document.getElementById( "send" );
	const fullscreenBtn = document.getElementById( "fullscreen-btn" );
	const searchPanel = document.getElementById( "search-panel" );
	const searchResultsEl = document.getElementById( "search-results" );
	const searchStatusEl = document.getElementById( "search-status" );
	const includeSearchCheckbox = document.getElementById( "include-search" );

	let conversation = [];
	let lastSearchResults = [];

	// Initialize WebApp
	try
	{
	  WebApp?.ready?.();
	  WebApp?.expand?.();
	}
	catch ( e ) {}

	// Apply theme params to CSS variables (use Telegram's themeParams fields)
	function applyTheme ()
	{
	  try
		{
		 const t = WebApp?.themeParams || {};
		 // Map many theme params to CSS variables so style.css can pick them up
		 const mappings = {
				"--tg-theme-bg-color": t.bg_color || "#ffffff",
				"--tg-theme-text-color": t.text_color || "#111827",
				"--tg-theme-hint-color": t.hint_color || "#6b7280",
				"--tg-theme-link-color": t.link_color || "#2563eb",
				"--tg-theme-button-color": t.button_color || "#2563eb",
				"--tg-theme-button-text-color": t.button_text_color || "#ffffff",
				"--tg-theme-secondary-bg-color": t.secondary_bg_color || "#f3f4f6",
				"--tg-theme-header-bg-color": t.header_bg_color || "#ffffff",
				"--tg-theme-bottom-bar-bg-color": t.bottom_bar_bg_color || "#ffffff",
				"--tg-theme-accent-text-color": t.accent_text_color || "#111827",
				"--tg-theme-section-bg-color": t.section_bg_color || "#ffffff",
				"--tg-theme-section-header-text-color": t.section_header_text_color || "#111827",
				"--tg-theme-section-separator-color": t.section_separator_color || "#e5e7eb",
				"--tg-theme-subtitle-text-color": t.subtitle_text_color || "#6b7280",
				"--tg-theme-destructive-text-color": t.destructive_text_color || "#ef4444",
		 };
		 Object.entries( mappings ).forEach( ( [k, v] ) => { return document.documentElement.style.setProperty( k, v ) });
	  }
		catch ( e )
		{
		 console.warn( "applyTheme failed", e );
	  }
	}
	applyTheme();
	WebApp?.onEvent && WebApp.onEvent( "themeChanged", applyTheme );

	// Cloud storage helpers
	function saveHistory ()
	{
	  try
		{
		 WebApp.CloudStorage.setItem( "chat_history", JSON.stringify( conversation ), ( err ) =>
			{
				if ( err ) console.warn( "CloudStorage save failed", err );
		 });
	  }
		catch ( e )
		{
		 // ignore
	  }
	}
	function loadHistory ()
	{
	  try
		{
		 WebApp.CloudStorage.getItem( "chat_history", ( err, value ) =>
			{
				if ( err || !value )
				{
			  conversation = [{ role: "assistant", content: "Hi — welcome to the new AI Router! Use the checkbox to include web results in your request." }];
			  renderMessages();
			  saveHistory();
			  return;
				}
				try
				{
			  conversation = JSON.parse( value );
				}
				catch ( e )
				{
			  conversation = [{ role: "assistant", content: "Hi — welcome to the new AI Router!" }];
				}
				renderMessages();
		 });
	  }
		catch ( e )
		{
		 conversation = [{ role: "assistant", content: "Hi — welcome to the new AI Router!" }];
		 renderMessages();
	  }
	}

	// Rendering
	function renderMessages ()
	{
	  messagesEl.innerHTML = "";
	  conversation.forEach( ( m ) =>
		{
		 const div = document.createElement( "div" );
		 div.className = `message ${ m.role === "user" ? "user" : "assistant"}`;
		 // allow HTML-safe line breaks - keep textContent to avoid XSS
		 div.textContent = m.content;
		 messagesEl.appendChild( div );
	  });
	  messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	// Add message (and persist)
	function pushMessage ( role, content )
	{
	  conversation.push({ role, content });
	  renderMessages();
	  saveHistory();
	}

	// Simple helper to sanitize assistant text:
	// - remove leading/trailing whitespace/newlines
	// - collapse 3+ consecutive newlines into max 2
	// - preserve paragraph breaks up to 2 newlines
	function sanitizeAssistantText ( text )
	{
	  if ( !text && text !== "" ) return text;
	  // normalize CRLF
	  let s = String( text ).replace( /\r/g, "" );
	  // remove leading blank lines
	  s = s.replace( /^\s*\n+/, "" );
	  // remove trailing blank lines
	  s = s.replace( /\n+\s*$/, "" );
	  // collapse >2 blank lines into 2
	  s = s.replace( /\n{3,}/g, "\n\n" );
	  // trim surrounding whitespace
	  s = s.trim();
	  return s;
	}

	// Render search results list
	function renderSearchResults ( items )
	{
	  searchResultsEl.innerHTML = "";
	  if ( !items || items.length === 0 )
		{
		 searchResultsEl.innerHTML = "<li class=\"no-results\">No results</li>";
		 return;
	  }
	  items.forEach( ( r, idx ) =>
		{
		 const li = document.createElement( "li" );
		 li.className = "search-item";
		 const a = document.createElement( "a" );
		 a.href = r.link || "#";
		 a.target = "_blank";
		 a.rel = "noopener noreferrer";
		 a.textContent = r.title || r.link || `Result ${idx + 1}`;
		 const p = document.createElement( "p" );
		 p.className = "snippet";
		 p.textContent = r.snippet || "";
		 li.appendChild( a );
		 li.appendChild( p );
		 searchResultsEl.appendChild( li );
	  });
	}

	// Search function that returns normalized results or throws an Error with friendly message
	async function doSearchFetch ( query )
	{
	  if ( !query || !query.trim() ) return [];
	  const url = `/api/search?q=${encodeURIComponent( query )}`;
	  const resp = await fetch( url, { headers: { "Telegram-Data": WebApp?.initData || "" } });
	  if ( !resp.ok )
		{
		 // try to parse helpful info
		 let body;
		 try { body = await resp.json(); }
			catch ( e ) { body = await resp.text().catch( () => { return null }); }
		 // map status codes to friendly messages when possible
		 if ( resp.status === 429 || body && ( body.details && String( body.details ).toLowerCase().includes( "too many requests" ) ) )
			{
				throw new Error( "Too Many Requests — search rate limited. Please try again later." );
		 }
			else
			{
				const message = body && ( body.error || body.details || JSON.stringify( body ) ) || `${resp.status} ${resp.statusText}`;
				throw new Error( `Search failed: ${message}` );
		 }
	  }
	  const js = await resp.json();

	  // Normalize common shapes of Searx responses
	  let rawResults = [];
	  if ( Array.isArray( js.results ) && js.results.length )
		{
		 rawResults = js.results;
	  }
		else if ( js.categories && js.categories.general && Array.isArray( js.categories.general.results ) )
		{
		 rawResults = js.categories.general.results;
	  }
		else if ( Array.isArray( js ) )
		{
		 rawResults = js;
	  }
		else if ( Array.isArray( js.raw ) )
		{
		 rawResults = js.raw;
	  }
		else if ( js.results && Array.isArray( js.results ) )
		{
		 rawResults = js.results;
	  }

	  const normalized = rawResults.slice( 0, 8 ).map( r =>
		{
			return {
		 title: r.title || r.name || r.headers?.title || r.url || r.link || "",
		 snippet: r.content || r.snippet || r.excerpt || r.description || "",
		 link: r.url || r.link || r.source || r.original_url || "",
	  }
		});

	  return normalized;
	}

	// Main submit handler
	formEl.addEventListener( "submit", async function ( ev )
	{
	  ev.preventDefault();
	  const text = inputEl.value.trim();
	  if ( !text ) return;

	  // push user message immediately
	  pushMessage( "user", text );

	  // If includeSearch is checked -> do search first, show results, and include them in chat request
	  if ( includeSearchCheckbox.checked )
		{
		 // show searching placeholder and clear previous results
		 searchStatusEl.textContent = "Searching…";
		 searchResultsEl.innerHTML = "";
		 searchPanel.classList.remove( "hidden" );

		 try
			{
				const results = await doSearchFetch( text );
				lastSearchResults = results;
				renderSearchResults( results );
				searchStatusEl.textContent = `Found ${results.length} result${results.length === 1 ? "" : "s"}. These will be included in your request.`;
		 }
			catch ( err )
			{
			// friendly error for the user; DO NOT place raw JSON object into the assistant reply
				const friendly = err?.message || "Search failed";
				pushMessage( "assistant", friendly );
				// stop here — do not automatically call /api/chat when search failed
				inputEl.value = "";
				return;
		 }
	  }

	  // show thinking placeholder
	  pushMessage( "assistant", "Thinking..." );

	  // Build payload for /api/chat. If we've just done search (includeSearch checked), include snippets
	  const includeSearch = includeSearchCheckbox.checked ? lastSearchResults.slice( 0, 3 ) || [] : [];

	  const payload = {
		 messages: conversation.concat( [{ role: "user", content: text }] ),
		 includeSearch,
	  };

	  try
		{
		 const resp = await fetch( "/api/chat", {
				method: "POST",
				headers: {
			  "Content-Type": "application/json",
			  "Telegram-Data": WebApp?.initData || "",
				},
				body: JSON.stringify( payload ),
		 });

		 if ( !resp.ok )
			{
				const data = await resp.json().catch( () => { return {} });
				throw new Error( data.error || `${resp.status} ${resp.statusText}` );
		 }

		 const body = await resp.json();
		 // sanitize response text
		 const raw = body && ( body.response || "" ) || "";
		 const sanitized = sanitizeAssistantText( raw );

		 // replace the last 'Thinking...' assistant message with the real response
		 if ( conversation.length > 0 && conversation[conversation.length - 1].role === "assistant" && conversation[conversation.length - 1].content === "Thinking..." )
			{
				conversation = conversation.slice( 0, -1 );
		 }
		 conversation.push({ role: "assistant", content: sanitized });
		 renderMessages();
		 saveHistory();
	  }
		catch ( err )
		{
		 console.error( "Chat error", err );
		 // replace 'Thinking...' with friendly error
		 if ( conversation.length > 0 && conversation[conversation.length - 1].role === "assistant" && conversation[conversation.length - 1].content === "Thinking..." )
			{
				conversation = conversation.slice( 0, -1 );
		 }
		 conversation.push({ role: "assistant", content: `Error: ${err.message}` });
		 renderMessages();
		 saveHistory();
	  }
		finally
		{
		 inputEl.value = "";
	  }
	});

	// Fullscreen button
	fullscreenBtn.addEventListener( "click", () =>
	{
	  if ( !WebApp ) return;
	  if ( WebApp.isFullscreen ) WebApp.exitFullscreen();
	  else WebApp.requestFullscreen();
	});

	// initial load
	loadHistory();
})();
