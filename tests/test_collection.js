import WebToken from '../lib/webtoken.js';
import { Collection } from '../lib/collection.js';

let expect = chai.expect;

WebToken.url = 'http://localhost:8080/v1/authentication';
WebToken.attributes = {
  username: 'admin',
  password: 'admin'
};
WebToken.authenticate();

describe('Collection', () => {

  describe('cannot be constructed...', () => {

    it('without a host', (done) => {
      try {
        let collection = new Collection();
      } catch {
        done();
      }
      expect(true).to.be.false;
      done();
    });

    it('witout a uri', (done) => {
      try {
        let collection = new Collection({
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
        let collection = new Collection({
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

  describe('can be costructed...', () => {

    it('with a host, uri and type', () => {
      let collection = new Collection({
        host: 'http://localhost:8080',
        uri: 'v1',
        type: 'test'
      });
      expect(collection._host).to.equal('http://localhost:8080');
      expect(collection._uri).to.equal('v1');
      expect(collection._type).to.equal('test');
    });

  });

  it('can construct it\'s uri', () => {
    let collection = new Collection({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'test'
    });
    expect(collection.uri).to.equal('http://localhost:8080/v1/test');
  });

  it('can find data', async function() {
    let collection = new Collection({
      host: 'http://localhost:8080',
      uri: 'v1',
      type: 'users'
    });
    await collection.find();
    expect(collection.attributes.items[0].username).to.equal('admin');
  });

});
