import WebToken from './webtoken.js';
import { urlencode } from './urlencode.js';


export class Collection {
  
  constructor(options={ }) {
    if(!options.host) {
      throw Error('Collection missing constructor parameter: host');
    }

    if(!options.uri) {
      throw Error('Collection missing constructor parameter: uri');
    }

    if(!options.type) {
      throw Error('Collection missing constructor parameter: type');
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

    this.attributes = {
      items: [ ],
      errors: [ ]
    }
  }

  get uri() {
    return `${this._host}/${this._uri}/${this._type}`;
  }

  headers() {
    let headers = _.assignIn({ }, this._headers);

    if(WebToken.data.token !== '') {
      headers['Authorization'] = 'Bearer ' + WebToken.authorization.token;
    }

    return headers;
  }

  async find(options) {
    let uri = this.uri;

    if(options) {
      if(options.query) {
        options.query = JSON.stringify(options.query);
      }
      if(options.sort) {
        options.sort = options.sort.join(',');
      }
      uri += urlencode(options);
    }

    let response = await fetch(uri, {
      method: 'GET',
      headers: this.headers(),
    });

    let data = await response.json();

    this.attributes.items = [ ];
    this.attributes.errors = [ ];

    if(data.errors) {
      this.attributes.errors = data.errors;
    } else {
      _.forEach(data.data, (item) => {
        this.attributes.items.push(item.attributes);
      });
    }
  }
}
