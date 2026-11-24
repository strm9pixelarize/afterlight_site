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

// ローディング画面の制御: 最低3秒表示し、window の load が遅ければ終わるまで待つ。
// 10秒たっても終わらない場合は強制的に消す。ソフト遷移 (router.js) では再表示しない。
(function(){
  "use strict";
  var loader = document.getElementById('al-loader');
  if (!loader) return;
  var MIN_MS = 3000, MAX_MS = 10000;
  var loaded = false, finished = false;
  document.documentElement.style.overflow = 'hidden';
  function finish(){
    if (finished) return;
    finished = true;
    loader.classList.add('al-loader--done');
    setTimeout(function(){
      loader.style.display = 'none';
      document.documentElement.style.overflow = '';
    }, 800);
  }
  function tryFinish(){
    if (!loaded) return;
    var wait = Math.max(0, MIN_MS - performance.now());
    setTimeout(finish, wait);
  }
  if (document.readyState === 'complete') { loaded = true; tryFinish(); }
  else window.addEventListener('load', function(){ loaded = true; tryFinish(); });
  setTimeout(function(){ loaded = true; tryFinish(); }, MAX_MS);
})();
