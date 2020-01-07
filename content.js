const elmts = document.querySelectorAll('.bg-white');
for (const el of elmts) {
  el.classList.remove('bg-white');
  el.classList.add('bg-dark');
}

const elmtsGray = document.querySelectorAll('.bg-gray');
for (const el of elmtsGray) {
  el.classList.remove('bg-gray');
  el.classList.add('bg-dark');
  console.log(el);

}


window.addEventListener('load', () => {
  const textGrayDark = document.querySelectorAll('.text-gray-dark');
  for (const el of textGrayDark) {
    el.classList.remove('text-gray-dark');
    el.classList.add('text-white');
    el.style.color = "#fff !important";
  }

  const linksGray = document.querySelectorAll('.link-gray-dark');
  for (const el of linksGray) {
    el.classList.remove('link-gray-dark');
    el.classList.add('text-white');
    el.style.color = "#fff";
  }

  const bgGrayDark = document.querySelectorAll('.bg-gray-light');
  for (const el of bgGrayDark) {
    el.classList.remove('bg-gray-light');
    el.classList.add('bg-dark');
  }

})
