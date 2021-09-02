function download (data, filename, type, vidExtension = 'webm') {
  let url = null;

  if (vidExtension === 'gif') {
    url = data;
  }
  else {
    const nblob = new Blob(data, { type });
    url = window.URL.createObjectURL(nblob);
    vidExtension = type.includes('webm') ? 'webm' : 'mp4'
  }

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