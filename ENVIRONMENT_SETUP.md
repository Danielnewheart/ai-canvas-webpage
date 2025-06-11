# 環境變數設置指南

## 必要的 API 密鑰

### 1. Perplexity AI API Key（必需）

AI Canvas 使用 Perplexity AI 來提供智能對話和網路搜索功能。

#### 獲取步驟：
1. 前往 [Perplexity AI](https://www.perplexity.ai/) 官網
2. 註冊帳號並登入
3. 進入 [API 設置頁面](https://www.perplexity.ai/settings/api)
4. 點擊「Create API Key」創建新的 API 密鑰
5. 複製生成的 API 密鑰

#### 配置方法：
在專案根目錄創建 `.env.local` 文件：

```bash
# 在專案根目錄執行
touch .env.local
```

在 `.env.local` 文件中添加：
```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## 環境變數模板

創建 `.env.local` 文件並複製以下內容，然後填入您的實際值：

```env
# Required: Perplexity AI API Key for AI chat and web search functionality
# Get your API key from: https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Optional: Application URL (for production deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Additional API keys (if you plan to extend functionality)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Development settings
NODE_ENV=development
```

## 驗證設置

設置完成後，啟動開發服務器：

```bash
npm run dev
```

如果環境變數設置正確：
- 應用程式會在 http://localhost:3000 正常啟動
- AI 聊天功能會正常運作
- 網路搜索和引用功能會正常運作

## 常見問題

### API 密鑰無效
如果 AI 聊天無法工作，可能是：
- API 密鑰輸入錯誤
- API 密鑰已過期
- API 配額已用完

解決方法：
1. 檢查 `.env.local` 文件中的 API 密鑰是否正確
2. 在 Perplexity AI 控制台檢查 API 密鑰狀態
3. 確認 API 配額是否足夠

### 環境變數未載入
如果環境變數沒有生效：
1. 確認 `.env.local` 文件在專案根目錄
2. 重新啟動開發服務器
3. 檢查文件格式（不要有多餘的空格或引號）

## 生產部署

### Vercel
在 Vercel 控制台的 Environment Variables 部分添加：
- `PERPLEXITY_API_KEY`: 您的 Perplexity AI API 密鑰

### 其他平台
根據平台文檔添加相同的環境變數。

## 安全提醒

⚠️ **重要安全提醒**：
- 絕對不要將 API 密鑰提交到 Git 倉庫
- 不要在代碼中硬編碼 API 密鑰
- 定期輪換 API 密鑰
- 使用環境特定的 API 密鑰（開發/測試/生產） 