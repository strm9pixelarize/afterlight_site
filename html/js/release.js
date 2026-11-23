// リリース表示: /releases/ 配下のフォルダを自動検出し、各 release.json / intro.md を描画する
(function(){
  "use strict";
  function releaseCard(rel){
    var card = document.createElement('article');
    card.className = 'release-card';
    card.innerHTML =
      '<a class="release-card-link" href="/release/' + rel.id + '/">' +
        '<img src="' + rel.cover + '" alt="">' +
        '<div><p class="album-label">' + rel.typeLabel + '</p>' +
        '<h3></h3><p class="release-lead"></p>' +
        '<p class="release-more">紹介と全曲再生 →</p></div>' +
      '</a>';
    card.querySelector('h3').textContent = rel.title;
    card.querySelector('.release-lead').textContent = rel.lead || '';
    return card;
  }

  // index.html: 最新リリースだけ表示 + About
  window.ALIndex = function(){
    ALCommon.listReleases().then(function(list){
      var wrap = document.getElementById('latest-release');
      if (list.length) wrap.appendChild(releaseCard(list[0]));
    });
    ALCommon.getJson('/config/config_about.json').then(function(data){
      document.getElementById('about-note').textContent = data.about || '';
    });
  };

  // about.html: About 本文 + メンバー紹介
  window.ALAbout = function(){
    ALCommon.getJson('/config/config_about.json').then(function(data){
      document.getElementById('about-note').textContent = data.about || '';
      var wrap = document.getElementById('member-list');
      (data.members || []).forEach(function(m){
        var div = document.createElement('div');
        div.className = 'member';
        div.innerHTML = '<h3></h3><p class="member-role"></p><p class="member-text"></p>';
        div.querySelector('h3').textContent = m.name;
        div.querySelector('.member-role').textContent = m.role;
        div.querySelector('.member-text').textContent = m.text;
        wrap.appendChild(div);
      });
    });
  };

  // release.html: リリース一覧 (index.json の並び順 = 新しい順)
  window.ALReleases = function(){
    ALCommon.listReleases().then(function(list){
      var wrap = document.getElementById('release-list');
      list.forEach(function(rel){ wrap.appendChild(releaseCard(rel)); });
    });
  };

  // album.html: ?release=<id> の紹介 (intro.md) + 全曲リスト
  window.ALAlbum = function(){
    var seg = location.pathname.split('/').filter(Boolean);
    var id = (seg[0] === 'release' && seg[1]) ? seg[1] : (new URLSearchParams(location.search).get('release') || 'start-button');
    var base = '/releases/' + id + '/';
    ALCommon.getJson(base + 'release.json').then(function(rel){
      document.title = rel.title + ' | After#Light';
      document.getElementById('release-cover').src = rel.cover;
      document.getElementById('release-type').textContent = rel.typeLabel;
      document.getElementById('release-title').textContent = rel.title;
      var list = document.getElementById('tracklist');
      ALPlayer.buildList(list, rel.tracks, { numbered: rel.type === 'album', queue: rel.tracks });
      var playAll = document.getElementById('playAllBtn');
      if (rel.tracks.length > 1){
        playAll.hidden = false;
        playAll.addEventListener('click', function(){ ALPlayer.play(rel.tracks[0]); });
      }
      return fetch(base + 'intro.md');
    }).then(function(r){ return r.text(); })
      .then(function(md){
        document.getElementById('release-intro').innerHTML = marked.parse(md);
      })
      .catch(function(){
        document.getElementById('release-title').textContent = '見つかりませんでした';
      });
  };
})();
