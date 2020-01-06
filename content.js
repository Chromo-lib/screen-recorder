// remove Ads right top section
var rightTopAds = document.getElementById('player-ads');
if (rightTopAds) {
  rightTopAds.style.display = 'none';
}

// close the ad banner on the video : class => video-ads ytp-ad-module
var vdBannerAds = document.querySelector('.video-ads');
if (vdBannerAds) {
  vdBannerAds.style.display = 'none';
}

// skip video Ad
var btnClick = (className) => {
  var button = document.querySelector(className);
  button.click();
}

setInterval(() => {
  btnClick(".ytp-ad-skip-button");
  btnClick(".ytp-ad-overlay-close-button");
}, 200);
