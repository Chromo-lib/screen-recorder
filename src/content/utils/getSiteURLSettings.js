export default function getSiteURLSettings() {
  let browserName = null;
  if (/Chrome/gi.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) browserName = "chrome";
  if (/Edg/gi.test(navigator.userAgent)) browserName = "edge";
  return browserName + '://settings/content/siteDetails?site=' + location.origin;
}