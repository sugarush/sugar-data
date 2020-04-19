import WebToken from './webtoken.js';

export class SocketManager {

    constructor() {
      this.socket = null;
      this.clientId = null;
      this.authenticated = false;
    }

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
