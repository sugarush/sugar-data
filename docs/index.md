# Model

```javascript
import { Model } from 'vendor/sugar-data/lib/model.js';

let user = new Model({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  id: 'some-id'
});

await user.load();
```

# Collection

## Find All

```javascript
import { Collection } from 'vendor/sugar-data/lib/collection.js';

let users = new Collection({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users'
});

await users.find();

for(let user of users.models) {
  console.log(user.attributes);
}
```

## Find Subset

```javascript
import { Collection } from 'vendor/sugar-data/lib/collection.js';

let users = new Collection({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users'
});

await users.find({ query: { created: { $gte: 'Date(2020-04-20)' } } });

for(let user of users.models) {
  console.log(user.attributes);
}
```

# Realtime

```javascript
import { Model } from 'vendor/sugar-data/lib/model.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let alpha = new Model({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  id: 'unique-id'
});

let beta = new Model({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  id: 'unique-id',
  pubsub: true
});

await beta.load();

alpha.attributes.some_field = 'value';

await alpha.save();

await sleep(500); // give the server and client more than enough time.

expect(beta.attributes.some_field).to.equal('value');
```
