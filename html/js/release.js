// リリース表示: releases/index.json と各 release.json / intro.md を描画する
(function(){
  "use strict";
  // index.html: リリースカード一覧 + About
  window.ALIndex = function(){
    ALCommon.getJson('releases/index.json').then(function(data){
      var wrap = document.getElementById('release-list');
      data.releases.forEach(function(rel){
        var card = document.createElement('article');
        card.className = 'release-card';
        card.innerHTML =
          '<a class="release-card-link" href="album.html?release=' + rel.id + '">' +
            '<img src="' + rel.cover + '" alt="">' +
            '<div><p class="album-label">' + rel.typeLabel + '</p>' +
            '<h3></h3><p class="release-lead"></p>' +
            '<p class="release-more">紹介と全曲再生 →</p></div>' +
          '</a>';
        card.querySelector('h3').textContent = rel.title;
        card.querySelector('.release-lead').textContent = rel.lead || '';
        wrap.appendChild(card);
      });
    });
    ALCommon.getJson('config/config_members.json').then(function(data){
      var wrap = document.getElementById('member-list');
      data.members.forEach(function(m){
        var div = document.createElement('div');
        div.className = 'member';
        div.innerHTML = '<h3></h3><p class="member-role"></p><p class="member-text"></p>';
        div.querySelector('h3').textContent = m.name;
        div.querySelector('.member-role').textContent = m.role;
        div.querySelector('.member-text').textContent = m.text;
        wrap.appendChild(div);
      });
      document.getElementById('about-note').textContent = data.about || '';
    });
  };

  // album.html: ?release=<id> の紹介 (intro.md) + 全曲リスト
  window.ALAlbum = function(){
    var id = new URLSearchParams(location.search).get('release') || 'start-button';
    var base = 'releases/' + id + '/';
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
