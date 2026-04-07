const SERVER = "http://localhost:8080";

export async function login(username, password) {
    const response = await fetch(`${SERVER}/login`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ username, password }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Login failed" };
    }

    const data = await response.json();
    return data;
}

export async function logout() {
    const response = await fetch(`${SERVER}/logout`, {
        method: "POST",
        credentials: "include",
    });

    return response.ok;
}

export async function checkLogin() {
    try {
        const response = await fetch(`${SERVER}/check-login`, {
            credentials: "include",
        });

        if (!response.ok) {
            return { loggedIn: false, isAdmin: false, userId: null };
        }

        const data = await response.json();
        return {
            loggedIn: data.loggedIn,
            isAdmin: data.isAdmin,
            userId: data.user ? data.user.id : null,
        };
    } catch (error) {
        return { loggedIn: false, isAdmin: false, userId: null };
    }
}

