const OktaJwtVerifier = require('@okta/jwt-verifier');

const idTokenVerifier = new OktaJwtVerifier({
  clientId: process.env.OKTA_CLIENT_ID || '0oa5quc26xUOSFbTK357',
  issuer: process.env.OKTA_ISSUER || 'https://ft-test.okta.com/oauth2/aus1kd29jg5LHxiFu357',
});

export const authenticate = async (event) => {
  if (!event.headers || !event.headers.Authorization) {
    return false;
  }
  let token = event.headers.Authorization.split(' ')[1] || '';
  try {
    // it's important to not return immediately
    token = await idTokenVerifier.verifyAsPromise(token);
    return token;
  } catch (e) {
    return false;
  }
};
