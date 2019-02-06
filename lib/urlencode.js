export function urlencode(object) {
  let strings = [ ];
  for(let key in object) {
    strings.push(`${key}=${encodeURI(object[key])}`);
  }
  return `?${strings.join('&')}`;
}
