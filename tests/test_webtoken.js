import WebToken from '../lib/webtoken.js';

let expect = chai.expect;

describe('WebToken', () => {
  it('can be logged out', function() {
    expect(WebToken.loggedIn).to.be.false;
  });

  it('can authenticate', async function() {
    WebToken.url = 'http://localhost:8080/v1/authentication';
    WebToken.attributes = {
      username: 'admin',
      password: 'admin'
    };
    await WebToken.authenticate();
    expect(WebToken.authentication.token).not.to.be.null;
  });

  it('can be logged in', function() {
    expect(WebToken.loggedIn).to.be.true;
  });
});
