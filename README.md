# reurl

## 簡介

這個專案是一個使用 API 並且以 MySQL 資料庫為基礎的練習專案。目的是為了提升 MySQL 的使用技巧和經驗。

## 功能

*   API 相關功能
*   MySQL 資料庫操作

## 使用技術

*   Node.js
*   Express.js (API 框架)
*   MySQL

## 如何開始

1.  安裝 Node.js 和 MySQL。
2.  設定 MySQL 資料庫連線。
3.  執行 `npm install` 安裝相依套件。
4.  執行 `npm start` 啟動專案。

## API 說明

### 建立短網址

*   端點：`/create`
*   方法：GET
*   參數：
    *   `link`：原始網址 (必填)
    *   `id`：自訂 ID (選填)
*   範例：`/create?link=https://www.example.com&id=custom`

### 短網址重定向

*   端點：`/[ID]`
*   方法：GET
*   說明：將短網址重定向到原始網址。
*   範例：`/custom`
