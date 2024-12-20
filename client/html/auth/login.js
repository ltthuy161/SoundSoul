document.querySelector("#submit").addEventListener("click", async () => {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const payload = {
        email: email,
        password: password,
    };

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");

            // Decode the token to get the user's role
            const decodedToken = jwt_decode(data.token); // Use jwt_decode
            console.log("Decoded Token:", decodedToken);

            // Store the token
            localStorage.setItem("authToken", data.token);

            // Redirect based on role
            if (decodedToken.role === "admin") {
                window.location.href = "../admin/dashboard.html";
            } else if (decodedToken.role === "creator") {
                window.location.href = "creator-dashboard.html";
            } else if (decodedToken.role === "free-user") {
                window.location.href = "user-dashboard.html";
            } else {
                alert("Unauthorized role!");
            }
        } else {
            alert(`Login failed: ${data.error}`);
            console.error(data.error);
        }
    } catch (error) {
        alert("An error occurred during login.");
        console.error("Fetch error:", error);
    }
});