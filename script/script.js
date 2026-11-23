(function(){
  "use strict";
  var audio = document.getElementById('audio');
  var player = document.getElementById('player');
  var playerTitle = document.getElementById('playerTitle');
  var playerToggle = document.getElementById('playerToggle');
  var playerSeek = document.getElementById('playerSeek');
  var playerTime = document.getElementById('playerTime');
  var queue = [];      // 再生順 (album tracks)
  var current = null;  // {file, title, el}
  var playAllMode = false;

  function fmt(sec){
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec/60) + ':' + String(sec%60).padStart(2,'0');
  }

  function setPlayingUI(){
    document.querySelectorAll('.track').forEach(function(el){
      var on = current && el.dataset.file === current.file;
      el.classList.toggle('playing', !!on);
      var btn = el.querySelector('.track-play');
      if (btn) btn.textContent = (on && !audio.paused) ? '⏸' : '▶';
    });
    playerToggle.textContent = audio.paused ? '▶' : '⏸';
  }

  function playTrack(item){
    if (current && current.file === item.file){
      if (audio.paused) audio.play(); else audio.pause();
      setPlayingUI();
      return;
    }
    current = item;
    audio.src = item.file;
    audio.play();
    player.hidden = false;
    playerTitle.textContent = item.title + ' — After#Light';
    setPlayingUI();
  }

  function buildTrackRow(entry, opts){
    var li = document.createElement('li');
    li.className = 'track';
    li.dataset.file = entry.file;
    var row = document.createElement('div');
    row.className = 'track-row';
    row.innerHTML =
      (opts.numbered ? '<span class="track-no">' + entry.track + '</span>' : '') +
      '<span class="track-title"></span>' +
      '<span class="track-len">' + fmt(entry.length) + '</span>' +
      '<button type="button" class="track-play">▶</button>' +
      '<button type="button" class="track-lyrics-btn">歌詞</button>';
    row.querySelector('.track-title').textContent = entry.title;
    var lyrics = document.createElement('div');
    lyrics.className = 'track-lyrics';
    lyrics.textContent = entry.lyrics || '（歌詞未収録）';
    li.appendChild(row);
    li.appendChild(lyrics);
    row.querySelector('.track-play').addEventListener('click', function(){
      playAllMode = !!opts.fromAlbum;
      playTrack(entry);
    });
    row.querySelector('.track-lyrics-btn').addEventListener('click', function(){
      li.classList.toggle('lyrics-open');
    });
    return li;
  }

  fetch('data/tracks.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var list = document.getElementById('tracklist');
      queue = data.album.tracks.slice();
      data.album.tracks.forEach(function(entry){
        list.appendChild(buildTrackRow(entry, {numbered:true, fromAlbum:true}));
      });
      if (data.single){
        var slot = document.getElementById('singleSlot');
        var ol = document.createElement('ol');
        ol.className = 'tracklist';
        ol.appendChild(buildTrackRow(data.single, {numbered:false, fromAlbum:false}));
        slot.appendChild(ol);
      }
      document.getElementById('playAllBtn').addEventListener('click', function(){
        if (queue.length){ playAllMode = true; playTrack(queue[0]); }
      });
    });

  playerToggle.addEventListener('click', function(){
    if (!current) return;
    if (audio.paused) audio.play(); else audio.pause();
    setPlayingUI();
  });
  audio.addEventListener('play', setPlayingUI);
  audio.addEventListener('pause', setPlayingUI);
  audio.addEventListener('timeupdate', function(){
    if (audio.duration){
      playerSeek.value = Math.floor(audio.currentTime / audio.duration * 1000);
      playerTime.textContent = fmt(audio.currentTime);
    }
  });
  playerSeek.addEventListener('input', function(){
    if (audio.duration) audio.currentTime = playerSeek.value / 1000 * audio.duration;
  });
  audio.addEventListener('ended', function(){
    if (playAllMode && current){
      var idx = queue.findIndex(function(e){ return e.file === current.file; });
      if (idx >= 0 && idx < queue.length - 1){ playTrack(queue[idx+1]); return; }
    }
    setPlayingUI();
  });
})();
