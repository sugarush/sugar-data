import { jsonapi } from './request.js';

let content_type = 'application/vnd.api+json'

class WebToken {

  constructor() {
      this.headers = {
        'Accept': content_type,
        'Content-Type': content_type
      };
      this._token = null;
      this.payload = null;
      this.errors = [ ];
  }

  get token() {
    return this._token;
  }

  set token(token) {
    this._token = token;
    if(token) {
      if(typeof jwt_decode === 'function') {
        this.payload = jwt_decode(this.token);
      }
    } else {
      this.payload = null;
    }
  }

  get loggedIn() {
    if(this.token) {
      return true;
    }
    return false;
  }

  async authenticate(url, data) {
    if(!url) {
      throw Error('WebToken.authenticate called without a url.');
    }

    if(!data) {
      throw Error('WebToken.authenticate called without data.');
    }

    let json = await jsonapi(url, {
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

  async refresh(url) {
    if(!url) {
      throw Error('WebToken.refresh called with a url.');
    }

    let json = await jsonapi(url, {
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

  async deauthenticate() {
    this.token = null;
    this.errors = [ ];
  }
}

export default (new WebToken());
