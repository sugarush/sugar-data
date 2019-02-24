import WebToken from '../lib/webtoken.js';

let expect = chai.expect;

describe('WebToken', () => {
  it('cannot authenticate without a url', async function() {
    try {
      await WebToken.authenticate();
    } catch {
      return null;
    }
    expect(false).not.to.be.false;
  });

  it('cannot authenticate without data', async function() {
    try {
      await WebToken.authenticate('http://invalid');
    } catch {
      return null;
    }
    expect(false).not.to.be.false;
  });

  it('can be logged out', function() {
    expect(WebToken.loggedIn).to.be.false;
  });

  it('can authenticate', async function() {
    let url = 'http://localhost:8080/v1/authentication';
    let data = {
      data: {
        attributes: {
          username: 'admin',
          password: 'admin'
        }
      }
    };
    await WebToken.authenticate(url, data);
    expect(WebToken.token).not.to.be.null;
  });

  it('can be logged in', function() {
    expect(WebToken.loggedIn).to.be.true;
  });

  it('can deauthenticate', async function() {
    await WebToken.deauthenticate();
    expect(WebToken.token).to.be.null;
  });

  it('can authenticate for the rest of the tests', async function() {
    let url = 'http://localhost:8080/v1/authentication';
    let data = {
      data: {
        attributes: {
          username: 'admin',
          password: 'admin'
        }
      }
    };
    await WebToken.authenticate(url, data);
    expect(WebToken.token).not.to.be.null;
  });
});
