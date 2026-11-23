// ソフト遷移: 内部リンクではページ全体を読み直さず中身だけ差し替える。
// <audio> とプレイヤーは差し替え範囲の外にあるため、再生は止まらない。
(function(){
  "use strict";
  if (!window.history || !window.DOMParser) return;
  history.scrollRestoration = 'manual';

  function isPageUrl(u){
    if (u.origin !== location.origin) return false;
    if (/\.(mp3|json|png|jpe?g|webp|ico|css|js|md)$/i.test(u.pathname)) return false;
    return true;
  }
  // header と footer の間にある要素 (ヒーロー + main) が差し替え対象
  function region(doc){
    var body = doc.body;
    var head = body.querySelector('#site-header');
    var foot = body.querySelector('#site-footer');
    if (!head || !foot) return null;
    var nodes = [];
    var n = head.nextElementSibling;
    while (n && n !== foot){ nodes.push(n); n = n.nextElementSibling; }
    return nodes;
  }
  function swap(html){
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var nodes = region(doc);
    if (!nodes) return false;
    var foot = document.querySelector('#site-footer');
    region(document).forEach(function(n){ n.remove(); });
    nodes.forEach(function(n){ foot.parentNode.insertBefore(document.importNode(n, true), foot); });
    document.title = doc.title;
    var md = document.querySelector('meta[name="description"]');
    var nd = doc.querySelector('meta[name="description"]');
    if (md && nd) md.setAttribute('content', nd.getAttribute('content') || '');
    return true;
  }
  var navigating = false;
  function navigate(url, push){
    if (navigating) return;
    navigating = true;
    fetch(url, { credentials: 'same-origin' }).then(function(r){
      if (!r.ok) throw new Error('bad response');
      return r.text();
    }).then(function(html){
      if (push) history.pushState(null, '', url);
      if (!swap(html)){ location.href = url; return; }
      window.scrollTo(0, 0);
      if (window.ALDispatch) ALDispatch();
      if (window.ALPlayer && ALPlayer.refresh){
        ALPlayer.refresh();
        setTimeout(function(){ ALPlayer.refresh(); }, 500);
      }
      navigating = false;
    }).catch(function(){
      location.href = url;
    });
  }
  document.addEventListener('click', function(e){
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if (!isPageUrl(u)) return;
    if (u.pathname === location.pathname && u.search === location.search){
      if (u.hash) return;
      e.preventDefault();
      window.scrollTo(0, 0);
      return;
    }
    e.preventDefault();
    navigate(u.href, true);
  });
  window.addEventListener('popstate', function(){
    navigate(location.href, false);
  });
})();
