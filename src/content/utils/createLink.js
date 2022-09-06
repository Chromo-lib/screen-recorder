export default function createLink(data, type = 'video/webm') {
  return window.URL.createObjectURL(new Blob(data, { type }));
}
