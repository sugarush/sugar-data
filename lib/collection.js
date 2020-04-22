import WebToken from './webtoken.js';
import { Model } from './model.js';
import { urlencode } from './urlencode.js';
import { jsonapi } from './request.js';
import { SocketManager } from './socket.js';


/** Class representing a collection of documents. */
export class Collection extends SocketManager {

  /**
   * Create a Collection with `host`, `uri` and `type`. If `pubsub` is
   * specified, the client's data will be kept in sync with the server
   * automatically.
   * @param {object} options  - An object containing `host`, `uri`, `type` and possibly `pubsub`.
   */
  constructor(options={ }) {
    super()

    if(!options.host) {
      throw Error('Collection missing constructor parameter: host');
    }

    if(!options.uri) {
      throw Error('Collection missing constructor parameter: uri');
    }

    if(!options.type) {
      throw Error('Collection missing constructor parameter: type');
    }

    this._host = _.trim(options.host, '/');
    this._uri = _.trim(options.uri, '/');
    this._type = _.trim(options.type, '/');

    this.index = { };
    this.models = [ ];
    this.offset = 0;
    this.limit = 0;
    this.total = 0;
    this.errors = [ ];

    if(options.pubsub) {
      const uri = `ws://${_.replace(this._host, 'http://', '')}/${this._uri}/${this._type}/pubsub`;

      this.socket = new WebSocket(uri);

      this.socket.addEventListener("message", async (event) => {

        let json = null;

        try {
          json = JSON.parse(event.data);
        } catch {
          throw Error(`Could not parse JSON data: ${event.data}`);
        }

        switch(json.action) {
          case "client-id":
            this.clientId = json.id;
            if(WebToken.token) {
              this.authenticate();
            }
            break;
          case "authenticated":
            this.authenticated = true;
            break;
          case "deauthenticated":
            this.authenticated = false;
            break;
          case "create":
            if(this.inclusive) {
              this.add_by_id(json.id);
            }
            break;
          case "update":
            if(json.id in this.index) {
              await this.index[json.id].load();
            }
            break;
          case "delete":
            if(json.id in this.index) {
              model = this.index[json.id];
              model.unsubscribe(this.socket);
              delete this.index[json.id];
              this.models = _.reject(this.models, (_model) => {
                return _model.id === model.id;
              });
            }
            break;
        }

      });
    }
  }

  /**
   * The collection's entire uri.
   */
  get uri() {
    return `${this._host}/${this._uri}/${this._type}`;
  }

  /**
   * True if the last request contained any errors.
   */
  get errored() {
    return this.errors.length;
  }

  /**
   * Add `model` to the collection. If the collection is in `pubsub` mode then
   * subscribe to the documents changes as well.
   * @param {model} model - The `model` to add.
   */
  add(model) {
    this.index[model.id] = model;
    this.models.push(model);

    if(this.socket) {
      model.subscribe(this.socket);
    }
  }

  /**
   * Remove `model` from the collection. If the collection is in `pubsub` mode
   * then unsubscribe from the document's changes.
   * @param {model} model - The `model` to remove.
   */
  remove(model) {
    if(this.socket) {
      model.unsubscribe(this.socket);
    }

    delete this.index[model.id];

    this.models = _.reject(this.models, function(_model) {
      return model.id == _model.id;
    });
  }

  /**
   * A convenience method to add a `model` to the collection by it's `id`.
   * @param {string} id - The `id` of the document to add.
   * @return {model} - The `model` of the document which was just added.
   */
  async add_by_id(id) {
    if(!id) {
      throw Error('Collection.add_by_id: No ID provided.')
    }

    const model = new Model({
      host: this._host,
      uri: this.uri,
      type: this._type,
      id: id
    });

    await this.model.load();

    this.add(model);

    return this.index[id];
  }

  /**
   * A convenience method to remove a `model` from the collection by it's `id`.
   * @param {string} id - The `id` of the model to remove.
   */
  async remove_by_id(id) {
    if(!id) {
      throw Error('Collection.remove_by_id: No ID provided.')
    }

    if(!(id in this.index)) {
      throw Error('Collection.remove_by_id: ID not found in index.')
    }

    model = this.index[id];

    this.remove(model);
  }

  /**
   * Parse a JSONAPI structured object called `json` and update the collection.
   * @param {object} json - The data to parse.
   */
  parse(json) {
    for(let model of this.models) {
      if(this.socket) {
        model.unsubscribe(this.socket);
      }
    }

    this.errors = [ ];
    this.index = { };
    this.models = [ ];
    this.offset = 0;
    this.limit = 0;
    this.total = 0;

    if(json.errors) {

      this.errors = json.errors;

    }

    _.forEach(json.data, (item) => {
      let model = new Model({
        host: this._host,
        type: this._type,
        uri: this._uri,
        id: item.id,
        attributes: item.attributes
      });

      this.add(model);

    });

    if(json.meta) {
      this.offset = json.meta.offset;
      this.limit = json.meta.limit;
      this.total = json.meta.total;
    }

  }

  /**
   * Find objects matching `query`.
   * @param {object} options - The options object.
   * @return {this} The collection itself.
   */
  async find(options) {
    if(options) {

      if(options.query) {
        options.query = JSON.stringify(options.query);
      }

      if(options.fields) {
        options.fields = JSON.stringify(options.fields);
      }

      if(options.sort) {
        options.sort = options.sort.join(',');
      }

      if(options.page) {

        if(options.page.offset) {
          options['page[offset]'] = options.page.offset;
          delete options.page['offset'];
        }

        if(options.page.limit) {
          options['page[limit]'] = options.page.limit;
          delete options.page['limit'];
        }

        delete options['page'];

      }
    }

    let json = await jsonapi(this.uri, {
      method: 'GET',
      params: options
    });

    this.parse(json);

    return this;
  }

  /**
   * Clear the collection removing all models.
   */
  clear() {
    this.parse({ data: [ ] });
  }
}
