import { jsonapi } from './request.js';

let content_type = 'application/vnd.api+json';

/** The WebToken singleton. */
class WebToken {

  constructor() {
      this.headers = {
        'Accept': content_type,
        'Content-Type': content_type
      };
      this._token = null;
      this.payload = null;
      this._interval = null;
      this.errors = [ ];
  }

  /**
   * Called when the token expires. Can be overwritten.
   */
  expired() {

  }

  /**
   * Will be a decoded `token` object if the
   * [jwt-decode](https://github.com/auth0/jwt-decode) is available, otherwise
   * it is an encoded as a string.
   */
  get token() {
    return this._token;
  }

  set token(token) {
    this._token = token;
    if(token) {
      if(typeof jwt_decode === 'function') {
        this.payload = jwt_decode(this.token);
        if(this.payload.exp && this.payload.iat) {
          let difference = this.payload.exp - this.payload.iat;
          let token_checked = this.payload.iat + 1;
          let token_expiration = this.payload.iat + difference;
          if(this._interval) {
            clearInterval(this._interval);
          }
          this._interval = setInterval(() => {
            if(token_checked >= token_expiration) {
              clearInterval(this._interval);
              this._interval = null;
              this._token = null;
              this.payload = null;
              this.expired()
            } else {
              token_checked += 1;
            }
          }, 1000);
        }
      }
    } else {
      this.payload = null;
    }
  }

  /**
   * `true` if **WebToken** is authenticated.
   */
  get authenticated() {
    if(this.token) {
      return true;
    }
    return false;
  }

  /**
   * `true` if the last request contained any errors.
   */
  get errored() {
    return this.errors.length;
  }

  /**
   * @param {string} uri - The `uri` to authenticate against.
   * @param {object} data - The unencoded object to send to the server.
   */
  async authenticate(uri, data) {
    if(!uri) {
      throw Error('WebToken.authenticate called without a uri.');
    }

    if(!data) {
      throw Error('WebToken.authenticate called without data.');
    }

    let json = await jsonapi(uri, {
      method: 'POST',
      body: data
    });

    if(json.errors) {
      this.token = null;
      this.errors = json.errors;
    } else {
      this.token = json.data.token;
      this.errors = [ ];
    }
  }

  /**
   * Refreshes the current token against a given `uri`.
   */
  async refresh(uri) {
    if(!uri) {
      throw Error('WebToken.refresh called with a uri.');
    }

    let json = await jsonapi(uri, {
      method: 'PATCH'
    });

    if(json.errors) {
      this.token = null;
      this.errors = json.errors;
    } else {
      this.token = json.data.token;
      this.errors = [ ];
    }
  }

  /**
   * Deauthenticates the WebToken singleton.
   */
  deauthenticate() {
    this.token = null;
    this.errors = [ ];
  }
}

export default (new WebToken());
