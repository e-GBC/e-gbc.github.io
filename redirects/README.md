# SKILL: 自動分流 QR Code 產生器 (Device-Aware QR Code Redirect Generator)

## 📌 技能描述 (Description)
這個技能可以幫助使用者快速建立一個單一網址，當使用者掃描該網址的 QR Code 時，系統會自動判斷使用者的裝置（iOS、Android 或 PC），並跳轉到對應的下載頁面或網頁。網頁會自動推送到 GitHub Pages，並產出最終的網址與 QR Code。

## 📥 輸入參數 (Inputs)
當您需要呼叫此技能時，請提供以下四項資訊：
1. **轉址用途 (Purpose)**：例如 `GoogleChat安裝`、`Line官方帳號` 等（將用於網頁標題與建立對應的英文資料夾名稱）。
2. **iOS 連結 (iOS URL)**：App Store 的下載連結。
3. **Android 連結 (Android URL)**：Google Play 的下載連結。
4. **PC 連結 (PC URL)**：電腦版網頁的連結。

## ⚙️ 執行步驟 (Execution Steps)

1. **解析與轉換目錄名稱**：
   * 根據「轉址用途」，轉換出一個適合網址的英文/數字名稱（例如 `google-chat`）。
   * 確認目標路徑：`d:\Antigravity\e-GBC\e-gbc.github.io\redirects\[目錄名稱]\index.html`。

2. **建立 HTML 檔案**：
   * 將以下模板中的變數替換為使用者提供的資訊。
   * 將檔案寫入目標路徑。

   **HTML 模板**：
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>正在前往 {{轉址用途}} 頁面</title>
       <style>
           body { font-family: sans-serif; text-align: center; padding-top: 50px; color: #333; }
           .btn { display: inline-block; padding: 15px 25px; margin: 10px; background: #1a73e8; color: white; text-decoration: none; border-radius: 5px; }
       </style>
   </head>
   <body>
       <h2>正在為您的裝置開啟商店...</h2>
       <p>如果沒有自動跳轉，請點擊下方按鈕：</p>
       
       <a href="{{iOS連結}}" class="btn">iPhone 下載</a>
       <a href="{{Android連結}}" class="btn">Android 下載</a>
       <a href="{{PC連結}}" class="btn">網頁版 (PC)</a>

       <script>
           (function() {
               var userAgent = navigator.userAgent || navigator.vendor || window.opera;
               var iosUrl = "{{iOS連結}}";
               var androidUrl = "{{Android連結}}";
               var pcUrl = "{{PC連結}}";

               if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                   window.location.href = iosUrl;
               } else if (/android/i.test(userAgent)) {
                   window.location.href = androidUrl;
               } else {
                   window.location.href = pcUrl;
               }
           })();
       </script>
   </body>
   </html>
   ```

3. **部署至 GitHub (Git Push)**：
   * 在 `d:\Antigravity\e-GBC\e-gbc.github.io` 目錄下執行：
     `git add redirects/ ; git commit -m "Add [轉址用途] redirect page" ; git push`
   * 若有衝突則執行 `git pull --rebase ; git push`。

4. **產出結果 (Output)**：
   * 組合最終網址：`https://e-gbc.github.io/redirects/[目錄名稱]/`
   * 使用 QR Code API 產出圖片：
     `![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=[最終網址])`
   * 回覆使用者網址與 QR Code。

## 🎯 如何觸發 (Trigger)
直接對我說：「請幫我製作轉址 QR Code」並附上上述的 4 個輸入條件即可。
