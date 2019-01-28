import WebToken from '../lib/webtoken.js';
import { Model } from '../lib/model.js';

let expect = chai.expect;

describe('WebToken', () => {
  it('can authenticate', async function() {
    WebToken.url = 'http://localhost:8080/v1/authentication';
    WebToken.attributes = {
      username: 'admin',
      password: 'admin'
    };
    expect(WebToken.data.token).to.have.lengthOf(0);
    await WebToken.authenticate();
    expect(WebToken.data.token).not.to.have.lengthOf(0);
  });
});

describe('Model', () => {
  describe('cannot be constructed...', () => {
    it('without a host', (done) => {
      try {
        let model = new Model();
      } catch {
        done();
      }
      expect(true).to.be.false;
      done();
    });

    it('witout a uri', (done) => {
      try {
        let model = new Model({
          host: 'http://localhost:8080'
        });
      } catch {
        done();
      }
      expect(true).to.be.false;
      done();
    });

    it('without a type', (done) => {
      try {
        let model = new Model({
          host: 'http://localhost:8080',
          uri: 'v1'
        });
      } catch {
        done();
      }
      expect(true).to.be.false;
      done();
    });
  });

  describe('can be constructed...', () => {
    it('with a host, uri and type', () => {
      let model = new Model({
        host: 'http://localhost:8080',
        uri: 'v1',
        type: 'test'
      });
      expect(model._host).to.equal('http://localhost:8080');
      expect(model._uri).to.equal('v1');
      expect(model._type).to.equal('test');
    });

    it('with attributes', () => {
      let model = new Model({
        host: 'http://localhost:8080',
        uri: 'v1',
        type: 'test',
        attributes: {
          field: 'value'
        }
      });
      expect(model.attributes).to.deep.equal({ errors: [ ], field: 'value' });
    });

    it('with an id', () => {
      let model = new Model({
        host: 'http://localhost:8080',
        uri: 'v1',
        type: 'test',
        id: 'test'
      });
      expect(model.attributes).to.deep.equal({ errors: [ ], _id: 'test' });
    });
  });

  it('can set jsonapi headers', () => {
    let content_type = 'application/vnd.api+json';
    let model = new Model({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'test'
    });
    let headers = model.headers();
    expect(headers['Accept']).to.be.equal(content_type);
    expect(headers['Content-Type']).to.be.equal(content_type);
  });

  it('can set it\'s id', () => {
    let model = new Model({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'test'
    });
    model.id = 'test';
    expect(model.attributes[model._id_attribute]).to.equal('test');
  });

  it('can get it\'s id', () => {
    let model = new Model({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'test'
    });
    model.id = 'test';
    expect(model.id).to.equal('test');
  });

  it('can construct it\'s uri', () => {
    let model = new Model({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'test',
      id: 'test'
    });
    expect(model.uri).to.equal('http://localhost:8080/v1/test/test');
  });

});
