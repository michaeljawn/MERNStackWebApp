import { useState } from "react";
import { login } from "../utils/auth";
import "../styles/common.css";
import "../styles/Login.css";

function Login() {
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [create_username, setCreateUsername] = useState("");
  const [create_password_1, setCreatePassword1] = useState("");
  const [create_password_2, setCreatePassword2] = useState("");

  function showCreate() {
    setShowCreateAccount(true);
  }

  function showLogin() {
    setShowCreateAccount(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) {
      setMessage("Please enter a username and password");
      return;
    }

    login(username, password)
      .then((data) => {
        // Handle both success and error responses
        if (data && typeof data === "object" && data.success) {
          setMessage(data.message);
          if (data.user && data.user.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/dashboard";
          }
        } else if (data && typeof data === "object" && data.message) {
          setMessage(data.message);
        } else {
          setMessage("Login failed");
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage("Error logging in");
      });
  }

  function addUser(e) {
    e.preventDefault();
    if (!create_username) {
      setMessage("Please enter a username");
      return;
    }

    if (!create_password_1) {
      setMessage("Please enter a password");
      return;
    }

    if (!create_password_2) {
      setMessage("Please confirm a password");
      return;
    }

    if (create_password_1 != create_password_2) {
      setMessage("Passwords do not match");
      return;
    }

    fetch("http://localhost:8080/users", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        username: create_username,
        password: create_password_1,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setMessage(data);
        // set to login page if account
      })
      .catch((error) => {
        console.log(error);
        setMessage("Error adding user");
      });
  }

  return (
    <div id="login-container">
      {!showCreateAccount && (
        <form id="login-form" onSubmit={handleLogin}>
          <h1 id="login-title">Login</h1>

          <div id="username-container">
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <br />

          <div id="password-container">
            <label htmlFor="password">Password: </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <br />

          <button id="login-button" type="submit">
            Login
          </button>

          <button id="create_account-button" type="button" onClick={showCreate}>
            Create Account
          </button>
        </form>
      )}

      {showCreateAccount && (
        <form id="create-account-form" onSubmit={addUser}>
          <h1 id="login-title">Create Account</h1>

          <div id="username-container">
            <label>Username: </label>
            <input
              type="text"
              value={create_username}
              onChange={(e) => setCreateUsername(e.target.value)}
            />
          </div>

          <br />

          <div id="password-container">
            <label>Password: </label>
            <input
              type="password"
              value={create_password_1}
              onChange={(e) => setCreatePassword1(e.target.value)}
            />
          </div>

          <br />

          <div id="password-container">
            <label>Confirm Password: </label>
            <input
              type="password"
              value={create_password_2}
              onChange={(e) => setCreatePassword2(e.target.value)}
            />
          </div>

          <br />

          <button id="add-user-button" type="submit">Add User</button>

          <button id="back-login-button" type="button" onClick={showLogin}>
            Back to Login
          </button>
        </form>
      )}

      <p id="message">{message}</p>
    </div>
  );
}

export default Login;
