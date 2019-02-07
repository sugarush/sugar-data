import WebToken from '../lib/webtoken.js';

let expect = chai.expect;

describe('WebToken', () => {
  it('can authenticate', async function() {
    WebToken.url = 'http://localhost:8080/v1/authentication';
    WebToken.attributes = {
      username: 'admin',
      password: 'admin'
    };
    await WebToken.authenticate();
    expect(WebToken.authentication.token).not.to.have.lengthOf(0);
  });
});
