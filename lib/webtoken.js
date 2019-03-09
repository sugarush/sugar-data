class WebToken {

  constructor() {
      this._content_type = 'application/vnd.api+json';
      this._headers = {
        'Accept': this._content_type,
        'Content-Type': this._content_type
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
    if(typeof jwt_decode === 'function') {
      this.payload = jwt_decode(this.token);
    }
  }

  get headers() {
    return this._headers;
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

    let response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    })

    data = await response.json();

    if(data.errors) {
      this.token = null;
      this.payload = null;
      this.errors = data.errors;
      return null;
    } else {
      this.token = data.data.attributes.token;
      this.errors = [ ];
      return this.token;
    }
  }

  async deauthenticate() {
    this.token = null;
    this.payload = null;
    this.errors = [ ];
  }
}

export default (new WebToken());
