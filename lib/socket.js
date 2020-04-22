import WebToken from './webtoken.js';

/** The SocketManager class. */
export class SocketManager {

    constructor() {
      this.socket = null;
      this.clientId = null;
      this.authenticated = false;
    }

    /**
     * Authenticates a given `socket` or `this.socket`.
     * @param {object} socket - The `socket` to authenticate.
     */
    authenticate(socket=null) {
    socket = socket || this.socket;

    if(!socket) {
      throw Error("No socket available. Make the model pubsub or provide a socket.");
    }

    socket.send(JSON.stringify({
      "action": "authenticate",
      "path": `/${this._type}`,
      "token": WebToken.token
    }));
  }

  /**
   * Deauthenticates a given `socket` or `this.socket`.
   * @param {object} socket - The `socket` to deauthenticate.
   */
  deauthenticate(socket=null) {
    socket = socket || this.socket;

    if(!socket) {
      throw Error("No socket available. Make the model pubsub or provide a socket.");
    }

    socket.send(JSON.stringify({
      "action": "deauthenticate",
      "path": `/${this._type}`
    }));
  }

  /**
   * Triggers an `authenticated` or `deauthenticated` event.
   * @param {object} socket - The `socket` to check the status of.
   */
  status(socket=null) {
    socket = socket || this.socket;

    if(!socket) {
      throw Error("No socket available. Make the model pubsub or provide a socket.");
    }

    socket.send(JSON.stringify({
      "action": "status",
      "path": `/${this._type}`
    }));
  }
}
