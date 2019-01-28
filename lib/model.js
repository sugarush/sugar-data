import WebToken from './webtoken.js';

export class Model {

  constructor(options={ }) {
    if(!options.host) {
      throw Error('Model missing constructor parameter: host');
    }

    if(!options.uri) {
      throw Error('Model missing constructor parameter: uri');
    }

    if(!options.type) {
      throw Error('Model missing constructor parameter: type');
    }

    this._id_attribute = '_id';
    this._content_type = 'application/vnd.api+json';
    this._headers = {
      'Accept': this._content_type,
      'Content-Type': this._content_type
    };

    this._host = _.trim(options.host, '/');
    this._uri = _.trim(options.uri, '/');
    this._type = _.trim(options.type, '/');

    this.attributes = {
      errors: [ ]
    }

    if(options.attributes) {
      this.attributes = _.assignIn(this.attributes, options.attributes);
    }

    if(options.id) {
      this.id = options.id;
    }
  }

  get id() {
    return this.attributes[this._id_attribute];
  }

  set id(value) {
    this.attributes[this._id_attribute] = value;
  }

  get uri() {
    let uri = `${this._host}/${this._uri}/${this._type}`;

    if(this.id) {
      uri = `${uri}/${this.id}`;
    }

    return uri;
  }

  headers() {
    let headers = _.assignIn({ }, this._headers);

    if(WebToken.data.token !== '') {
      headers['Authorization'] = 'Bearer ' + WebToken.data.token;
    }

    return headers;
  }

  async read() {
    let response = await fetch(this.uri, {
      method: 'GET',
      headers: this.headers()
    })

    let data = await response.json();

    if(data.errors) {
      this.attributes.errors = data.errors;
    } else {
      _.assignIn(this.attributes, data.data.attributes);
      this.attributes.errors = [ ];
    }

  }

  async save() {
    let response = null;

    let data = {
      id: this.id,
      type: this.type,
      attributes: _.omit(this.attributes, this._id_attribute)
    };

    if(this.id) {

      let response = await fetch(this.uri, {
        method: 'PATCH',
        headers: this.headers(),
        body: JSON.stringify(data)
      });

    } else {

      let response = await fetch(this.uri, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data)
      });

    }

    data = await response.json();

    if(data.errors) {
      this.attributes.errors = data.errors;
    } else {
      _.assignIn(this.attributes, data.data.attributes);
      this.attributes.errors = [ ];
    }
  }

  async delete() {
    let response = await fetch(this.uri, {
      method: 'DELETE',
      headers: this.headers()
    });

    let data = await response.json();

    if(data.errors) {
      this.attributes.errors = data.errors;
    } else {
      for(let key in _.omit(this.attributes, ['errors'])) {
        this.attributes[key] = undefined;
      }
      this.attributes.errors = [ ];
    }
  }

}
