/* 旧URL /album.html?release=<id> と /release/album.html?release=<id> を
   新URL /release/<id>/ へ転送する */
(function(){
  var m = /[?&]release=([a-z0-9-]+)/.exec(location.search);
  if (m) location.replace('/release/' + m[1] + '/');
  else location.replace('/release/');
})();
