import WebToken from './webtoken.js';
import { jsonapi } from './request.js';

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

    this._host = _.trim(options.host, '/');
    this._uri = _.trim(options.uri, '/');
    this._type = _.trim(options.type, '/');

    this.parse({ });

    if(options.id) {
      this.id = options.id;
    }

    if(options.attributes) {
      _.assignIn(this.data.attributes, options.attributes);
    }
  }

  get id() {
    return this.data.id;
  }

  set id(value) {
    this.data.id = value;
  }

  get attributes() {
    return this.data.attributes;
  }

  get uri() {
    let uri = `${this._host}/${this._uri}/${this._type}`;

    if(this.id) {
      uri = `${uri}/${this.id}`;
    }

    return uri;
  }

  parse(json) {
    this.data = json.data || {
      id: null,
      type: this._type,
      attributes: { }
    };
    this.errors = json.errors || [ ];
  }

  async load(options) {
    if(options) {
      if(options.fields) {
        options.fields = JSON.stringify(options.fields);
      }
    }

    let json = await jsonapi(this.uri, {
      method: 'GET',
      params: options
    });

    this.parse(json)
  }

  async save() {
    let method = null;

    if(this.id) {
      method = 'PATCH';
    } else {
      method = 'POST';
    }

    let json = await jsonapi(this.uri, {
      method: method,
      body: { data: this.data }
    });

    this.parse(json)
  }

  async delete() {
    let json = await jsonapi(this.uri, {
      method: 'DELETE'
    });

    this.parse(json)
  }

}
