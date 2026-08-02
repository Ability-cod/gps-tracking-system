# 📍 Mzumbe GPS Location Tracking System

A web-based GPS field attachment supervision system for Mzumbe University.
Built with React.js, PHP, and PostgreSQL.

---

## 🧰 Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|---|---|---|
| XAMPP | 8.x+ | https://www.apachefriends.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download |
| pgAdmin | 4+ | https://www.pgadmin.org/download |
| Node.js | 18+ | https://nodejs.org |

---

## ⚙️ Backend Setup (PHP + PostgreSQL)

### 1. Place backend files

Copy the `backend/` folder into your XAMPP htdocs directory:

```
C:\xampp\htdocs\Mzumbe-GPS-PHP\backend\
```

### 2. Enable PostgreSQL extension

Open `C:\xampp\php\php.ini` and make sure this line is **uncommented**:

```ini
extension=pdo_pgsql
```

Restart Apache from XAMPP Control Panel after saving.

### 3. Configure database credentials

Open `backend/config/config.php` and update:

```php
define('DB_HOST',     'localhost');
define('DB_PORT',     '5432');
define('DB_NAME',     'mzumbe_gps');
define('DB_USER',     'postgres');
define('DB_PASSWORD', 'your_password');
define('JWT_SECRET',  'your_secret_key');
define('JWT_EXPIRY',  604800);
define('CLIENT_URL',  'http://localhost:5173');
```

### 4. Set up the database

Open **pgAdmin** and run these SQL scripts **in order**:

```
1. database.sql          ← Creates all tables
2. admin_setup.sql       ← Adds admin role constraint
3. add_phone.sql         ← Adds phone column
4. location_history.sql  ← Creates location history table
```

### 5. Create the default admin account

Visit this URL in your browser:

```
http://localhost/Mzumbe-GPS-PHP/backend/set_admin.php
```

You should see a success message. **Delete** `set_admin.php` after this step.

Default admin credentials:
```
Email:    admin@mzumbe.ac.tz
Password: Admin@2026
```

---

## 🖥️ Frontend Setup (React.js)

### 1. Navigate to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install additional packages

```bash
npm install axios react-router-dom leaflet react-leaflet jspdf
```

### 4. Start the development server

```bash
npm run dev
```

Open browser at:

```
http://localhost:5173
```

---

## 🚀 Running the System

1. Open XAMPP Control Panel → Start Apache
2. Make sure PostgreSQL service is running
3. Run `npm run dev` inside the frontend folder
4. Go to `http://localhost:5173` in Google Chrome

---

## 👥 User Roles

| Role | Created By |
|---|---|
| Admin | SQL script (`set_admin.php`) |
| Supervisor | Admin dashboard |
| Student | Admin dashboard |

> Students and Supervisors **cannot self-register**.
> All accounts are created by the Administrator.

---

## 📁 Project Structure

```
Mzumbe-GPS-PHP/
├── backend/
│   ├── config/          ← DB credentials and JWT settings
│   ├── controllers/     ← Request handlers (Auth, Admin, Location...)
│   ├── middleware/      ← JWT authentication guard
│   ├── models/          ← Database query methods
│   ├── routes/api.php   ← All API route mappings
│   ├── utils/           ← JWT and Response helpers
│   ├── index.php        ← App entry point + CORS headers
│   ├── database.sql
│   ├── admin_setup.sql
│   ├── add_phone.sql
│   └── location_history.sql
└── frontend/
    ├── src/
    │   ├── components/  ← React pages and UI components
    │   ├── context/     ← AuthContext (global user state)
    │   └── services/    ← API call functions (Axios)
    ├── package.json
    └── vite.config.js
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `ERR_CONNECTION_REFUSED` | Start Apache in XAMPP Control Panel |
| `pdo_pgsql` extension error | Uncomment `extension=pdo_pgsql` in `php.ini` and restart Apache |
| Wrong password on admin login | Re-run `set_admin.php` in the browser |
| Map not loading | Check internet connection — Leaflet needs OpenStreetMap |
| GPS not working | Use Google Chrome and allow location permission when prompted |
| Port 80 in use | Change Apache port to 8080 in `httpd.conf`, update `CLIENT_URL` |

---

## 🔐 Security Notes

- All API routes are protected with **JWT authentication**
- Passwords use bcrypt hashing (cost factor 12)
- All queries use PDO prepared statements to prevent SQL injection
- Always delete `set_admin.php` after creating the admin account

---

Developer: Ability M. Johnbosco
Programme: BSc. Information Technology and Systems — Mzumbe University, 2026
