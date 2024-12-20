document.querySelector("#submit").addEventListener("click", async () => {
    const fullname = document.querySelector("#fullname").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const isComposer = document.querySelector("#composer").checked;

    // Default role is "free-user"
    const role = isComposer ? "creator" : "free-user";

    if (!fullname || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    const payload = {
        fullname: fullname,
        email: email,
        password: password,
        role: role,
    };

    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            console.log(data);
            window.location.href = "login.html";
        } else {
            alert(`Error: ${data.error}`);
            console.error(data.error);
        }
    } catch (error) {
        alert("An error occurred during registration.");
        console.error("Fetch error:", error);
    }
});