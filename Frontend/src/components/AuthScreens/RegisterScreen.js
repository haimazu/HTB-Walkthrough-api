import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../Css/Register.css";
import { BsArrowBarLeft } from "react-icons/bs";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const registerHandler = async (e) => {
    e.preventDefault();
    const format = /^([a-zA-Z0-9]{2,12})@([a-zA-Z]{3,12})\.([a-zA-Z]{2,3})$/;

    // check email format
    if (!format.test(email)) {
      setError("Please fill a valid email address");
      setTimeout(() => {
        setError("");
      }, 5000);
      return;
    }

    if (password.length < 8) {
      setError("The password is too short");
      setTimeout(() => {
        setError("");
      }, 5000);
      return;
    }

    if (password !== confirmpassword) {
      setError("The passwords do not match");
      setTimeout(() => {
        setError("");
      }, 5000);
      return;
    }

    try {
      const { data } = await axios.post("/auth/register", {
        username,
        email,
        password,
      });

      localStorage.setItem("authToken", data.token);

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      setError(error.response.data.msg);

      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="inclusive-register-page">
      <div className="register-big-wrapper">
        <Link to="/" className="back_home">
          <BsArrowBarLeft />
        </Link>

        <form onSubmit={registerHandler}>
          <div className="top-register-explain">
            <h2>Register</h2>
          </div>

          {error && <div className="error_message">{error}</div>}

          <div className="input-wrapper">
            <input
              type="text"
              required
              id="name"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="name">Username</label>
          </div>

          <div className="input-wrapper">
            <input
              type="email"
              required
              id="email"
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              tabIndex={1}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-wrapper">
            <input
              type="password"
              required
              id="password"
              autoComplete="true"
              placeholder="Password is 8 characters long"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              tabIndex={2}
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="input-wrapper">
            <input
              type="password"
              required
              id="confirmpassword"
              autoComplete="true"
              placeholder="Confirm password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="confirmpassword">Confirm Password</label>
          </div>

          <button type="submit">Register</button>

          <div className="top-suggest_login">
            <span> Have an account?</span>
            <a href="/login">Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;
