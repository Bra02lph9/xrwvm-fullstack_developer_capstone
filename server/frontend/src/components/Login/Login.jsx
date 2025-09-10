import React, { useState, useEffect } from 'react';
import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);

  let login_url = window.location.origin + "/djangoapp/login/";

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(login_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Login error response:", text);
        alert("Login failed");
        return;
      }

      const json = await res.json();
      if (json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        setOpen(false);
      } else {
        alert(json.error || "The user could not be authenticated.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error or server not responding.");
    }
  };

  useEffect(() => {
    if (!open) {
      window.location.href = "/";
    }
  }, [open]);

  return (
    <div>
      <Header />
      <div onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className='modalContainer'>
          <form className="login_panel" onSubmit={login}>
            <div>
              <span className="input_field">Username </span>
              <input type="text" placeholder="Username" className="input_field" onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
              <span className="input_field">Password </span>
              <input type="password" placeholder="Password" className="input_field" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <input className="action_button" type="submit" value="Login" />
              <input className="action_button" type="button" value="Cancel" onClick={() => setOpen(false)} />
            </div>
            <a className="loginlink" href="/register">Register Now</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
