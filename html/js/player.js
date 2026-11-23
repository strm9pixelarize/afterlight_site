// プレイヤー: 単一 <audio> を全トラックで共有する (cast と同じ方式)
// 使い方: ALPlayer.buildList(container, tracks, {numbered:true, queue:tracks})
(function(){
  "use strict";
  var audio, bar, barTitle, barToggle, barSeek, barTime;
  var current = null;
  var queue = [];

  function fmt(sec){
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec/60) + ':' + String(sec%60).padStart(2,'0');
  }
  function refresh(){
    document.querySelectorAll('.track').forEach(function(el){
      var on = current && el.dataset.file === current.file;
      el.classList.toggle('playing', !!on);
      var btn = el.querySelector('.track-play');
      if (btn) btn.textContent = (on && !audio.paused) ? '⏸' : '▶';
    });
    if (barToggle) barToggle.textContent = audio.paused ? '▶' : '⏸';
  }
  function play(item){
    if (current && current.file === item.file){
      if (audio.paused) audio.play(); else audio.pause();
      refresh();
      return;
    }
    current = item;
    audio.src = item.file;
    audio.play();
    bar.hidden = false;
    barTitle.textContent = item.title + ' — After#Light';
    refresh();
  }
  function buildList(container, tracks, opts){
    opts = opts || {};
    if (opts.queue) queue = opts.queue.slice();
    tracks.forEach(function(entry){
      var li = document.createElement('li');
      li.className = 'track';
      li.dataset.file = entry.file;
      var row = document.createElement('div');
      row.className = 'track-row';
      row.innerHTML =
        (opts.numbered && entry.track ? '<span class="track-no">' + entry.track + '</span>' : '') +
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
      row.querySelector('.track-play').addEventListener('click', function(){ play(entry); });
      row.querySelector('.track-lyrics-btn').addEventListener('click', function(){
        li.classList.toggle('lyrics-open');
      });
      container.appendChild(li);
    });
  }
  function init(){
    audio = document.getElementById('audio');
    bar = document.getElementById('player');
    barTitle = document.getElementById('playerTitle');
    barToggle = document.getElementById('playerToggle');
    barSeek = document.getElementById('playerSeek');
    barTime = document.getElementById('playerTime');
    barToggle.addEventListener('click', function(){
      if (!current) return;
      if (audio.paused) audio.play(); else audio.pause();
      refresh();
    });
    audio.addEventListener('play', refresh);
    audio.addEventListener('pause', refresh);
    audio.addEventListener('timeupdate', function(){
      if (audio.duration){
        barSeek.value = Math.floor(audio.currentTime / audio.duration * 1000);
        barTime.textContent = fmt(audio.currentTime);
      }
    });
    barSeek.addEventListener('input', function(){
      if (audio.duration) audio.currentTime = barSeek.value / 1000 * audio.duration;
    });
    audio.addEventListener('ended', function(){
      if (current && queue.length){
        var idx = queue.findIndex(function(e){ return e.file === current.file; });
        if (idx >= 0 && idx < queue.length - 1){ play(queue[idx+1]); return; }
      }
      refresh();
    });
  }
  window.ALPlayer = { init: init, buildList: buildList, play: play };
})();
