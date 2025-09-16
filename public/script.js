// Initialize the Telegram Web App object
const { WebApp } = window.Telegram;

// Inform the Telegram client that the app is ready
WebApp.ready();

// --- UI Elements ---
const welcomeMessage = document.getElementById( "welcome-message" );
const promptInput = document.getElementById( "prompt-input" );
const responseArea = document.getElementById( "response-area" );
const userDataDiv = document.getElementById( "user-data" );

// --- Display User Info ---
// As per the docs, initDataUnsafe is available right away
if ( WebApp.initDataUnsafe.user )
{
	const { user } = WebApp.initDataUnsafe;
	welcomeMessage.innerText = `Welcome, ${user.first_name}!`;
	userDataDiv.innerHTML = `
        <p>ID: ${user.id}</p>
        <p>Username: @${user.username || "N/A"}</p>
    `;
}
else
{
	welcomeMessage.innerText = "Welcome!";
	userDataDiv.innerText = "Could not retrieve user data.";
}

// --- Main Button ---
// This is the main button at the bottom of the screen
WebApp.MainButton.setText( "Send Prompt" );
WebApp.MainButton.show();

// --- Event Handlers ---
WebApp.MainButton.onClick( async () =>
{
	const prompt = promptInput.value;
	if ( prompt.trim() === "" )
	{
		WebApp.showAlert( "Please enter a prompt!" );
		return;
	}

	// Show a loading indicator
	WebApp.MainButton.showProgress( false );
	WebApp.MainButton.disable();
	responseArea.innerHTML = "<p>Thinking...</p>";

	try
	{
		// This is where we will call our Vercel backend
		const response = await fetch( "/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// Send the validation data in a header
				"Telegram-Data": WebApp.initData,
			},
			body: JSON.stringify({ prompt }),
		});

		if ( !response.ok )
		{
			const errorData = await response.json();
			throw new Error( errorData.error || "Something went wrong" );
		}

		const data = await response.json();
		responseArea.innerHTML = `<p>${data.response}</p>`;

	}
	catch ( error )
	{
		WebApp.showAlert( `Error: ${error.message}` );
		responseArea.innerHTML = "<p>An error occurred. Please try again.</p>";
	}
	finally
	{
		// Hide loading indicator
		WebApp.MainButton.hideProgress();
		WebApp.MainButton.enable();
	}
});

// --- Theme Handling ---
// This syncs your app's theme with the user's Telegram theme
function applyTheme ()
{
	document.body.style.backgroundColor = WebApp.themeParams.bg_color || "#ffffff";
	document.body.style.color = WebApp.themeParams.text_color || "#000000";
}

WebApp.onEvent( "themeChanged", applyTheme );
applyTheme();