# 💰 Expense Management System

## 📋 Overview
The **Expense Management System** is designed to streamline company reimbursement processes by automating expense submission, approval workflows, and reporting. It eliminates manual, error-prone methods and introduces multi-level approval, conditional rules, and OCR-based receipt scanning for a smooth, transparent experience.

---

## 🚀 Core Features

### 👤 Authentication & User Management
- **Auto Company & Admin Creation**: On first signup, a new company is created automatically based on the selected country’s currency.
- **Role Management**:
  - Admin: Create Managers and Employees, assign/change roles.
  - Manager: Approve/reject team expenses.
  - Employee: Submit and track expense claims.
- **Dynamic Role Relationships**: Define manager hierarchies for employees.

---

### 💼 Expense Submission (Employee)
Employees can:
- Submit expense claims with:
  - Amount (can differ from company currency)
  - Category, Description, Date
- Upload and scan receipts using **OCR** (auto-detects amount, date, category, merchant, etc.)
- View their full expense history (approved, rejected, pending).

---

### ✅ Approval Workflow (Manager/Admin)
- Supports **multi-level approvals** with ordered sequences (e.g., Manager → Finance → Director).
- Expenses automatically move to the next approver after current approval/rejection.
- Managers can:
  - View pending approvals.
  - Approve/Reject with comments.
  - Escalate as per company rules.

---

### ⚙️ Conditional Approval Rules
Define flexible approval logic:
- **Percentage Rule:** e.g., 60% of approvers must approve.
- **Specific Approver Rule:** e.g., If CFO approves → auto-approved.
- **Hybrid Rule:** Combination of percentage and specific approvers.
- Supports combining multi-level + conditional rules.

---

### 🔐 Role Permissions

| Role | Permissions |
|------|--------------|
| **Admin** | Manage company, users, roles, approval rules; view/override all expenses |
| **Manager** | Approve/reject team expenses, view in company currency, escalate |
| **Employee** | Submit expenses, view status, upload receipts |

---

## 🧠 Additional Integrations
- **OCR for Receipts:** Automatically extract expense data from uploaded images.
- **APIs Used:**
  - Country & Currency Data → [https://restcountries.com/v3.1/all?fields=name,currencies](https://restcountries.com/v3.1/all?fields=name,currencies)
  - Currency Conversion → [https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})

---

## 🧩 Mockups
- Excalidraw UI Wireframe: [View Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)

---

## 🏗️ Tech Stack (Suggested)
| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / Next.js, Tailwind CSS |
| **Backend** | Node.js / Express.js |
| **Database** | MongoDB / PostgreSQL |
| **Authentication** | JWT / OAuth 2.0 |
| **OCR Service** | Tesseract.js / Google Vision API |
| **Currency API** | ExchangeRate-API |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/expense-management.git
cd expense-management
