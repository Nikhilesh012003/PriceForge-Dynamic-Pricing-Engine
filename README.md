## 🚀 PriceForge — Dynamic Pricing Engine

PriceForge is a full-stack web application that enables **dynamic product pricing based on admin-defined rules**. The system allows administrators to manage products and pricing rules while users can browse products with automatically updated prices.

This project showcases **full-stack development using the MERN stack with a modern frontend built using Vite and TailwindCSS.**

---

## ✨ Features

### 👤 User Features

* Browse available products
* View dynamically calculated prices
* Responsive modern UI
* Fast frontend powered by Vite

### 🛠 Admin Features

* Admin authentication
* Add new products
* Create pricing rules for products
* Modify pricing strategies
* Manage product listings

### ⚙️ Dynamic Pricing Logic

Admins can define rules that dynamically affect product prices, enabling scenarios such as:

* Discount rules
* Demand-based pricing
* Promotional pricing adjustments
* Conditional price modifications

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Architecture

* MERN Stack (MongoDB, Express, React, Node)

---

## 📂 Project Structure

```
PriceForge-Dynamic-Pricing-Engine
│
├── client                     # Frontend (React + Vite + Tailwind)
│   │
│   ├── public                 # Static assets
│   ├── src
│   │   ├── api                # API request functions
│   │   ├── assets             # Images / icons
│   │   ├── components         # Reusable UI components
│   │   ├── Context            # React Context for state management
│   │   ├── pages              # Application pages
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # React entry point
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server                     # Backend (Node.js + Express)
│   │
│   ├── controllers            # Business logic
│   ├── middleware             # Authentication / custom middleware
│   ├── models                 # MongoDB schemas
│   ├── routes                 # API routes
│   └── server.js              # Backend entry point
│
└── README.md
```

## ⚙️ System Architecture

PriceForge follows a typical MERN architecture:

User / Admin Interface (React + Vite + Tailwind)
        ↓
REST API (Express.js)
        ↓
Business Logic (Controllers)
        ↓
MongoDB Database

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/PriceForge.git
cd PriceForge
```

---

### 2️⃣ Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in the **server folder**

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the project

Backend

```bash
cd server
npm run dev
```

Frontend

```bash
cd client
npm run dev
```

---

## 🧠 Use Cases

Dynamic pricing systems like PriceForge are commonly used in:

* E-commerce platforms
* Airline ticket pricing
* Hotel booking systems
* Ride sharing apps
* SaaS subscription models

---

## 📸 Future Improvements

* Analytics dashboard
* AI-based price optimization
* Role-based authentication

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Developed by **Nikhilesh Raut**


