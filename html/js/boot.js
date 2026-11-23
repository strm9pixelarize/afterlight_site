// 起動処理: CSP (script-src 'self') でインラインスクリプトが使えないため外部化
(function(){
  "use strict";
  ALCommon.load();
  ALPlayer.init();
  if (document.getElementById('latest-release')) ALIndex();
  if (document.getElementById('release-list')) ALReleases();
  if (document.getElementById('release-title')) ALAlbum();
})();
