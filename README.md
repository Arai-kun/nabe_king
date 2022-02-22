# プロジェクト nabe_king様
## 連携サービス、ソフトウェア
- Amazon SP-API: 根幹
- Sendgrid: メール送信 GCP経由登録で一日400通まで
- Cloudinary: 画像アップロード&CDN配信 月25GBまで(ストレージ容量&CDNダウンロードサイズ含む)
- MongoDB: DB (サイズはサーバー環境依存)
- AWS EC2: ホストサーバー
- Google Domain: ドメイン取得およびレコード管理 -->デプロイではお名前.comを利用
- Unlayer: メールテンプレートエディター 完全OSS
***
## 残実装
- 新規登録時のメールの有効性認証 --> 済(仕様につき対応不要)
- 新規登録時のパスワード再入力 --> 済
- 新規登録からAmazon紐づけ時、既にそのAmazonが紐づけられているアカウントのチェック(SellerId)、複数の紐づけ禁止 
  </br> -> スケジューラーが全てのアカウントをなめる実装だと二重送信が起きる --> 済
- パスワードを忘れた(再発行) --> 済
- ロード時にスピナー表示 --> 済
- 各イベント検知でフラッシュメッセージ表示 --> 済(mat-snackbarに変更するかも)
- ユーザーに対して、メールテンプレートに組み込む注文データを挿入するのため方法をどう伝えるか(現在、{{orderId}}, {{name}}, {{itemName}}をサポート) --> 済
- アカウント削除 --> 済
- サーバー側にハードコーディングしているメタデータを別ソースに --> 済
- index.htmlのSEO系箇所整備 --> 済(簡易)
- webアプリのブランディング(アプリケーション名、ロゴ等)
- フォーム系コンポーネントロード時、一瞬ボタンが有効になる問題 --> 済(仕様につき対応不要)
- APIルーティング認証 --> 済
- メール作成画面で保存せず離脱しようとした場合、アラート表示 --> 済
### 2021/12/09 打ち合わせにおける追加仕様
- 問い合わせフォーム追加 --> 済
- 配信ターゲット系設定項目追加() --> 済
- メール登録時設定へ遷移 --> 済
- 初期アカウントロードメールテンプレート --> 済
- 配信時間除外設定項目追加 --> 済
- 初期画面はメール設定 --> 済
- マニュアル --> 済
### 2021/12/27 打ち合わせ
- 配信除外フォームの改行 --> 済
- MBAを自己配送に --> 済
- FBA 新品　チェック初期値 --> 済
***
## 拡張実装
- データのフィルター機能、検索機能
- メールテンプレートの管理(複数保持可能)
- オーダー毎にメールテンプレートの割り当て
- 各種設定機能
- UI, UX向上
- ブランディング向上
- 排他制御
- 
***
## 開発仕様
クライアント側はAngularにより作成し、そのビルド済み静的ファイルをサーバー側のExpress.js(Node.js)でホストしています。

同時に別ファイル(.js)として、主に注文データの更新およびメール配信を制御するプログラムが動いています。

webサーバーとしてのExpressは当該のプログラムをデーモン化し、nginxのリバースプロキシで実現しています。

留意点としては、サーバー側において、当該のAmazonのAPI(SP-API)のリクエストレート制限による待機時間です。注文データの更新とメール配信は別タスクとして動いており、前者は10秒おき、メール配信は15分おきで、それぞれのプロセスが発火します。

クライアント側は、Angular MaterialとFlexlayoutを使用して最低限のマテリアルデザインおよびUIを実装しています。Unlayerが提供するメールテンプレートエディターはnpmパッケージ化し、Angularとうまくマージしています。