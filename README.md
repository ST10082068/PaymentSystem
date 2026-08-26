Link to video
https://youtu.be/ISYJalGI13U

# International Banking & SWIFT Payment System

## 📌 Project Overview
The **International Banking & SWIFT Payment System** is an internal financial application designed to enable seamless international money transfers. By integrating global SWIFT identification codes, the platform allows bank customers to securely transfer funds across borders while providing bank employees with a dedicated administrative portal to audit, verify, and approve transactions before execution.

---

## 🛠️ Architecture & Tech Stack

* **Front-End**: Vanilla JavaScript (ES6+), React, HTML5, CSS3 
* **Back-End**: Node.js & Express.js
* **Data Persistence**: In-memory data store (runtime persistence)
* **Security & Auth**: Custom session handling, input validation, and role-based portal access

---

## 👥 Team Roles & Contributions

| Member | Primary Role | Key Responsibilities |
| :--- | :--- | :--- |
| **Nabeel Van Niekerk** | Project Manager & Full-Stack Developer | Overall project coordination, task distribution, feature integration, security handling, and end-to-end portal stability[cite: 3]. |
| **Colby Coetzee** | Front-End Developer | Customer portal UI/UX, responsive dashboard layout, user registration, and login interfaces[cite: 3]. |
| **Umar Ahmed** | Back-End Developer & Security Specialist | Core back-end routing, payment processing logic, session security, and SSL/TLS configuration[cite: 3]. |
| **Matthew Van Niekerk** | Full-Stack Developer & Data Lead | In-memory data structures for accounts and payments, backend architecture, and error handling[cite: 3]. |
| **Nyasha Jani** | Full-Stack Developer & Security Research | Security protocol research, front-end and back-end integration support, and performance testing[cite: 3]. |

---

## 🚀 How to Run the Project

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** (Node Package Manager)
* **Visual Studio Code** (or your preferred editor)

---

### Step-by-Step Setup

1. **Unzip & Open**:
   * Extract the project zip folder to a location on your computer.
   * Open Visual Studio Code, click **File** > **Open Folder...**, and select the extracted project directory.

2. **Start the Front-End**:
   * Open a new terminal in VS Code (`Ctrl` + `` ` ``).
   * Navigate to the front-end directory and start the development server:
     ```bash
     cd payment_app
     npm run dev
     ```

3. **Start the Back-End**:
   * Open a **second** terminal window in VS Code.
   * Navigate to the server directory and start the back-end server:
     ```bash
     cd server
     npm start
     ```
   > ⚠️ **Note**: Both terminals must remain running simultaneously for the application to function.

4. **Launch Application**:
   * Click the local URL link (e.g., `http://localhost:...`) displayed in the front-end terminal output to open the app in your browser.

---

## 💻 Portal Features & Functionality

### 👤 Customer Portal
Designed for primary bank customers managing personal accounts and cross-border transactions.

* **Login & Registration**:
  * Authenticate with existing user credentials (email and password).
  * Direct links available to register a new customer account or switch to the Employee Portal login.
* **Customer Dashboard**:
  * Overview of linked bank accounts, current balances, and historic international payment records.
  * Direct navigation to initiate new international wire transfers.
* **International Payment Hub**:
  * Submit outbound international transactions using SWIFT bank identification codes and recipient account details.

---

### 🛡️ Employee Portal
Designed for compliance officers and bank administrators to review and safeguard payment streams.

* **Employee Dashboard**:
  * Real-time stream of all pending international transactions submitted by customers.
  * System-wide transaction log viewing payment history across the platform.
* **Payment Verification & Audit**:
  * Detailed inspection screen for individual transactions.
  * Administrative controls to **Approve** legitimate transfers or **Reject** suspicious transactions before sending them through the global SWIFT network.

---

## 🛡️ Key Security Features
* **Role-Based Access Control (RBAC)**: Separates customer interactions from employee administrative endpoints[cite: 3].
* **SWIFT Validation**: Ensures standard routing and banking compliance before transaction submission.
* **Audit Trail**: Maintains transaction state histories (Pending, Approved, Rejected) across the runtime lifecycle.
