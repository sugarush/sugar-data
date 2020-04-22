# Requests

```javascript
import { jsonapi } from 'vendor/sugar-data/lib/request.js';

let json = await jsonapi('https://api.server.com/v1/endpoint', {
  method: 'POST',
  body: {
    data: {
      attributes: {
        some: 'payload'
      }
    }
  }
});
```

# Authentication

```javascript
import WebToken from 'vendor/sugar-data/lib/webtoken.js';

await WebToken.authenticate('https://api.server.com/v1/authentication', {
  data: {
    attributes: {
      username: 'username',
      password: 'password'
    }
  }
});
```

# Model

## Loading

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

## Saving

```javascript
import { Model } from 'vendor/sugar-data/lib/model.js';

let user = new Model({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  id: 'some-id'
});

user.attributes.some_field = 'value'

await user.save();
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

## Query

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

## Paging

```javascript
import { Collection } from 'vendor/sugar-data/lib/collection.js';

let users = new Collection({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users'
});

await users.find({ page: { limit: 10, offset: 10 } });

for(let user of users.models) {
  console.log(user.attributes);
}
```
# Realtime

## Model

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

await sleep(100); // give the client more than enough time to subscribe.

alpha.attributes.some_field = 'value';

await alpha.save();

await sleep(100); // give the client more than enough time to subscribe.

expect(beta.attributes.some_field).to.equal('value');
```

## Collection

```javascript
import { Model } from 'vendor/sugar-data/lib/model.js';
import { Collection } from 'vendor/sugar-data/lib/collection.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let model = new Model({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  id: 'some-id'
});

let collection = new Collection({
  host: 'https://api.server.com',
  uri: 'v1',
  type: 'users',
  pubsub: true
});

await collection.find();

await sleep(100); // give the client more than enough time to subscribe.

model.attributes.some_field = 'value';

await model.save();

await sleep(100); // give the client more than enough time to subscribe.

expect(collection.index[model.id].attributes.some_field).to.equal('value');

```
