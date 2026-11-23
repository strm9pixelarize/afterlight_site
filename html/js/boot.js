// 起動処理: CSP (script-src 'self') でインラインスクリプトが使えないため外部化
(function(){
  "use strict";
  ALCommon.load();
  ALPlayer.init();
  if (document.getElementById('release-list')) ALIndex();
  if (document.getElementById('release-title')) ALAlbum();
})();
