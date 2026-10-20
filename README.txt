CCMS FRONTEND PROTOTYPE
========================

Technologies:
- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage (prototype only)

Files:
index.html                 Home page
register.html              Citizen registration
login.html                 Citizen/Admin login
citizen-dashboard.html     Citizen dashboard
complaint.html             Complaint registration
track.html                 Complaint tracking
admin-dashboard.html       Authority/admin dashboard
css/style.css              Complete styling
js/app.js                  Validation, localStorage and application logic

HOW TO RUN:
1. Extract/open the CCMS_Frontend folder.
2. Open index.html in a browser.
3. Register a citizen account.
4. Login as citizen.
5. Register a complaint.
6. Track the generated Complaint ID.
7. Logout.
8. Login as Admin/Authority.

ADMIN DEMO:
Email: admin@ccms.local
Password: Admin@123

DATA:
Users and complaints are stored in browser localStorage.
Photo evidence is stored as a base64 data URL for this prototype and is limited to about 1.2 MB.

SPRING BOOT + ORACLE LATER:
The current data functions are centralized near the top of js/app.js:
getUsers, saveUsers, getComplaints, saveComplaints, session.
When the backend is ready, replace localStorage operations with fetch()
calls to REST endpoints such as:
POST /api/auth/register
POST /api/auth/login
POST /api/complaints
GET  /api/complaints/{id}
GET  /api/citizens/{citizenId}/complaints
PUT  /api/complaints/{id}/status

Suggested backend flow:
Citizen -> HTML/CSS/JS -> Spring Boot REST API -> Oracle Database
                                     |
                                     -> Complaint status / authority management
