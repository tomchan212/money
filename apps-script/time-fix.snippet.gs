/**
 * Apps Script 時間修正（請合併到你已部署的 Code.production.gs / Code.tester.gs）
 *
 * 問題：addTransaction_ 用 Session.getScriptTimeZone() 記錄時間，
 *       與 iPhone／裝置本地時間不一致。
 *
 * 解法：前端 app.js 已會傳 time=HH:mm（裝置本地時間），
 *       後端改為優先使用 params.time。
 */

// 在 addTransaction_ 內，將：
//   const recordTime = formatTime_(new Date());
// 改為：
//   const recordTime = params.time ? formatTime_(params.time) : formatTime_(new Date());

// formatTime_ 已支援 "14:30" 格式，會原樣存入試算表。
// 修改後請重新部署「新版本」網頁應用程式。
