# StockPilot
Built a modern web-based app name StockPilot using HTML, CSS, JavaScript, and Firebase Authentication.  Implemented features inventory tracking, sales/POS system, invoice  generation,audit logs,email-based signup/login with verification, forgot  password recovery, and backup/restore functionality while maintaining a  responsive and user-friendly UI

````md
# 📦 StockPilot — Inventory Management System

StockPilot is a modern Inventory & Sales Management web application built using HTML, CSS, JavaScript, and Firebase Authentication.

It helps businesses manage:

- Inventory
- Products
- Sales
- Invoices
- Audit Logs
- Stock Alerts

with secure Firebase Login Authentication.

---

# 🚀 Features

✅ Firebase Email Authentication  
✅ Email Verification Login  
✅ Add / Edit / Delete Products  
✅ Inventory Management  
✅ Point of Sale (POS) System  
✅ Invoice Generation  
✅ Audit Logs  
✅ Low Stock Alerts  
✅ Dashboard Analytics  
✅ Persistent User Data  
✅ Responsive UI Design  
✅ Local Storage User-Based Data System  

---

# 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Firebase Authentication
- Firebase Firestore
- LocalStorage

---

# 📂 Project Structure

```bash
StockPilot/
│
├── index.html
├── style.css
├── app.js
├── firebase-auth.js
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md
````

---

# 🔥 Firebase Setup Guide

## 1. Create Firebase Project

Go to:

https://console.firebase.google.com/

Create a new project.

---

## 2. Enable Authentication

Firebase Console → Authentication → Get Started

Enable:

* Email/Password Authentication

---

## 3. Create Web App

Project Settings → Add App → Web App

Copy Firebase Config.

Example:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 4. Paste Config

Paste inside:

```js
firebase.initializeApp(firebaseConfig);
```

in your project.

---

# ▶️ How to Run

## Option 1 — VS Code Live Server

1. Install VS Code
2. Install Live Server Extension
3. Open Project Folder
4. Right Click `index.html`
5. Click `Open with Live Server`

---

## 🔐 Login Flow

1. User creates account
2. Verification email sent
3. User verifies email
4. User logs in
5. User data stored separately

---

# 💾 Data Storage

Data is stored using:

```js
localStorage
```

Each user gets separate storage:

```js
sp_products_USERID
sp_invoices_USERID
sp_audit_USERID
```

---

# 📸 Screens Included

* Dashboard
* Inventory
* POS
* Invoices
* Login System

---

# 🧑‍💻 Developer

## Vicky Kumar

📧 Email:
[mr.vickykumar2025@gmail.com](mailto:mr.vickykumar2025@gmail.com)

🔗 LinkedIn:
https://www.linkedin.com/in/vicky-kumar-0b7863311/

💻 GitHub:
https://github.com/mr-vickykumar2025

---

# 📄 License

This project is open-source and free to use for learning and educational purposes.

---

# ⭐ Future Improvements

* Cloud Firestore Database
* Export PDF Invoices
* Multi-user Admin Panel
* Analytics Charts
* Dark Mode
* Barcode Scanner
* Online Hosting

---

# 🙌 Support

If you like this project, give it a ⭐ on GitHub.

```
```
