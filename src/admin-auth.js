const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

module.exports = function adminAuth ( req, res, next )
{
	if ( !ADMIN_USER || !ADMIN_PASS )
	{
		return res.status( 404 ).end();
	}

	const auth = req.headers.authorization;
	if ( !auth || !auth.startsWith( "Basic " ) )
	{
		res.setHeader( "WWW-Authenticate", "Basic realm=\"Admin\"" );
		return res.status( 401 ).end( "Authentication required" );
	}

	const [user, pass] = Buffer
	.from( auth.split( " " )[1], "base64" )
	.toString()
	.split( ":" );

	if ( user === ADMIN_USER && pass === ADMIN_PASS )
	{
		return next();
	}

	res.setHeader( "WWW-Authenticate", "Basic realm=\"Admin\"" );
	return res.status( 401 ).end( "Invalid credentials" );
};
