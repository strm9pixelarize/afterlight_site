// プレイヤー: 単一 <audio> を全トラックで共有する (cast と同じ方式)
// 使い方: ALPlayer.buildList(container, tracks, {numbered:true, queue:tracks})
(function(){
  "use strict";
  var audio, bar, barTitle, barToggle, barSeek, barTime;
  var fullEl, pfArt, pfTitle, pfLyrics, pfSeek, pfTimeCur, pfTimeDur, pfToggle;
  var coverUrl = '';
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
    if (pfToggle) pfToggle.textContent = audio.paused ? '▶' : '⏸';
  }
  function load(item){
    current = item;
    audio.src = item.file;
    audio.playbackRate = rate;
    audio.play();
    bar.hidden = false;
    barTitle.textContent = item.title + ' — After#Light';
    refresh();
    syncFull();
  }
  function syncFull(){
    if (!pfTitle) return;
    pfTitle.textContent = current ? current.title : '—';
    pfLyrics.textContent = current ? (current.lyrics || '（歌詞未収録）') : '曲を再生すると、ここに歌詞が表示されます';
    pfLyrics.scrollTop = 0;
    pfArt.src = coverUrl || '/icon-afterlight-v6.png';
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
    if (opts.cover) coverUrl = opts.cover;
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
        if (pfSeek){
          pfSeek.value = Math.floor(audio.currentTime / audio.duration * 1000);
          pfTimeCur.textContent = fmt(audio.currentTime);
          pfTimeDur.textContent = fmt(audio.duration);
        }
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
    // 追加コントロール (前/次・リピート・速度) と全画面プレイヤー
    var repeatBtns = [];
    var speedSels = [];
    function syncRepeat(){
      repeatBtns.forEach(function(b){
        b.classList.toggle('on', repeatMode !== 'off');
        b.textContent = repeatMode === 'one' ? '↻1' : '↻';
        b.setAttribute('aria-label', 'リピート: ' + (repeatMode === 'all' ? 'アルバム' : repeatMode === 'one' ? '1曲' : 'オフ'));
      });
    }
    function makeBtn(text, label, fn){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'player-btn';
      b.textContent = text;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', fn);
      return b;
    }
    function makeRepeatBtn(){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'player-btn player-repeat';
      b.addEventListener('click', function(){
        repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
        syncRepeat();
      });
      repeatBtns.push(b);
      return b;
    }
    function makeSpeedSel(){
      var sel = document.createElement('select');
      sel.className = 'player-speed';
      sel.setAttribute('aria-label', '再生速度');
      ['0.5', '0.75', '1', '1.25', '1.5', '2'].forEach(function(v){
        var o = document.createElement('option');
        o.value = v;
        o.textContent = v + '×';
        if (v === '1') o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function(){
        rate = parseFloat(sel.value) || 1;
        audio.playbackRate = rate;
        speedSels.forEach(function(s){ if (s !== sel) s.value = sel.value; });
      });
      speedSels.push(sel);
      return sel;
    }
    bar.insertBefore(makeBtn('◀◀', '前の曲', function(){ step(-1); }), barToggle);
    barToggle.after(makeBtn('▶▶', '次の曲', function(){ step(1); }));
    bar.appendChild(makeRepeatBtn());
    bar.appendChild(makeSpeedSel());
    // 全画面プレイヤー本体
    fullEl = document.createElement('div');
    fullEl.className = 'player-full';
    fullEl.hidden = true;
    fullEl.innerHTML =
      '<button type="button" class="pf-close" aria-label="閉じる">✕</button>' +
      '<img class="pf-art" id="pfArt" alt="">' +
      '<p class="pf-title" id="pfTitle">—</p>' +
      '<p class="pf-artist">After#Light</p>' +
      '<div class="pf-lyrics" id="pfLyrics"></div>' +
      '<div class="pf-seekrow"><span class="pf-time" id="pfTimeCur">0:00</span>' +
      '<input class="player-seek pf-seek" id="pfSeek" type="range" min="0" max="1000" value="0" aria-label="シーク">' +
      '<span class="pf-time" id="pfTimeDur">0:00</span></div>' +
      '<div class="pf-controls"></div>';
    document.body.appendChild(fullEl);
    pfArt = fullEl.querySelector('#pfArt');
    pfTitle = fullEl.querySelector('#pfTitle');
    pfLyrics = fullEl.querySelector('#pfLyrics');
    pfSeek = fullEl.querySelector('#pfSeek');
    pfTimeCur = fullEl.querySelector('#pfTimeCur');
    pfTimeDur = fullEl.querySelector('#pfTimeDur');
    pfSeek.addEventListener('input', function(){
      if (audio.duration) audio.currentTime = pfSeek.value / 1000 * audio.duration;
    });
    var pfControls = fullEl.querySelector('.pf-controls');
    pfControls.appendChild(makeBtn('◀◀', '前の曲', function(){ step(-1); }));
    pfToggle = document.createElement('button');
    pfToggle.type = 'button';
    pfToggle.className = 'player-toggle pf-toggle';
    pfToggle.textContent = '▶';
    pfToggle.setAttribute('aria-label', '再生/停止');
    pfToggle.addEventListener('click', function(){
      if (!current) return;
      if (audio.paused) audio.play(); else audio.pause();
      refresh();
    });
    pfControls.appendChild(pfToggle);
    pfControls.appendChild(makeBtn('▶▶', '次の曲', function(){ step(1); }));
    pfControls.appendChild(makeRepeatBtn());
    pfControls.appendChild(makeSpeedSel());
    function openFull(){
      fullEl.hidden = false;
      document.body.style.overflow = 'hidden';
      syncFull();
      refresh();
    }
    function closeFull(){
      fullEl.hidden = true;
      document.body.style.overflow = '';
    }
    fullEl.querySelector('.pf-close').addEventListener('click', closeFull);
    bar.appendChild(makeBtn('⛶', '全画面プレイヤー', openFull));
    bar.addEventListener('click', function(e){
      if (e.target.closest && e.target.closest('button, select, input, a')) return;
      openFull();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !fullEl.hidden) closeFull();
    });
    syncRepeat();
    syncFull();
  }
  window.ALPlayer = { init: init, buildList: buildList, play: play };
})();
