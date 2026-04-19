import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className=" text-2xl font-semibold mb-4 ">Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label>Email Sinh viên:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <hr />
      <button>Đăng nhập bằng Google / Microsoft</button>
    </div>
  );
}
