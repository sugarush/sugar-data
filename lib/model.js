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

    this._content_type = 'application/vnd.api+json';
    this._headers = {
      'Accept': this._content_type,
      'Content-Type': this._content_type
    };

    this._host = _.trim(options.host, '/');
    this._uri = _.trim(options.uri, '/');
    this._type = _.trim(options.type, '/');

    if(!options.id_attribute) {
      this._id_attribute = '_id';
    } else {
      this._id_attribute = options.id_attribute;
    }

    this.attributes = { };
    this.errors = [ ];

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

  get headers() {
    let headers = _.assignIn({ }, this._headers);

    if(WebToken.token) {
      headers['Authorization'] = 'Bearer ' + WebToken.token;
    }

    return headers;
  }

  async load() {
    let response = await fetch(this.uri, {
      method: 'GET',
      headers: this.headers
    })

    let data = await response.json();

    if(data.errors) {
      this.errors = data.errors;
    } else {
      _.assignIn(this.attributes, data.data.attributes);
      this.errors = [ ];
    }
  }

  async save() {
    let data = {
      data: {
        type: this._type,
        attributes: _.omit(this.attributes, [ this._id_attribute ])
      }
    };

    let response = null;

    if(this.id) {

      _.assignIn(data.data, { id: this.id });

      response = await fetch(this.uri, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });

    } else {

      response = await fetch(this.uri, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

    }

    data = await response.json();

    if(data.errors) {
      this.errors = data.errors;
    } else {
      _.assignIn(this.attributes, data.data.attributes);
      this.errors = [ ];
    }
  }

  async delete() {
    let response = await fetch(this.uri, {
      method: 'DELETE',
      headers: this.headers
    });

    let data = await response.json();

    if(data.errors) {
      this.errors = data.errors;
    } else {
      for(let key in this.attributes) {
        delete this.attributes[key];
      }
      this.errors = [ ];
    }
  }

}
