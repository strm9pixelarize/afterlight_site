// 共通モジュール: config を読んでヘッダー/フッターを組み立てる (本家 script.js 相当)
(function(){
  "use strict";
  function getJson(url){
    return fetch(url, {cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(url); return r.json(); });
  }
  function buildHeader(site, header, releases){
    var el = document.getElementById('site-header');
    if (!el) return;
    var logoImg = header.logoImage ? '<img class="site-logo-img" src="' + header.logoImage + '" alt="">' : '';
    var nav = (header.nav || []).map(function(item){
      if (item.accordion === 'releases'){
        var items = '';
        return '<span class="nav-accordion">' +
          '<a href="' + item.href + '">' + item.label + '</a>' +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-label="' + item.label + 'の一覧を開く">▾</button>' +
          '<span class="nav-panel"><span class="nav-panel-items">' + items + '</span>' +
            '<a class="nav-panel-all" href="' + item.href + '">すべてのリリースを見る</a>' +
          '</span></span>';
      }
      return '<a href="' + item.href + '">' + item.label + '</a>';
    }).join('');
    var logoText = header.logoImage ? '' :
      '<span>' + site.siteName.replace('#', '<span class="hash">#</span>') + '</span>';
    el.innerHTML =
      '<a class="site-logo" href="/">' + logoImg + logoText +
      '</a>' +
      '<nav class="site-nav">' + nav + '</nav>';
    // アコーディオン開閉 (外側クリック / Esc でも閉じる)
    var acc = el.querySelector('.nav-accordion');
    if (acc){
      var btn = acc.querySelector('.nav-toggle');
      btn.addEventListener('click', function(){
        var open = acc.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function(e){
        if (!acc.contains(e.target)){
          acc.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){
          acc.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
  function buildFooter(site, footer){
    var el = document.getElementById('site-footer');
    if (!el) return;
    var links = (footer.links || []).map(function(item){
      return '<li><a href="' + item.href + '" target="_blank" rel="noopener">' + item.label + '</a></li>';
    }).join('');
    el.innerHTML =
      (links ? '<ul class="footer-links">' + links + '</ul>' : '') +
      (footer.note ? '<p class="footer-note">' + footer.note + '</p>' : '') +
      '<p>' + footer.copyright + '</p>';
  }
  var releasesPromise = null;
  function listReleases(){
    if (releasesPromise) return releasesPromise;
    releasesPromise = fetch('/releases/', {cache:'no-cache'})
      .then(function(r){ if(!r.ok) throw new Error('listing'); return r.json(); })
      .then(function(entries){
        var dirs = entries.filter(function(e){ return e.type === 'directory'; }).map(function(e){ return e.name; });
        return Promise.all(dirs.map(function(name){
          return getJson('/releases/' + name + '/release.json')
            .then(function(rel){ rel.id = rel.id || name; return rel; })
            .catch(function(){ return null; });
        }));
      })
      .then(function(list){
        return list.filter(Boolean).sort(function(a, b){ return (b.date || '').localeCompare(a.date || ''); });
      });
    return releasesPromise;
  }
  window.ALCommon = {
    listReleases: listReleases,
    load: function(){
      return Promise.all([
        getJson('/config/config.json'),
        getJson('/config/config_header.json'),
        getJson('/config/config_footer.json')
      ]).then(function(res){
        buildHeader(res[0], res[1], []);
        buildFooter(res[0], res[2]);
        listReleases().then(function(releases){
          var slot = document.querySelector('.nav-panel-items');
          if (slot){
            slot.innerHTML = (releases || []).map(function(rel){
              return '<a href="/release/' + rel.id + '/">' + rel.title + '</a>';
            }).join('');
          }
        }).catch(function(){});
        return { site: res[0], header: res[1], footer: res[2] };
      });
    },
    getJson: getJson
  };
})();
