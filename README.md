# 宜蘭縣資訊科技創意實作競賽系統

前端計分版（練習用途）。React + Vite + Blockly + Firebase + Cloudflare Pages。

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用 **Authentication → Google Sign-In**
4. 建立 **Firestore Database**（選 production mode）
5. 複製 Web App 設定

### 3. 設定環境變數

```bash
cp .env.example .env.local
# 填入你的 Firebase 設定
```

### 4. 部署 Firestore 安全規則

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # 選擇你的專案
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. 本地開發

```bash
npm run dev
```

---

## 部署到 Cloudflare Pages

1. 將此 repository 推到 GitHub
2. 前往 [Cloudflare Pages](https://pages.cloudflare.com/) → Create a project → Connect GitHub
3. 設定：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 在 **Environment variables** 加入所有 `VITE_FIREBASE_*` 變數
5. Deploy！

---

## Firebase Auth 授權網域

Firebase Console → Authentication → Settings → Authorized domains  
加入 `<你的專案>.pages.dev`

---

## 題目匯入

1. 以 Google 帳號登入（第一位登入者自動成為管理員）
2. 進入「管理」頁面
3. 貼上題目 JSON → 匯入

### 題目 JSON 格式

```json
{
  "id": "prob_001",
  "title": "題目名稱",
  "description": "題目描述",
  "inputFormat": "輸入格式",
  "outputFormat": "輸出格式",
  "examples": [
    { "input": "...", "output": "...", "explanation": "選填" }
  ],
  "cases": [
    {
      "groupTitle": "基本測資",
      "caseTitle": "測試案例 1",
      "input": "輸入（prompt 依序讀取每行）",
      "output": "期望輸出",
      "score": 25,
      "visibility": "public"
    },
    {
      "groupTitle": "隱藏測資",
      "caseTitle": "測試案例 2",
      "input": "...",
      "output": "...",
      "score": 25,
      "visibility": "hidden"
    }
  ]
}
```

---

## 架構說明

```
src/
├── components/
│   ├── Layout.tsx              # 頂部導覽列
│   └── editor/
│       ├── BlocklyEditor.tsx   # Blockly 積木工作區
│       ├── ProblemPanel.tsx    # 題目說明 + 公開測資
│       ├── RightPanel.tsx      # 自行測試 / 正式送出 / 紀錄
│       ├── GradePanel.tsx      # 評分結果顯示
│       └── CodeTabs.tsx        # JS / XML 程式碼檢視
├── lib/
│   ├── firebase.ts             # Firebase 初始化
│   ├── gradingEngine.ts        # 前端評分（呼叫 Worker）
│   ├── submissionService.ts    # 提交紀錄 Firestore 寫入
│   ├── leaderboardService.ts   # 排行榜更新
│   └── types.ts                # TypeScript 型別
├── pages/
│   ├── HomePage.tsx            # 題目列表
│   ├── ProblemPage.tsx         # 三欄式競賽介面
│   ├── LeaderboardPage.tsx     # 排行榜
│   └── AdminPage.tsx           # 管理後台（匯入/刪除題目）
├── stores/
│   ├── authStore.ts            # Firebase Auth + 使用者狀態
│   └── problemStore.ts         # 題目 Firestore 存取
└── workers/
    └── gradingWorker.ts        # Web Worker 執行 Blockly JS
```

---

## 注意事項

- 這是**前端計分版**，測資與答案可被進階使用者查看
- 適合教學練習、校內非正式活動
- 每題限制提交 10 次（保護 Firestore 配額）
- 建議競賽人數 100 人以內
- 若要正式縣賽，需升級為後端評分版
