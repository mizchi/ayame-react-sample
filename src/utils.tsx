const charSet = "0123456789";

export function randomString(strLength: number = 5) {
  return [...Array(strLength).keys()]
    .map(() => charSet.charAt(Math.floor(Math.random() * charSet.length)))
    .join("");
}
