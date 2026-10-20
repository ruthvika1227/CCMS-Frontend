
/* CCMS FRONTEND DATA LAYER
   Spring Boot REST API integration
*/

const CCMS = (() => {

    const USERS_KEY = "ccms_users";
    const COMPLAINTS_KEY = "ccms_complaints";
    const SESSION_KEY = "ccms_session";

    const STATUSES = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved"
    ];

    // -------------------- LOCAL STORAGE --------------------

    const getUsers = () =>
        JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const getComplaints = () =>
        JSON.parse(localStorage.getItem(COMPLAINTS_KEY) || "[]");

    const saveUsers = u =>
        localStorage.setItem(USERS_KEY, JSON.stringify(u));

    const saveComplaints = c =>
        localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(c));

    const session = () =>
        JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    const setSession = s =>
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));

    const esc = s =>
        String(s ?? "").replace(
            /[&<>"']/g,
            m => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[m])
        );

    const today = () =>
        new Date().toISOString().slice(0, 10);

    const statusClass = s =>
        "status-" + s.toLowerCase().replaceAll(" ", "-");


    // -------------------- MESSAGE --------------------

    function message(id, text, type = "success") {

        const e = document.getElementById(id);

        if (e) {
            e.innerHTML =
                `<div class="message ${type}">${esc(text)}</div>`;
        }
    }


    // -------------------- ROLE CHECK --------------------

    function requireRole(role) {

        const s = session();

        if (!s || s.role !== role) {

            location.href = "login.html";

            return null;
        }

        return s;
    }


    // -------------------- LOGOUT --------------------

    function logout() {

        localStorage.removeItem(SESSION_KEY);

        location.href = "login.html";
    }


    // -------------------- NAVIGATION --------------------

    function initNav() {

        const t = document.querySelector(".nav-toggle");
        const n = document.querySelector(".navbar nav");

        if (t) {
            t.onclick = () =>
                n.classList.toggle("open");
        }
    }


    // ======================================================
    // REGISTER
    // ======================================================

    function initRegister() {

        initNav();

        const f =
            document.getElementById("registerForm");
            
        if (!f) {
            console.error("registerForm not found in register.html");
            return;
        }

        const regName = document.getElementById("regName");
        const regEmail = document.getElementById("regEmail");
        const regMobile = document.getElementById("regMobile");
        const regPassword = document.getElementById("regPassword");
        const regConfirm = document.getElementById("regConfirm");
        const regAddress = document.getElementById("regAddress");


        f.addEventListener("submit", e => {

            e.preventDefault();

            const name =
                regName.value.trim();

            const email =
                regEmail.value.trim().toLowerCase();

            const mobile =
                regMobile.value.trim();

            const pass =
                regPassword.value;

            const confirm =
                regConfirm.value;

            const address =
                regAddress.value.trim();


            if (
                !name ||
                !email ||
                !mobile ||
                !pass ||
                !confirm ||
                !address
            ) {

                return message(
                    "registerMessage",
                    "Please fill all required fields.",
                    "error"
                );
            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {

                return message(
                    "registerMessage",
                    "Please enter a valid email address.",
                    "error"
                );
            }


            if (!/^\d{10}$/.test(mobile)) {

                return message(
                    "registerMessage",
                    "Mobile number must contain exactly 10 digits.",
                    "error"
                );
            }


            if (pass.length < 6) {

                return message(
                    "registerMessage",
                    "Password must be at least 6 characters.",
                    "error"
                );
            }


            if (pass !== confirm) {

                return message(
                    "registerMessage",
                    "Passwords do not match.",
                    "error"
                );
            }


            const users = getUsers();


            if (users.some(u => u.email === email)) {

                return message(
                    "registerMessage",
                    "An account with this email already exists.",
                    "error"
                );
            }


            users.push({
                id: "U" + Date.now(),
                name,
                email,
                mobile,
                address,
                password: pass
            });


            saveUsers(users);


            message(
                "registerMessage",
                "Registration successful! Redirecting to login..."
            );


            setTimeout(() => {

                location.href = "login.html";

            }, 1500);

        });
    }

    // ======================================================
    // LOGIN
    // ======================================================

    function initLogin() {

        initNav();

        const form = document.getElementById("loginForm");
        const roleButtons = document.querySelectorAll(".role");
const roleInput = document.getElementById("loginRole");

roleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        roleButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        if (roleInput) {
            roleInput.value = button.dataset.role;
        }
    });
});

        if (!form) {
            console.error("loginForm not found in login.html");
            return;
        }

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const emailInput =
                document.getElementById("loginEmail");

            const passwordInput =
                document.getElementById("loginPassword");

            const roleInput =
                document.getElementById("loginRole");

            const email = emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const role = roleInput
                ? roleInput.value
                : "citizen";

            if (!email || !password) {

                message(
                    "loginMessage",
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }

            // Authority login
            // Change these credentials to match your project
            if (role === "admin") {

                if (
                    email === "admin@ccms.local" &&
                    password === "Admin@123"
                ) {

                    setSession({
                        role: "admin",
                        email: email,
                        name: "CCMS Authority"
                    });

                    message(
                        "loginMessage",
                        "Authority login successful!"
                    );

                    setTimeout(function () {
                        location.href = "admin-dashboard.html";
                    }, 800);

                } else {

                    message(
                        "loginMessage",
                        "Invalid authority login details.",
                        "error"
                    );
                }

                return;
            }

            // Citizen login
            const users = getUsers();

            const user = users.find(function (u) {
                return (
                    u.email === email &&
                    u.password === password
                );
            });

            if (!user) {

                message(
                    "loginMessage",
                    "Invalid email or password. Please register first.",
                    "error"
                );

                return;
            }

            setSession({
                role: "citizen",
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            });

            message(
                "loginMessage",
                "Login successful! Redirecting..."
            );

            setTimeout(function () {
                location.href = "citizen-dashboard.html";
            }, 800);

        });
    }


    // ======================================================
    // CURRENT USER
    // ======================================================

    function getCurrentUser() {

        const currentSession = session();

        if (!currentSession) {
            return null;
        }

        return currentSession;
    }


    // ======================================================
    // CHECK LOGIN STATUS
    // ======================================================

    function checkLogin() {

        const currentSession = session();

        if (!currentSession) {
            location.href = "login.html";
            return false;
        }

        return true;
    }


    // ======================================================
    // DISPLAY CURRENT USER NAME
    // ======================================================

    function displayUserName() {

        const currentSession = session();

        const nameElement =
            document.getElementById("userName");

        if (nameElement && currentSession) {
            nameElement.textContent =
                currentSession.name || "Citizen";
        }
    }

    // ======================================================
    // COMPLAINT REGISTRATION
    // ======================================================

    function initComplaintForm() {

        initNav();

        const form = document.getElementById("complaintForm");

        if (!form) {
            console.error("complaintForm not found.");
            return;
        }

        const compName = document.getElementById("compName");
        const compEmail = document.getElementById("compEmail");
        const compMobile = document.getElementById("compMobile");
        const compCategory = document.getElementById("compCategory");
        const compDescription = document.getElementById("compDescription");
        const compLocation = document.getElementById("compLocation");
        const compDate = document.getElementById("compDate");
        const compPhoto = document.getElementById("compPhoto");
        const imagePreview = document.getElementById("imagePreview");

        let isSubmitting = false;
        let photoData = "";

        // Set today's date if a date field exists
        if (compDate && !compDate.value) {
            compDate.value = today();
        }

        // Fill citizen details from login session
        const currentUser = getCurrentUser();

        if (currentUser) {
            if (compName && currentUser.name) {
                compName.value = currentUser.name;
            }

            if (compEmail && currentUser.email) {
                compEmail.value = currentUser.email;
            }

            if (compMobile && currentUser.mobile) {
                compMobile.value = currentUser.mobile;
            }
        }

        // Optional complaint photo preview
        if (compPhoto) {
            compPhoto.addEventListener("change", function () {

                const file = compPhoto.files[0];

                if (!file) {
                    photoData = "";

                    if (imagePreview) {
                        imagePreview.innerHTML = "";
                    }

                    return;
                }

                if (!file.type.startsWith("image/")) {
                    compPhoto.value = "";

                    message(
                        "complaintMessage",
                        "Please select an image file.",
                        "error"
                    );

                    return;
                }

                if (file.size > 1200000) {
                    compPhoto.value = "";

                    message(
                        "complaintMessage",
                        "Please select an image below 1.2 MB.",
                        "error"
                    );

                    return;
                }

                const reader = new FileReader();

                reader.onload = function () {
                    photoData = reader.result;

                    if (imagePreview) {
                        const img = document.createElement("img");
                        img.src = photoData;
                        img.alt = "Complaint photo preview";

                        imagePreview.replaceChildren(img);
                    }
                };

                reader.readAsDataURL(file);
            });
        }

        // Submit complaint to Spring Boot
        form.addEventListener("submit", async function (e) {

            e.preventDefault();

            if (isSubmitting) {
                return;
            }

            const name = compName?.value.trim() || "";
            const email = compEmail?.value.trim() || "";
            const mobile = compMobile?.value.trim() || "";
            const category = compCategory?.value || "";
            const description = compDescription?.value.trim() || "";
            const location = compLocation?.value.trim() || "";
            const complaintDate = compDate?.value || today();

            if (!name || !email || !mobile ||
                !category || !description || !location) {

                message(
                    "complaintMessage",
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                message(
                    "complaintMessage",
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }

            if (!/^\d{10}$/.test(mobile)) {
                message(
                    "complaintMessage",
                    "Mobile number must contain exactly 10 digits.",
                    "error"
                );

                return;
            }

            if (description.length < 10) {
                message(
                    "complaintMessage",
                    "Description must contain at least 10 characters.",
                    "error"
                );

                return;
            }

            const complaint = {
                citizenName: name,
                email: email,
                mobile: mobile,
                complaintType: category,
                description: description,
                location: location,
                complaintDate: complaintDate
            };

            const submitButton =
                form.querySelector('[type="submit"]');

            isSubmitting = true;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

            try {
                const response = await fetch(
                    "http://localhost:8080/api/complaints",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(complaint)
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Complaint registration failed: " + response.status
                    );
                }

                const data = await response.json();

                if (!data.id) {
                    throw new Error("Complaint ID was not returned by server.");
                }

                const complaintId = "CCMS" + data.id;

                // Show successful registration
                const panel = form.closest(".panel");

                if (panel) {
                    panel.innerHTML = `
                        <div class="success-screen center">
                            <div class="card-icon">🎉</div>

                            <span class="eyebrow">SUCCESS</span>

                            <h1>Complaint Registered Successfully!</h1>

                            <p>
                                Your complaint has been recorded.
                                Please save your complaint ID.
                            </p>

                            <div class="complaint-id">
                                ${esc(complaintId)}
                            </div>

                            <div class="hero-actions"
                                 style="justify-content:center">

                                <a class="btn btn-primary"
                                   href="track.html?id=${encodeURIComponent(complaintId)}">
                                    Track Complaint
                                </a>

                                <a class="btn btn-outline"
                                   href="citizen-dashboard.html">
                                    Go to Dashboard
                                </a>

                                <a class="btn btn-outline"
                                   href="complaint.html">
                                    Register Another
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    message(
                        "complaintMessage",
                        "Complaint registered successfully. Your ID is " +
                        complaintId
                    );
                }

            } catch (error) {

                console.error("Complaint registration error:", error);

                message(
                    "complaintMessage",
                    "Unable to register complaint. Check that Spring Boot is running.",
                    "error"
                );

                isSubmitting = false;

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Complaint";
                }
            }
        });
    }

    // ======================================================
    // CITIZEN DASHBOARD
    // ======================================================

    async function initCitizenDashboard() {

        initNav();

        const currentUser = requireRole("citizen");

        if (!currentUser) {
            return;
        }

        displayUserName();

        const container =
            document.getElementById("citizenComplaints");

        const totalElement =
            document.getElementById("totalComplaints");

        const pendingElement =
            document.getElementById("pendingComplaints");

        const resolvedElement =
            document.getElementById("resolvedComplaints");

        if (!container) {
            console.error(
                "citizenComplaints container not found in citizen-dashboard.html"
            );
            return;
        }

        container.innerHTML = "<p>Loading your complaints...</p>";

        try {

            const response = await fetch(
                "http://localhost:8080/api/complaints"
            );

            if (!response.ok) {
                throw new Error("Unable to fetch complaints.");
            }

            const complaints = await response.json();

            // Show only complaints submitted by the logged-in citizen
            const myComplaints = complaints.filter(function (c) {
                return (
                    String(c.email || "").toLowerCase() ===
                    String(currentUser.email || "").toLowerCase()
                );
            });

            const pending = myComplaints.filter(function (c) {
                return c.status !== "Resolved";
            }).length;

            const resolved = myComplaints.filter(function (c) {
                return c.status === "Resolved";
            }).length;

            if (totalElement) {
                totalElement.textContent = myComplaints.length;
            }

            if (pendingElement) {
                pendingElement.textContent = pending;
            }

            if (resolvedElement) {
                resolvedElement.textContent = resolved;
            }

            if (myComplaints.length === 0) {

                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No complaints yet</h3>
                        <p>You have not registered any complaints.</p>
                        <a class="btn btn-primary" href="complaint.html">
                            Register Complaint
                        </a>
                    </div>
                `;

                return;
            }

            container.innerHTML = myComplaints
                .slice()
                .reverse()
                .map(function (c) {

                    const id = "CCMS" + c.id;
                    const status = c.status || "Submitted";

                    return `
                        <article class="complaint-card">
                            <div class="complaint-card-header">
                                <h3>${esc(id)}</h3>
                                <span class="status-badge ${esc(statusClass(status))}">
                                    ${esc(status)}
                                </span>
                            </div>

                            <p>
                                <strong>Category:</strong>
                                ${esc(c.complaintType || "Not specified")}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${esc(c.location || "Not specified")}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${esc(c.complaintDate || "Not specified")}
                            </p>

                            <p>
                                <strong>Description:</strong>
                                ${esc(c.description || "")}
                            </p>

                            <a class="btn btn-outline"
                               href="track.html?id=${encodeURIComponent(id)}">
                                Track Complaint
                            </a>
                        </article>
                    `;
                })
                .join("");

        } catch (error) {

            console.error("Citizen dashboard error:", error);

            container.innerHTML = `
                <p class="message error">
                    Unable to load complaints.
                    Please check whether the backend is running.
                </p>
            `;
        }
    }

    // ======================================================
    // TRACK COMPLAINT
    // ======================================================

    async function initTrack() {

        initNav();

        const trackForm = document.getElementById("trackForm");
        const trackInput = document.getElementById("trackId");
        const trackResult = document.getElementById("trackResult");

        if (!trackForm || !trackInput || !trackResult) {
            console.error(
                "Tracking elements not found. Check track.html IDs."
            );
            return;
        }

        // Automatically search if complaint ID is in URL
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get("id");

        if (urlId) {
            trackInput.value = urlId;
            await searchComplaint(urlId);
        }

        trackForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const id = trackInput.value.trim();

            if (!id) {
                trackResult.innerHTML =
                    '<p class="message error">Please enter a complaint ID.</p>';
                return;
            }

            await searchComplaint(id);
        });


        async function searchComplaint(inputId) {

            trackResult.innerHTML = "<p>Searching complaint...</p>";

            try {
                // Accept IDs such as CCMS24 or 24
                const numericId = inputId.replace(/^CCMS/i, "").trim();

                if (!/^\d+$/.test(numericId)) {
                    trackResult.innerHTML =
                        '<p class="message error">Invalid complaint ID. Example: CCMS24</p>';
                    return;
                }

                const response = await fetch(
                    "http://localhost:8080/api/complaints/" +
                    encodeURIComponent(numericId)
                );

                if (response.status === 404) {
                    trackResult.innerHTML =
                        '<p class="message error">Complaint not found. Please check the ID.</p>';
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch complaint.");
                }

                const c = await response.json();

                renderTrack(c);

            } catch (error) {
                console.error("Tracking error:", error);

                trackResult.innerHTML = `
                    <p class="message error">
                        Unable to track complaint. Please check that the backend is running.
                    </p>
                `;
            }
        }


        function renderTrack(c) {

            const id = "CCMS" + c.id;
            const status = c.status || "Submitted";

            const steps = [
                "Submitted",
                "Under Review",
                "Assigned",
                "In Progress",
                "Resolved"
            ];

            const currentIndex = steps.indexOf(status);

            const progressHtml = steps.map(function (step, index) {

                const completed = currentIndex >= index;

                return `
                    <div class="progress-step ${completed ? "completed" : ""}">
                        <div class="progress-circle">
                            ${completed ? "✓" : index + 1}
                        </div>
                        <div class="progress-label">${esc(step)}</div>
                    </div>
                `;
            }).join("");

            trackResult.innerHTML = `
                <article class="complaint-card">
                    <div class="complaint-card-header">
                        <h2>${esc(id)}</h2>
                        <span class="status-badge ${esc(statusClass(status))}">
                            ${esc(status)}
                        </span>
                    </div>

                    <div class="progress-tracker">
                        ${progressHtml}
                    </div>

                    <div class="complaint-details">
                        <p>
                            <strong>Complaint Type:</strong>
                            ${esc(c.complaintType || "Not specified")}
                        </p>

                        <p>
                            <strong>Citizen Name:</strong>
                            ${esc(c.citizenName || "Not specified")}
                        </p>

                        <p>
                            <strong>Location:</strong>
                            ${esc(c.location || "Not specified")}
                        </p>

                        <p>
                            <strong>Date:</strong>
                            ${esc(c.complaintDate || "Not specified")}
                        </p>

                        <p>
                            <strong>Description:</strong>
                            ${esc(c.description || "Not specified")}
                        </p>

                        <p>
                            <strong>Department:</strong>
                            ${esc(c.department || "Not assigned")}
                        </p>
                    </div>
                </article>
            `;
        }
    }

    // ======================================================
    // ADMIN DASHBOARD
    // ======================================================

    async function initAdminDashboard() {

        initNav();

        const currentSession = requireRole("admin");

        if (!currentSession) {
            return;
        }

        const tableBody =
            document.getElementById("adminComplaints");

        const statsContainer =
            document.getElementById("adminStats");

        const searchInput =
            document.getElementById("adminSearch");

        if (!tableBody) {
            console.error(
                "adminComplaints not found. Check admin-dashboard.html."
            );
            return;
        }

        let allComplaints = [];

        tableBody.innerHTML =
            '<tr><td colspan="8">Loading complaints...</td></tr>';

        try {

            const response = await fetch(
                "http://localhost:8080/api/complaints"
            );

            if (!response.ok) {
                throw new Error("Unable to load complaints.");
            }

            allComplaints = await response.json();

            renderAdminStats();
            renderAdminTable(allComplaints);

        } catch (error) {

            console.error("Admin dashboard error:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load complaints.
                        Please check the Spring Boot server.
                    </td>
                </tr>
            `;
        }


        // Display dashboard counts
        function renderAdminStats() {

            if (!statsContainer) {
                return;
            }

            const total = allComplaints.length;

            const pending = allComplaints.filter(function (c) {
                return c.status !== "Resolved";
            }).length;

            const resolved = allComplaints.filter(function (c) {
                return c.status === "Resolved";
            }).length;

            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>Total Complaints</h3>
                    <p>${total}</p>
                </div>

                <div class="stat-card">
                    <h3>Pending Complaints</h3>
                    <p>${pending}</p>
                </div>

                <div class="stat-card">
                    <h3>Resolved Complaints</h3>
                    <p>${resolved}</p>
                </div>
            `;
        }


        // Display complaints in the admin table
        function renderAdminTable(list) {

            if (list.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8">No complaints found.</td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = list.map(function (c) {

                const id = "CCMS" + c.id;

                const status = c.status || "Submitted";

                const departments = [
                    "Sanitation",
                    "Roads",
                    "Water Supply",
                    "Drainage",
                    "Electrical",
                    "General"
                ];

                const statusOptions = STATUSES.map(function (s) {
                    return `
                        <option value="${esc(s)}"
                            ${status === s ? "selected" : ""}>
                            ${esc(s)}
                        </option>
                    `;
                }).join("");

                const departmentOptions = departments.map(function (d) {
                    return `
                        <option value="${esc(d)}"
                            ${c.department === d ? "selected" : ""}>
                            ${esc(d)}
                        </option>
                    `;
                }).join("");

                return `
                    <tr>
                        <td>${esc(id)}</td>
                        <td>${esc(c.citizenName || "Not provided")}</td>
                        <td>${esc(c.complaintType || "")}</td>
                        <td>${esc(c.location || "")}</td>

                        <td>
                            <select class="admin-status"
                                    data-id="${esc(c.id)}">
                                ${statusOptions}
                            </select>
                        </td>

                        <td>
                            <select class="admin-department"
                                    data-id="${esc(c.id)}">
                                <option value="">Select Department</option>
                                ${departmentOptions}
                            </select>
                        </td>

                        <td>${esc(c.complaintDate || "")}</td>

                        <td>
                            <a href="track.html?id=${encodeURIComponent(id)}">
                                View
                            </a>
                        </td>
                    </tr>
                `;
            }).join("");

            // Status change handler
            tableBody.querySelectorAll(".admin-status")
                .forEach(function (select) {

                    select.addEventListener("change", async function () {

                        const complaintId = select.dataset.id;
                        const newStatus = select.value;

                        select.disabled = true;

                        try {

                            const response = await fetch(
                                `http://localhost:8080/api/complaints/${encodeURIComponent(complaintId)}/status?status=${encodeURIComponent(newStatus)}`,
                                { method: "PUT" }
                            );

                            if (!response.ok) {
                                throw new Error("Status update failed.");
                            }

                            const complaint = allComplaints.find(
                                c => String(c.id) === String(complaintId)
                            );

                            if (complaint) {
                                complaint.status = newStatus;
                            }

                            renderAdminStats();

                            message(
                                "adminMessage",
                                "Complaint status updated successfully."
                            );

                        } catch (error) {

                            console.error(error);

                            message(
                                "adminMessage",
                                "Unable to update status. Please try again.",
                                "error"
                            );

                            await reloadComplaints();

                        } finally {

                            select.disabled = false;
                        }
                    });
                });


            // Department change handler
            tableBody.querySelectorAll(".admin-department")
                .forEach(function (select) {

                    select.addEventListener("change", async function () {

                        const complaintId = select.dataset.id;
                        const department = select.value;

                        if (!department) {
                            return;
                        }

                        select.disabled = true;

                        try {

                            const response = await fetch(
                                `http://localhost:8080/api/complaints/${encodeURIComponent(complaintId)}/department?department=${encodeURIComponent(department)}`,
                                { method: "PUT" }
                            );

                            if (!response.ok) {
                                throw new Error("Department update failed.");
                            }

                            const complaint = allComplaints.find(
                                c => String(c.id) === String(complaintId)
                            );

                            if (complaint) {
                                complaint.department = department;
                            }

                            message(
                                "adminMessage",
                                "Department assigned successfully."
                            );

                        } catch (error) {

                            console.error(error);

                            message(
                                "adminMessage",
                                "Unable to assign department. Please try again.",
                                "error"
                            );

                            await reloadComplaints();

                        } finally {

                            select.disabled = false;
                        }
                    });
                });
        }


        // Search complaints
        if (searchInput) {

            searchInput.addEventListener("input", function () {

                const query = searchInput.value.trim().toLowerCase();

                const filtered = allComplaints.filter(function (c) {

                    return (
                        String(c.id || "").toLowerCase().includes(query) ||
                        String(c.citizenName || "").toLowerCase().includes(query) ||
                        String(c.complaintType || "").toLowerCase().includes(query) ||
                        String(c.location || "").toLowerCase().includes(query) ||
                        String(c.status || "").toLowerCase().includes(query) ||
                        String(c.department || "").toLowerCase().includes(query)
                    );
                });

                renderAdminTable(filtered);
            });
        }


        // Refresh complaints after an update error
        async function reloadComplaints() {

            try {

                const response = await fetch(
                    "http://localhost:8080/api/complaints"
                );

                if (!response.ok) {
                    throw new Error("Refresh failed.");
                }

                allComplaints = await response.json();

                renderAdminStats();

                if (searchInput && searchInput.value.trim()) {
                    searchInput.dispatchEvent(new Event("input"));
                } else {
                    renderAdminTable(allComplaints);
                }

            } catch (error) {

                console.error("Unable to refresh complaints:", error);
            }
        }
    }

    // ======================================================
    // ADMIN FILTERS AND REFRESH
    // ======================================================

    function initAdminFilters() {

        const statusFilter =
            document.getElementById("statusFilter");

        const categoryFilter =
            document.getElementById("categoryFilter");

        const refreshButton =
            document.getElementById("refreshComplaints");

        const tableBody =
            document.getElementById("adminComplaints");

        if (!tableBody) {
            console.warn("Admin complaints table not found.");
            return;
        }

        function applyFilters() {

            const rows = tableBody.querySelectorAll("tr");

            const selectedStatus =
                statusFilter ? statusFilter.value : "";

            const selectedCategory =
                categoryFilter ? categoryFilter.value : "";

            rows.forEach(function (row) {

                const cells = row.querySelectorAll("td");

                if (cells.length < 4) {
                    return;
                }

                const category =
                    cells[2].textContent.trim();

                const statusSelect =
                    row.querySelector(".admin-status");

                const status = statusSelect
                    ? statusSelect.value
                    : cells[4]?.textContent.trim();

                const statusMatches =
                    !selectedStatus || status === selectedStatus;

                const categoryMatches =
                    !selectedCategory || category === selectedCategory;

                row.style.display =
                    statusMatches && categoryMatches ? "" : "none";
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener("change", applyFilters);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener("change", applyFilters);
        }

        if (refreshButton) {
            refreshButton.addEventListener("click", function () {
                location.reload();
            });
        }
    }


    // ======================================================
    // COMPLAINT DATE DISPLAY HELPER
    // ======================================================

    function formatComplaintDate(value) {

        if (!value) {
            return "Not specified";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // ======================================================
    // COMMON HELPERS
    // ======================================================

    function getStatusLabel(status) {
        return status || "Submitted";
    }


    function getComplaintId(id) {
        return "CCMS" + String(id).replace(/^CCMS/i, "");
    }


    function getComplaintById(complaints, id) {

        const numericId = String(id).replace(/^CCMS/i, "");

        return complaints.find(function (complaint) {
            return String(complaint.id) === numericId;
        }) || null;
    }


    // ======================================================
    // STATUS BADGE HTML
    // ======================================================

    function getStatusBadge(status) {

        const label = getStatusLabel(status);
        const cssClass = statusClass(label);

        return `
            <span class="status-badge ${esc(cssClass)}">
                ${esc(label)}
            </span>
        `;
    }


    // ======================================================
    // EMPTY STATE
    // ======================================================

    function showEmptyState(container, heading, description) {

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="empty-state">
                <h3>${esc(heading)}</h3>
                <p>${esc(description)}</p>
            </div>
        `;
    }


    // ======================================================
    // API ERROR MESSAGE
    // ======================================================

    function showApiError(container, error) {

        console.error("CCMS API error:", error);

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="message error">
                Unable to load data from the server.
                Please check that the Spring Boot backend is running.
            </div>
        `;
    }

    // ======================================================
    // PAGE INITIALIZATION
    // ======================================================

    function initPage() {

        const page = (
            document.body.dataset.page ||
            window.location.pathname.split("/").pop().replace(".html", "")
        ).toLowerCase();

        switch (page) {

            case "register":
            case "registration":
                initRegister();
                break;

            case "login":
                initLogin();
                break;

            case "complaint":
            case "register-complaint":
                initComplaintForm();
                break;

            case "citizen-dashboard":
                initCitizenDashboard();
                break;

            case "track":
            case "track-complaint":
                initTrack();
                break;

            case "admin-dashboard":
            case "admin":
                initAdminDashboard();
                initAdminFilters();
                break;

            default:
                initNav();
                break;
        }
    }

    // ======================================================
    // EXPOSE FUNCTIONS
    // ======================================================

    return {
        initRegister,
        initLogin,
        initComplaintForm,
        initCitizenDashboard,
        initTrack,
        initAdminDashboard,
        initAdminFilters,
        initPage,
        logout,
        getCurrentUser,
        getComplaintId,
        getComplaintById,
        getStatusBadge,
        formatComplaintDate
    };

})(); // End of CCMS


// ======================================================
// START APPLICATION
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    CCMS.initPage();

    // Attach logout to any element with this ID or attribute
    const logoutButton =
        document.getElementById("logoutBtn");

    if (logoutButton) {
        logoutButton.addEventListener("click", CCMS.logout);
    }

    document.querySelectorAll("[data-logout]")
        .forEach(function (button) {
            button.addEventListener("click", CCMS.logout);
        });

});
