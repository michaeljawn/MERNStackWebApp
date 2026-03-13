import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();


  function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) {
      setMessage("Please enter a username and password");
      return;
    }
    fetch("http://localhost:8080/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ username, password }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setMessage(data);
        if (data === "Login successful") {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage("Error logging in");
      });
  }

  function addUser() {
    if (!username || !password) {
      setMessage("Please enter a username and password");
      return;
    }
    fetch("http://localhost:8080/users", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ username, password }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setMessage(data);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Error adding user");
      });
  }

  return (
    <div id="login-container">
      <h1 id="login-title">Login</h1>

      <button id="add-user-button" onClick={addUser}>
        Add User
      </button>

      <form id="login-form" onSubmit={handleLogin}>
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
      </form>

      <p id="message">{message}</p>
    </div>
  );
}

export default Login;