// 起動処理: CSP (script-src 'self') でインラインスクリプトが使えないため外部化
(function(){
  "use strict";
  ALCommon.load();
  ALPlayer.init();
  // ページ描画の振り分け (ソフト遷移後に router.js からも呼ばれる)
  window.ALDispatch = function(){
    if (document.getElementById('latest-release')) ALIndex();
    if (document.getElementById('release-list')) ALReleases();
    if (document.getElementById('release-title')) ALAlbum();
    if (document.getElementById('member-list')) ALAbout();
  };
  ALDispatch();
})();
