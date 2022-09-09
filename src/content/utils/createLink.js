export default function createLink(data, type = 'video/webm') {
  const url = window.URL.createObjectURL(new Blob(data, { type }));
  return url + "#t=" + data.length;
}
