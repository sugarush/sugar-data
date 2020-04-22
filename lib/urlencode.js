/**
 * Encodes a given object as `?key=value&...` parameters.
 * @param {object} object - The `object` to encode.
 * @return {string} The encoded parameters.
 */
export function urlencode(object) {
  let strings = [ ];
  for(let key in object) {
    strings.push(encodeURI(`${key}=${object[key]}`));
  }
  return `?${strings.join('&')}`;
}
