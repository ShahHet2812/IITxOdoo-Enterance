Expense Management
Problem Statement
Companies often struggle with manual expense reimbursement processes that are time-consuming, error-prone, and lack transparency. This project aims to solve these issues by providing a streamlined and automated solution.

Core Features
Authentication & User Management

Automated Setup: On the first login/signup, a new company and an admin user are automatically created. The company's currency is set based on the selected country.


Admin Capabilities: Admins can create and manage employees and managers , assign roles , and define manager-employee relationships.



Expense Submission (Employee Role)

Submit Claims: Employees can submit expense claims with details like amount, category, description, and date.


View History: Employees can view their expense history with the status (Approved, Rejected).

Approval Workflow (Manager/Admin Role)

Multi-level Approvals: The system supports multi-level approval workflows. An expense is first approved by the employee's manager.



Sequential Approvals: Admins can define a sequence of approvers. The expense moves to the next approver only after the current one approves or rejects it.



Manager Actions: Managers can view expenses awaiting their approval and approve or reject them with comments.

Conditional Approval Flow

Flexible Rules: The application supports flexible approval rules, including:


Percentage Rule: An expense is approved if a certain percentage of approvers (e.g., 60%) approve it.


Specific Approver Rule: An expense is auto-approved if a specific person (e.g., the CFO) approves it.


Hybrid Rule: A combination of percentage and specific approver rules can be used.

Roles & Permissions
Role	Permissions
Admin	
Create company (auto on signup), manage users, set roles, configure approval rules, view all expenses, override approvals.

Manager	
Approve/reject expenses, view team expenses, escalate as per rules.

Employee	
Submit expenses, view their own expenses, check approval status.


Export to Sheets
Additional Features

OCR for Receipts: Employees can scan a receipt, and the system will use OCR to automatically create an expense with all the necessary details.

Tech Stack
Frontend
Next.js: A React framework for building server-side rendered and statically generated web applications.

React: A JavaScript library for building user interfaces.

TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Shadcn UI: A collection of reusable components built with Radix UI and Tailwind CSS.

Backend
Node.js & Express: A fast, unopinionated, minimalist web framework for Node.js.

MongoDB & Mongoose: An elegant MongoDB object modeling for Node.js.

JSON Web Token (JWT): For user authentication.

Bcrypt.js: A library for hashing passwords.

Multer: A Node.js middleware for handling multipart/form-data.

Tesseract.js: For OCR functionality to read data from receipts.

Running the Application
Frontend:
Navigate to the frontend directory: cd frontend

Install dependencies: npm install

Run the development server: npm run dev

Open http://localhost:3000 with your browser to see the result.

Backend:
Navigate to the backend directory: cd backend

Install dependencies: npm install

Start the server: npm start

The backend will be running on port 5000.
