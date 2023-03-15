const {CognitoJwtVerifier} = require('aws-jwt-verify'); // eslint-disable-line no-unused-vars
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const JwtVerifier = CognitoJwtVerifier.create({
    userPoolId : COGNITO_USER_POOL_ID,
    tokenUse : "id",
    clientId : COGNITO_WEB_CLIENT_ID, 
})


const generatePolicy = (principalId, effect, resource) => {
    console.log('principalId: ' + principalId + ' effect: ' + effect + ' resource: ' + resource);
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [

        {
            Effect : effect,
            Action : 'execute-api:Invoke', // default action
            Resource : resource,
        }
    ];
    authResponse.policyDocument = policyDocument;
    authResponse.context = {
        foo: 'bar',
    }
    }
    console.log(JSON.stringify(authResponse));
    return authResponse;
}

exports.handler = async (event, context, callback) => {
// lambda function code goes here
var token = event.authorizationToken; 
console.log('token: ' + token);

try {
    const decoded = await JwtVerifier.verify(token);
    console.log('decoded: ' + decoded);
    callback(null, generatePolicy('user', 'Allow', event.methodArn));

} catch (error) {
    callback("Error: Invalid token " + token);

}

// validate the token


// switch (token) {
// case 'allow':
// callback(null, generatePolicy('user', 'Allow', event.methodArn));
// break;
// case 'deny':
// callback(null, generatePolicy('user', 'Deny', event.methodArn));
// break;
// default:
// callback("Error: Invalid token " + token);
// }
};