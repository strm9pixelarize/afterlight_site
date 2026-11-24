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
      fillAboutCard(data);
      var ps = data.paragraphs || [];
      document.getElementById('about-note').textContent = ps[0] || data.about || '';
    });
  };

  // About カードの共通部分 (アイコン/タイトル/タグライン) を config_about.json から埋める
  function fillAboutCard(data){
    var icon = document.getElementById('about-icon');
    if (icon && data.icon) icon.src = data.icon;
    var t = document.getElementById('about-title');
    if (t) t.textContent = data.title || '';
    var st = document.getElementById('about-subtitle');
    if (st) st.textContent = data.subtitle || '';
    var tg = document.getElementById('about-tagline');
    if (tg) tg.textContent = data.tagline || '';
  }

  // about.html: About 本文 + メンバー紹介
  window.ALAbout = function(){
    ALCommon.getJson('/config/config_about.json').then(function(data){
      fillAboutCard(data);
      var pw = document.getElementById('about-paragraphs');
      (data.paragraphs || []).forEach(function(text){
        var p = document.createElement('p');
        p.className = 'about-card-text';
        p.textContent = text;
        pw.appendChild(p);
      });
      var tw = document.getElementById('about-tags');
      (data.tags || []).forEach(function(tag){
        var sp = document.createElement('span');
        sp.className = 'about-tag';
        sp.textContent = tag;
        tw.appendChild(sp);
      });
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
      ALPlayer.buildList(list, rel.tracks, { numbered: rel.type === 'album', queue: rel.tracks, cover: rel.cover });
      var playAll = document.getElementById('playAllBtn');
      if (rel.tracks.length > 1){
        playAll.hidden = false;
        playAll.addEventListener('click', function(){ ALPlayer.play(rel.tracks[0]); });
      }
    }).catch(function(){
      document.getElementById('release-title').textContent = '見つかりませんでした';
    });
    // 紹介文は本体と切り離して読み込む (失敗してもタイトルを巻き込まない。1回だけ再試行)
    function loadIntro(attempt){
      fetch(base + 'intro.md').then(function(r){
        if (!r.ok) throw new Error('intro');
        return r.text();
      }).then(function(md){
        var el = document.getElementById('release-intro');
        el.innerHTML = window.marked ? marked.parse(md) : md;
      }).catch(function(){
        if (attempt < 1) setTimeout(function(){ loadIntro(attempt + 1); }, 600);
      });
    }
    loadIntro(0);
  };
})();
