import WebToken from '../lib/webtoken.js';
import { Collection } from '../lib/collection.js';
import { Model } from '../lib/model.js';

import { HOST } from "./settings.js";

let expect = chai.expect;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
          host: HOST
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
          host: HOST,
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
      let collection = new Collection({
        host: HOST,
        uri: 'v1',
        type: 'test'
      });
      expect(collection._host).to.equal(HOST);
      expect(collection._uri).to.equal('v1');
      expect(collection._type).to.equal('test');
    });

  });

  describe('can in pubsub...', () => {

    it('receive a client-id', async () => {
      let collection = new Collection({
        host: HOST,
        uri: 'v1',
        type: 'users',
        pubsub: true
      });
      await sleep(50);
      expect(collection.clientId).not.to.be.null;
    });

    it('authenticate', async () => {
      let collection = new Collection({
        host: HOST,
        uri: 'v1',
        type: 'users',
        pubsub: true
      });
      await sleep(50);
      expect(collection.authenticated).to.be.true;
    });

    it('deauthenticate', async () => {
      let collection = new Collection({
        host: HOST,
        uri: 'v1',
        type: 'users',
        pubsub: true
      });
      await sleep(50);
      expect(collection.authenticated).to.be.true;
      collection.deauthenticate();
      await sleep(50);
      expect(collection.authenticated).to.be.false;
    });
  });

  it('can construct it\'s uri', () => {
    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'test'
    });
    expect(collection.uri).to.equal('http://localhost:8001/v1/test');
  });

  it('can find all data', async function() {
    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });
    await collection.find();
    expect(collection.models[0].attributes.username).to.equal('admin');
  });

  it('can query data', async function() {
    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });
    await collection.find({ query: { username: 'admin' } });
    expect(collection.models[0].attributes.username).to.equal('admin');
  });

  it('can find data with specified fields', async function() {
    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });
    await collection.find({
      query: { username: 'admin' },
      fields: { username: 1 }
    });
    expect(collection.models[0].attributes.username).to.equal('admin');
    expect(collection.models[0].attributes.password).to.be.undefined;
  });

  it('can sort data', async function() {
    let gamma = new Model({
      host: HOST,
      uri: 'v1',
      type: 'users',
      attributes: {
        username: 'gamma',
        password: 'gamma',
        groups: [ 'gamma' ]
      }
    });

    await gamma.save();

    let delta = new Model({
      host: HOST,
      uri: 'v1',
      type: 'users',
      attributes: {
        username: 'delta',
        password: 'delta',
        groups: [ 'delta' ]
      }
    });

    await delta.save();

    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });

    await collection.find({ sort: [ 'username' ] });

    expect(collection.models[0].attributes.username).to.equal('admin');
    expect(collection.models[1].attributes.username).to.equal('delta');
    expect(collection.models[2].attributes.username).to.equal('gamma');

    await gamma.delete();
    await delta.delete();
  });

  it('can paginate data', async function() {
    let alpha = new Model({
      host: HOST,
      uri: 'v1',
      type: 'users',
      attributes: {
        username: 'alpha',
        password: 'alpha',
        groups: [ 'alpha' ]
      }
    });

    await alpha.save();

    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });

    await collection.find({
      sort: [ 'username' ],
      page: { limit: 1, offset: 0 }
    });

    expect(collection.models[0].attributes.username).to.equal('admin');

    await collection.find({
      sort: [ 'username' ],
      page: { limit: 1, offset: 1 }
    });

    expect(collection.models[0].attributes.username).to.equal('alpha');

    expect(collection.total).to.equal(2);

    await alpha.delete();
  });

  it('can clear it\'s data', async function() {
    let alpha = new Model({
      host: HOST,
      uri: 'v1',
      type: 'users',
      attributes: {
        username: 'alpha',
        password: 'alpha',
        groups: [ 'alpha' ]
      }
    });

    await alpha.save();

    let collection = new Collection({
      host: HOST,
      uri: 'v1',
      type: 'users'
    });

    await collection.find();

    expect(collection.models.length).not.to.equal(0);

    collection.clear()

    expect(collection.models.length).to.equal(0);

    await alpha.delete();
  });
});
