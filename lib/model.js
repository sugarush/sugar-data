import WebToken from './webtoken.js';
import { jsonapi } from './request.js';
import { SocketManager } from './socket.js';

/** The class representing a single document. */
export class Model extends SocketManager {

  /**
   * Create a Model with `host`, `uri` and `type`. If `pubsub` is
   * specified, the client's data will be kept in sync with the server
   * automatically.
   * @param {object} options - The options object.
   */
  constructor(options={ }) {
    super()

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
            this.client_id = json.id;
            if(WebToken.token) {
              this.authenticate();
            }
            if(this.id) {
              this.subscribe();
            }
            break;
          case "authenticated":
            this.authenticated = true;
            break;
          case "deauthenticated":
            this.authenticated = false;
            break;
          case "update":
            if(json.id === this.id) {
              await this.load();
            }
            break;
          case "delete":
            if(json.id == this.id) {
              this.clear();
            }
            break;
        }

      });
    }
  }

  /**
   * The model's `id` getter and setter.
   */
  get id() {
    return this.data.id;
  }

  set id(value) {
    this.data.id = value;
  }

  /**
   * The model's attributes getter and setter.
   */
  get attributes() {
    return this.data.attributes;
  }

  set attributes(attributes) {
    this.data.attributes = attributes;
  }

  /**
   * The model's full `uri`.
   */
  get uri() {
    let uri = `${this._host}/${this._uri}/${this._type}`;

    if(this.id) {
      uri = `${uri}/${this.id}`;
    }

    return uri;
  }

  /**
   * Truthy if the last request contained an error.
   */
  get errored() {
    return this.errors.length;
  }

  /**
   * Subscribe to the underlying document's changes using `socket`.
   * @param {object} socket - The socket to use.
   */
  subscribe(socket=null) {
    socket = socket || this.socket;

    if(!socket) {
      throw Error("No socket available. Make the model pubsub or provide a socket.");
    }

    socket.send(JSON.stringify({
      "action": "subscribe",
      "path": `/${this._type}/${this.id}`
    }));
  }

  /**
   * Unsubscribe from the underlying document's changes using `socket`.
   * @param {object} socket - The socket to use.
   */
  unsubscribe(socket=null) {
    socket = socket || this.socket;

    if(!socket) {
      throw Error("No socket available. Make the model pubsub or provide a socket.");
    }

    socket.send(JSON.stringify({
      "action": "unsubscribe",
      "path": `/${this._type}/${this.id}`
    }));
  }

  /**
   * Parse a JSONAPI structured object called `json` and update the
   * model.
   * @param {object} json - The data to parse.
   */
  parse(json) {
    this.errors = [ ];

    if(json.errors) {
      this.errors = json.errors;
    }

    this.data = json.data || {
      id: null,
      type: this._type,
      attributes: { }
    };
  }

  /**
   * Load the document based on it's `id`. If `fields` is specified,
   * only desired fields will be filled.
   * @param {object} options - The options object.
   * @returns {object} The model itself.
   */
  async load(options) {
    if(!this.id) {
      console.error("sugar-data: Tried to load a model without an ID.");
      return this;
    }

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

    return this;
  }

  /**
   * Save the document to the database.
   * @returns {object} The model itself.
   */
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

    return this;
  }

  /**
   * Delete the document from the database.
   * @returns {object} The model itself.
   */
  async delete() {
    if(!this.id) {
      console.error("sugar-data: Tried to delete a module without an ID.");
      return this;
    }

    let json = await jsonapi(this.uri, {
      method: 'DELETE'
    });

    this.clear();

    return this;
  }

  /**
   * Remove the model's attributes but keep the `id` and `type`.
   */
  empty() {
    this.parse({
      data: {
        id: this.id,
        type: this.type,
        attributes: { }
      }
    });
  }

  /**
   * Reset the model for reuse.
   */
  clear() {
    if(this.socket) {
      this.unsubscribe();
    }

    this.parse({
      data: {
        type: this.type,
        attributes: { }
      }
    });
  }

}
