class WebToken {

  constructor() {
      this._content_type = 'application/vnd.api+json';
      this.url = '';
      this.attributes = { };
      this.authentication = {
        token: null,
        payload: null,
        errors: [ ]
      };
  }

  async authenticate() {
      let response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Accept': this._content_type,
          'Content-Type': this._content_type
        },
        body: JSON.stringify({
          data: {
            attributes: this.attributes
          }
        })
      })

      let data = await response.json();

      if(data.errors) {
        this.authentication.token = null;
        this.authentication.errors = data.errors;
      } else {
        this.authentication.token = data.data.attributes.token;
        if(typeof jwt_decode === 'function') {
          this.authentication.payload = jwt_decode(this.authentication.token);
        }
        this.authentication.errors = [ ];
      }
  }

  async deauthenticate() {
    this.authentication.token = null;
    this.authentication.errors = [ ];
  }
}

export default (new WebToken());
