# After#Light 公式サイト (v2)

公開先: **after-light.architectural-n.net**
本家サイトと同じ方式: 共通ヘッダー/フッター + config JSON 管理 + 紹介文は Markdown。

## 構成

```
html/
  index.html            Top の枠 (ヒーロー / Releases / About)
  album.html            リリース紹介の枠 (?release=<id>)
  config/
    config.json           サイト名・タグライン
    config_header.json    ナビ項目
    config_footer.json    フッター・リンク集
    config_members.json   Asahi / Akari 紹介・About本文
  js/
    common.js     config を読んでヘッダー/フッターを組立
    player.js     単一 <audio> の共通プレイヤー
    release.js    リリース一覧と紹介ページの描画
    marked.min.js Markdown パーサ (marked v12.0.2, MIT)
  releases/
    index.json          リリース一覧 (カード表示用)
    start-button/
      release.json      曲目・尺・歌詞
      intro.md          アルバム紹介文 ← 更新はここだけ
    saikidou-no-asa/
      release.json / intro.md
  audio/ images/ css/
conf.d/nginx.conf       CSP 付きサーバー設定
```

## 更新方法

- 紹介文を直す: 対象の `intro.md` を編集して push → ホストで pull
- メンバー紹介・リンク・ナビ: `config/*.json` を編集
- 新しいリリースを足す: `releases/<id>/` を作って release.json + intro.md を置き、
  `releases/index.json` と `config_header.json` に1行ずつ追加
- CSS/JS を変えたら html 内の `?v=` クエリを上げる (7日キャッシュ回避)

## デプロイ

Portainer Stack (nginx:alpine, 3105:80) が `html/` と `conf.d/` をマウント。
Cloudflare Tunnel の Public Hostname: after-light.architectural-n.net → localhost:3105。
