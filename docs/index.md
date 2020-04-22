# Sugar Data

## Model

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

## Collection

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
