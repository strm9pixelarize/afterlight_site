// 共通モジュール: config を読んでヘッダー/フッターを組み立てる (本家 script.js 相当)
(function(){
  "use strict";
  function getJson(url){
    return fetch(url).then(function(r){ if(!r.ok) throw new Error(url); return r.json(); });
  }
  function buildHeader(site, header){
    var el = document.getElementById('site-header');
    if (!el) return;
    var nav = (header.nav || []).map(function(item){
      return '<a href="' + item.href + '">' + item.label + '</a>';
    }).join('');
    el.innerHTML =
      '<a class="site-logo" href="/">' +
        site.siteName.replace('#', '<span class="hash">#</span>') +
      '</a>' +
      '<nav class="site-nav">' + nav + '</nav>';
  }
  function buildFooter(site, footer){
    var el = document.getElementById('site-footer');
    if (!el) return;
    var links = (footer.links || []).map(function(item){
      return '<li><a href="' + item.href + '" target="_blank" rel="noopener">' + item.label + '</a></li>';
    }).join('');
    el.innerHTML =
      (links ? '<ul class="footer-links">' + links + '</ul>' : '') +
      '<p>' + footer.copyright + '</p>';
  }
  window.ALCommon = {
    load: function(){
      return Promise.all([
        getJson('/config/config.json'),
        getJson('/config/config_header.json'),
        getJson('/config/config_footer.json')
      ]).then(function(res){
        buildHeader(res[0], res[1]);
        buildFooter(res[0], res[2]);
        return { site: res[0], header: res[1], footer: res[2] };
      });
    },
    getJson: getJson
  };
})();
