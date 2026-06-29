import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import "./Login.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span style={{ color: "#ff0000", fontSize: "28px" }}>▶</span>
          <h2>VidTube</h2>
        </div>

        <h3>{isSignup ? "Create Account" : "Sign In"}</h3>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>

        <button className="google-btn" onClick={handleGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
          Continue with Google
        </button>

        <p className="login-toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? " Sign In" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;