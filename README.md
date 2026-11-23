# After#Light 公式サイト

公開先: **after_light.architectural-n.net**
1stアルバム『スタートボタン』全12曲 + シングル「再起動の朝」をフリーで聴ける静的サイト。

## 構成

```
index.html          トップページ
style/style.css
script/script.js    プレイヤー (単一 <audio>、アルバム通し再生対応)
data/tracks.json    曲目・尺・歌詞 (MP3のUSLTタグから生成)
images/             ジャケット2点 (MP3のAPICから抽出)
audio/              楽曲MP3 13ファイル (タグ整備済み完成版)
```

## デプロイ手順 (cast サイトと同じ方式)

1. ホストに配置: `/DATA/AppData/afterlight-site/` にこのフォルダ一式を置く
2. Portainer Stack (nginx:alpine 単独) を cast と同形式で作成
   - ポートは空きを確認して決定 (3104 は cast 使用中。3105 が候補だが要確認)
   - html 一式を `/usr/share/nginx/html` にマウント
3. Cloudflare Tunnel で `after_light.architectural-n.net` を Stack のポートへ向ける
4. CSP を付ける場合は cast の conf.d を流用し、`media-src 'self'` を許可すること (自サイトの MP3 再生に必要)

## 更新方法

- 曲の差し替え: `audio/` の MP3 を差し替え、`data/tracks.json` の該当曲の lyrics / length を合わせる
- CSS/JS を変えたら `index.html` の `?v=` クエリを上げる (7日キャッシュ回避、本家サイトの運用に合わせた)
