# repo2album
一個簡單易用的GitHub Pages相簿工具，支援自動掃描圖片目錄->動態渲染相簿->GitHub Pages靜態HTML頁面展示，fork此倉庫開箱即用\
Demo: [https://x200706.github.io/repo2album/](https://x200706.github.io/repo2album/)

## 功能特點
- **自動掃描**：透過GitHub Contents API自動讀取相簿和照片
- **動態渲染**：免手動維護檔案列表，新增/刪除照片後透過GitHub Contents API實現自動更新
- **響應式設計**：支援電腦、平板、手機等各種設備
- **圖片放大**：使用PhotoSwipe 5套件進行圖片展示，支援圖片放大、縮放、手勢滑動切換
- **惰性載入**：圖片惰性載入，提升頁面載入速度
- **簡單配置**：使用者fork此倉庫後只需要直接在JavaScript文件`gellery.js`中修改配置，就能完成所有設定

## 快速開始
### 1. 創建 GitHub 倉庫
1. 創建一個公開的 GitHub Repository
2. 啟用 GitHub Pages（Settings > Pages > Source 選擇 main 分支）
3. 等待 GitHub Pages 部署完成

### 2. 上傳照片
1. 在倉庫根目錄創建 `albums` 資料夾
2. 在 `albums` 文件夾下創建子資料夾，每個子資料夾代表一個相簿
3. 將照片上傳到對應的相簿資料夾中

範例：
```
albums/
├── 相簿1/
│   ├── photo1.jpg
│   └── photo2.jpg
└── 相簿2/
    ├── photo3.jpg
    └── photo4.jpg
```

### 3. 部署相簿

1. fork或下載本專案至你的倉庫
2. 修改 `assets/gallery.js` 文件開頭的設定（如：GitHub 用戶名和倉庫名稱）
3. 若為fork者，依照上文步驟啟用GitHub Pages功能
4. 等待 GitHub Pages 重新部署

### 4. 配置說明

打開 `assets/gallery.js` 文件，修改開頭的配置：

```javascript
const config = {
  // GitHub 倉庫信息
  repoOwner: '你的 GitHub 使用者名稱', // 請修改為你的 GitHub 用者名稱
  repoName: '你的 GitHub 倉庫名', // 請修改為你的 GitHub 倉庫名
  branch: 'main', // 部署分支，通常為 main
  
  // 相簿配置
  albumsPath: 'albums', // 相簿存放的資料夾名稱
  
  // 支援的圖片格式
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // API 請求配置
  apiBaseUrl: 'https://api.github.com',
  rawBaseUrl: 'https://raw.githubusercontent.com',
  
  // 外觀配置
  siteTitle: 'repo2album', // 網站標題
  siteDescription: '把Github倉庫秒變公開相簿' // 網站描述
};
```

## 技術細節

- **前端框架**：HTML5 + CSS3 + JavaScript (ES6+)
- **CSS 框架**：Tailwind CSS v3
- **圖片預覽套件**：PhotoSwipe 5
- **API**：GitHub Contents API

## 注意事項

1. GitHub API 有請求限制，每小時最多 60 次請求（未認證）
2. 請確保你的 GitHub 倉庫是公開的，否則 API 可能無法訪問
3. 圖片大小建議控制在合理範圍內，避免影響頁面載入速度
4. 因為沒有使用CDN，如果相簿中的照片數量很多，可能需要較長時間加載

## 故障排除

### 相簿載入失敗？

1. 檢查 `gallery.js` 中的 GitHub 倉庫資料是否正確
2. 確保你的 GitHub 倉庫是公開的
3. 確保 `albums` 資料夾存在且包含照片
4. 檢查瀏覽器控制台是否有錯誤信息

### 圖片無法顯示？

1. 檢查圖片格式是否在支援列表中（jpg、jpeg、png、webp）
2. 確保圖片文件大小合理，不要超過 GitHub 的限制
3. 檢查網絡連接是否正常

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個項目！

## 許可

MIT License
