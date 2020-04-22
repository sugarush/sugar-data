import WebToken from './webtoken.js';
import { urlencode } from './urlencode.js';

let content_type = 'application/vnd.api+json';

/**
 * The `jsonapi` function sets the `Accept` and `Content-Type` headers to
 * `application/vnd.api+json`. It encodes `options.body` parameter as a
 * JSON string with `JSON.stringify` as well as `options.params` as url encoded
 * query parameters.
 * @param {string} uri - The JSONAPI endpoint.
 * @param {object} options - The options object.
 * @returns {object} - A JSON formatted response.
 */
export async function jsonapi(uri, options) {

  if(!options) {
    options = { };
  }

  if(!options.method) {
    options.method = 'GET';
  }

  if(!options.headers) {
    options.headers = { };
  }

  _.assignIn(options.headers, {
    'Content-Type': content_type,
    'Accept': content_type
  });

  if(WebToken.token) {
    _.assignIn(options.headers, {
      'Authorization': `Bearer ${WebToken.token}`
    })
  }

  if(options.body) {
    options.body = JSON.stringify(options.body);
  }

  if(options.params) {
    uri += urlencode(options.params);
  }

  let response = await fetch(uri, options);

  return await response.json();

}
