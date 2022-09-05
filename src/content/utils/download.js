export default function download(data, filename, type, vidExtension = 'webm') {
  let url = null;

  const nblob = new Blob(data, { type });
  url = window.URL.createObjectURL(nblob);

  let link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${vidExtension}`;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);
}
