# Codenames Online for Teams
![Deploy status](https://github.com/tagiiii/codename_game/actions/workflows/deploy.yml/badge.svg)

子ども向けオンライン支援や国語プログラムで使用する、連想型コミュニケーションゲームです。

## 🎯 特徴

- **コミュニケーション能力の向上**: チームで相談しながら推理を進める
- **国語的思考の育成**: 語彙・連想・抽象化のスキルを磨く
- **小学生〜中学生向け**: 分かりやすい日本語の単語セット
- **リアルタイム同期**: Firestore によるリアルタイムマルチプレイ
- **認証不要**: 面倒な登録なしですぐにプレイ開始

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd codename_game
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: codenames-online）
4. Google Analytics は任意で設定
5. プロジェクトを作成

### 3. Firestore データベースの作成

1. Firebase Console で作成したプロジェクトを開く
2. 左メニューから「Firestore Database」を選択
3. 「データベースの作成」をクリック
4. 「本番環境モードで開始」を選択
5. ロケーションは「asia-northeast1（東京）」を推奨
6. 「有効にする」をクリック

### 4. Firestore セキュリティルールの設定

1. Firestore Database の「ルール」タブを開く
2. 以下の内容をコピー＆ペースト（または `firestore.rules` ファイルの内容）:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.time < resource.data.expiresAt;
      allow delete: if false;
    }
  }
}
```

3. 「公開」をクリック

### 5. Firestore TTL（自動削除）の設定

1. Firestore Database の「インデックス」タブを開く
2. 「単一フィールド」タブを選択
3. 「フィールドの追加」をクリック
4. 以下を入力:
   - コレクション: `rooms`
   - フィールド: `expiresAt`
   - TTL を有効化: ✅
5. 「作成」をクリック

### 6. Web アプリの追加

1. Firebase Console のプロジェクト設定（⚙️アイコン）を開く
2. 「全般」タブで下にスクロール
3. 「アプリを追加」→「Web」を選択
4. アプリのニックネームを入力（例: Codenames Web App）
5. 「アプリを登録」をクリック
6. 表示される設定情報をメモ

### 7. 環境変数の設定

1. プロジェクトのルートに `.env` ファイルを作成:

```bash
cp .env.example .env
```

2. `.env` ファイルを開いて、Firebase の設定情報を入力:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 8. ローカルで実行

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてゲームをプレイできます。

## 🌐 GitHub Pages へのデプロイ

### 1. GitHub リポジトリの作成

1. GitHub で新しいリポジトリを作成
2. ローカルのコードを push:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. GitHub Secrets の設定

1. GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」を開く
2. 「New repository secret」をクリック
3. 以下の環境変数を1つずつ追加:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 3. GitHub Pages の有効化

1. リポジトリの「Settings」→「Pages」を開く
2. Source を「GitHub Actions」に変更
3. main ブランチに push すると自動デプロイされます

### 4. ベースパスの設定（必要な場合）

`vite.config.ts` の `base` オプションを確認してください。リポジトリ名が `codename_game` でない場合は、以下のように修正:

```typescript
base: process.env.GITHUB_ACTIONS ? '/your-repo-name/' : '/',
```

## 📖 ゲームルール

### 基本ルール

1. **チーム分け**: 赤チームと青チームに分かれます
2. **役割選択**: 各チームから1人がスパイマスターになります
3. **ゲーム開始**: 5×5のカードが表示されます
4. **ヒント**: スパイマスターが1つの単語と枚数のヒントを出します
5. **推理**: チームメイトがヒントを元にカードを推理します
6. **勝利条件**: 自チームのカードを全て当てたチームの勝利

### カードの種類

- **赤カード**: 赤チームのカード（9枚 or 8枚）
- **青カード**: 青チームのカード（9枚 or 8枚）
- **中立カード**: どちらのチームでもない（7枚）
- **暗殺者カード**: 引いたら即座に敗北（1枚）

## 🎮 使い方

### ルーム作成

1. ホーム画面で「新しいルームを作成」をクリック
2. 名前を入力
3. 単語セットと先攻チームを選択
4. 「ルームを作成」をクリック
5. 表示されたルームコードを友達に共有

### ルーム参加

1. ホーム画面で「ルームに参加」をクリック
2. 名前とルームコードを入力
3. 「ルームに参加」をクリック

### ロビー

1. チーム（赤 or 青）を選択
2. 役割（スパイマスター or 推理プレイヤー）を選択
3. ホストが「ゲーム開始」をクリック

### ゲームプレイ

- **スパイマスター**: 自チームのターンにヒントを入力
- **推理プレイヤー**: ヒントを元にカードをクリック
- **ターン終了**: 「ターンを終了（パス）」でターンを交代

## 🛠️ 技術スタック

- **フロントエンド**: React + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: CSS Modules
- **バックエンド**: Firebase Firestore
- **デプロイ**: GitHub Pages

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！バグ報告や機能要望は Issue で受け付けています。
