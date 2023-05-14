
var configAWS = {};
configAWS.region = process.env.AWS_REGION;
configAWS.accessKeyId = process.env.AWS_ACCESS_KEY;
configAWS.secretAccessKey = process.env.AWS_SECRET_KEY;

var AWS = require('aws-sdk');
const path = require("path");
const serveStatic = require('serve-static');

AWS.config.update( configAWS );
const lambda = new AWS.Lambda();

authenticate = ( req, res, next) => {

	const idToken = req.cookies[ process.env.ID_TOKEN_NAME ];
	const accessToken = req.cookies[ process.env.ACCESS_TOKEN_NAME ]

	const idParameters = {
		FunctionName: 'tokenValidator',
		Payload: JSON.stringify( idToken  )
	};

	const accessParameters = {
		FunctionName: 'tokenValidator',
		Payload: JSON.stringify( accessToken )
	};

  	authenticationCall = lambda.invoke( idParameters ).promise();
	authenticationCall
	.then( result => {

		if( result.Payload == 'false' || result.hasOwnProperty("FunctionError") ){
			throw new Error("User authentication failed (ID).");
		};

		return lambda.invoke( accessParameters ).promise()
	})
	.then( result => {
		
		if( result.Payload == 'false' || result.hasOwnProperty("FunctionError") ){
			throw new Error("User authentication failed (access).");
		};

		req.tokensValid = true;
		next();
	})
	.catch( err => {

		console.log(err)
		req.tokensValid = false;
		res.redirect("/login");
	});
};

exports.authenticate = authenticate;

exports.setupLoginAPI = app => {

    app.get("/login", (req, res) => {

        const loginFolder = serveStatic( path.join(__dirname + "/../views/signin") );
        const loginIndex = path.join(__dirname + "/../views/signin/index.html");
    
        app.use( loginFolder )
        res.sendFile( loginIndex );
    });

    app.get('/logout', (req, res) => {
    
        cookie = req.cookies;
        console.log("Logging out.")
    
        for (var prop in cookie) {

            if( !cookie.hasOwnProperty(prop) ) {
                continue;
            };
            res.cookie( prop, '', {expires: new Date(0)});
        }
    
        return res.json('/');
    });

    app.post('/setTokenCookie', (req, res) => {
    
        const idToken = req.body.idToken;
        const accessToken = req.body.accessToken;
    
        res.cookie( process.env.ID_TOKEN_NAME, idToken);
        res.cookie( process.env.ACCESS_TOKEN_NAME, accessToken)
    
        return res.json('/');
    });

    app.get('/', authenticate, (req, res) => {
    
        const platformPath = serveStatic( path.join(__dirname + "/../views/analysis-platform") );
        const platformIndex = path.join( __dirname + "/../views/analysis-platform/index.html");
    
        app.use( platformPath );
        res.sendFile( platformIndex );
    });

    return app;
};
