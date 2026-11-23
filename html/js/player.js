// プレイヤー: 単一 <audio> を全トラックで共有する (cast と同じ方式)
// 使い方: ALPlayer.buildList(container, tracks, {numbered:true, queue:tracks})
(function(){
  "use strict";
  var audio, bar, barTitle, barToggle, barSeek, barTime;
  var current = null;
  var queue = [];
  var repeatMode = 'off'; // 'off' | 'all' | 'one'
  var rate = 1;

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
  function load(item){
    current = item;
    audio.src = item.file;
    audio.playbackRate = rate;
    audio.play();
    bar.hidden = false;
    barTitle.textContent = item.title + ' — After#Light';
    refresh();
  }
  function play(item){
    if (current && current.file === item.file){
      if (audio.paused) audio.play(); else audio.pause();
      refresh();
      return;
    }
    load(item);
  }
  function step(dir){
    if (!current || !queue.length) return;
    if (dir < 0 && audio.currentTime > 3){ audio.currentTime = 0; return; }
    var idx = queue.findIndex(function(e){ return e.file === current.file; });
    if (idx < 0) return;
    load(queue[(idx + dir + queue.length) % queue.length]);
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
    // 簡易抑止: プレイヤーとトラック行での右クリック (名前を付けて保存) を無効化
    document.addEventListener('contextmenu', function(e){
      if (e.target.closest && e.target.closest('#player, .track')) e.preventDefault();
    });
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
      if (repeatMode === 'one' && current){
        audio.currentTime = 0;
        audio.play();
        return;
      }
      if (current && queue.length){
        var idx = queue.findIndex(function(e){ return e.file === current.file; });
        if (idx >= 0 && idx < queue.length - 1){ load(queue[idx+1]); return; }
        if (idx >= 0 && repeatMode === 'all'){ load(queue[0]); return; }
      }
      refresh();
    });
    // 追加コントロール (前/次・リピート・速度) を生成してバーに差し込む
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'player-btn';
    prevBtn.textContent = '◀◀';
    prevBtn.setAttribute('aria-label', '前の曲');
    prevBtn.addEventListener('click', function(){ step(-1); });
    bar.insertBefore(prevBtn, barToggle);
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'player-btn';
    nextBtn.textContent = '▶▶';
    nextBtn.setAttribute('aria-label', '次の曲');
    nextBtn.addEventListener('click', function(){ step(1); });
    barToggle.after(nextBtn);
    var repeatBtn = document.createElement('button');
    repeatBtn.type = 'button';
    repeatBtn.className = 'player-btn player-repeat';
    function syncRepeat(){
      repeatBtn.classList.toggle('on', repeatMode !== 'off');
      repeatBtn.textContent = repeatMode === 'one' ? '↻1' : '↻';
      repeatBtn.setAttribute('aria-label', 'リピート: ' + (repeatMode === 'all' ? 'アルバム' : repeatMode === 'one' ? '1曲' : 'オフ'));
    }
    repeatBtn.addEventListener('click', function(){
      repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
      syncRepeat();
    });
    syncRepeat();
    bar.appendChild(repeatBtn);
    var speedSel = document.createElement('select');
    speedSel.className = 'player-speed';
    speedSel.setAttribute('aria-label', '再生速度');
    ['0.5', '0.75', '1', '1.25', '1.5', '2'].forEach(function(v){
      var o = document.createElement('option');
      o.value = v;
      o.textContent = v + '×';
      if (v === '1') o.selected = true;
      speedSel.appendChild(o);
    });
    speedSel.addEventListener('change', function(){
      rate = parseFloat(speedSel.value) || 1;
      audio.playbackRate = rate;
    });
    bar.appendChild(speedSel);
  }
  window.ALPlayer = { init: init, buildList: buildList, play: play };
})();
