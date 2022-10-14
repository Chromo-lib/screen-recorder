import createLink from "./createLink";

export default function downloadVideo(data, filename, type, vidExtension = 'webm') {
  const url = createLink(data, type);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${new Date().toISOString()}.${vidExtension}`;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);

  return url;
}