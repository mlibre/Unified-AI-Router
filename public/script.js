// Initialize the Telegram Web App object
const { WebApp } = window.Telegram;

// Inform the Telegram client that the app is ready
WebApp.ready();
WebApp.expand(); // Expand the app to full height

// --- UI Elements ---
const chatMessages = document.getElementById( "chat-messages" );
const chatForm = document.getElementById( "chat-form" );
const promptInput = document.getElementById( "prompt-input" );
const sendButton = document.getElementById( "send-button" );
const fullscreenBtn = document.getElementById( "fullscreen-btn" );
const enterIcon = document.getElementById( "fullscreen-enter-icon" );
const exitIcon = document.getElementById( "fullscreen-exit-icon" );

let conversationHistory = [];


/**
 * Renders the entire conversation history to the chat window.
 */
function renderMessages ()
{
	chatMessages.innerHTML = ""; // Clear existing messages
	conversationHistory.forEach( message =>
	{
		const messageDiv = document.createElement( "div" );
		messageDiv.classList.add( "message" );
		messageDiv.classList.add( message.role === "user" ? "user-message" : "assistant-message" );
		messageDiv.textContent = message.content;
		chatMessages.appendChild( messageDiv );
	});
	// Scroll to the latest message
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Adds a temporary "Thinking..." message to the UI.
 */
function showThinkingIndicator ()
{
	const thinkingDiv = document.createElement( "div" );
	thinkingDiv.id = "thinking-indicator";
	thinkingDiv.classList.add( "message", "assistant-message", "thinking-message" );
	thinkingDiv.textContent = "Thinking...";
	chatMessages.appendChild( thinkingDiv );
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Removes the "Thinking..." message from the UI.
 */
function hideThinkingIndicator ()
{
	const thinkingIndicator = document.getElementById( "thinking-indicator" );
	if ( thinkingIndicator )
	{
		thinkingIndicator.remove();
	}
}

/**
 * Saves the current conversation history to Telegram's CloudStorage.
 */
function saveHistory ()
{
	WebApp.CloudStorage.setItem( "chat_history", JSON.stringify( conversationHistory ), ( error, success ) =>
	{
		if ( error )
		{
			console.error( "Error saving history:", error );
		}
	});
}

/**
 * Loads conversation history from Telegram's CloudStorage.
 */
function loadHistory ()
{
	WebApp.CloudStorage.getItem( "chat_history", ( error, value ) =>
	{
		if ( error )
		{
			console.error( "Error loading history:", error );
			// Add a welcome message if history fails to load
			conversationHistory = [{ role: "assistant", content: "Hello! How can I help you today?" }];
			renderMessages();
			return;
		}
		if ( value )
		{
			conversationHistory = JSON.parse( value );
		}
		else
		{
			// If no history, start with a welcome message
			conversationHistory = [{ role: "assistant", content: "Hello! How can I help you today?" }];
		}
		renderMessages();
	});
}

// --- Event Handlers ---

chatForm.addEventListener( "submit", async ( event ) =>
{
	event.preventDefault();
	const prompt = promptInput.value.trim();

	if ( !prompt ) return;

	// Add user message to history and UI
	conversationHistory.push({ role: "user", content: prompt });
	renderMessages();
	saveHistory();
	promptInput.value = ""; // Clear input
	sendButton.disabled = true;

	showThinkingIndicator();

	try
	{
		// Send the whole conversation to the backend
		const response = await fetch( "/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Telegram-Data": WebApp.initData,
			},
			body: JSON.stringify({ messages: conversationHistory }),
		});

		if ( !response.ok )
		{
			const errorData = await response.json();
			throw new Error( errorData.error || "Something went wrong" );
		}

		const data = await response.json();

		// Add assistant response to history
		conversationHistory.push({ role: "assistant", content: data.response });
		saveHistory();

	}
	catch ( error )
	{
		WebApp.showAlert( `Error: ${error.message}` );
		// Optionally remove the last user message if the API call failed
		conversationHistory.pop();
	}
	finally
	{
		hideThinkingIndicator();
		renderMessages(); // Re-render to show the final assistant message
		sendButton.disabled = false;
	}
});

// --- NEW: Fullscreen Logic ---
if ( WebApp.isVersionAtLeast( "8.0" ) )
{
	fullscreenBtn.style.display = "flex"; // Show the button only if supported

	fullscreenBtn.addEventListener( "click", () =>
	{
		if ( WebApp.isFullscreen )
		{
			WebApp.exitFullscreen();
		}
		else
		{
			WebApp.requestFullscreen();
		}
	});

	// Listen for the fullscreen state change event to keep the UI in sync
	WebApp.onEvent( "fullscreenChanged", () =>
	{
		if ( WebApp.isFullscreen )
		{
			enterIcon.style.display = "none";
			exitIcon.style.display = "block";
		}
		else
		{
			enterIcon.style.display = "block";
			exitIcon.style.display = "none";
		}
	});
}


// --- Theme Handling ---
function applyTheme ()
{
	document.body.style.backgroundColor = WebApp.themeParams.bg_color || "#ffffff";
	document.body.style.color = WebApp.themeParams.text_color || "#000000";
}

WebApp.onEvent( "themeChanged", applyTheme );
applyTheme();

// --- Initial Load ---
loadHistory();