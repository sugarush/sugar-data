class WebToken {

  constructor() {
      this._content_type = 'application/vnd.api+json';
      this.url = '';
      this.attributes = { };
      this.data = {
        token: '',
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
        this.data.errors = data.errors;
      } else {
        this.data.token = data.data.attributes.token;
      }
  }

}

export default (new WebToken());
