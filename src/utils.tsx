export function randomString(strLength: number) {
  const result = [];
  strLength = strLength || 5;
  const charSet = '0123456789';
  while (strLength--) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join('');
}
