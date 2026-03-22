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

    const data = await response.text();
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
    const response = await fetch(`${SERVER}/check-login`, {
        credentials: "include",
    });

    return response.ok;
}

