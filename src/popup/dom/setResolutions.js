import resolutions from "../utils/resolutions";

export default function setResolutions() {
  const resolution = document.getElementById('resolution');

  resolutions.forEach((rs, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = rs.width + 'x' + rs.height;
    if (rs.height === 720) option.selected = true;
    resolution.appendChild(option);
  });
}