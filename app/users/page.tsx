'use client';

import React, { useState } from 'react';

const LoginPage = () => {
    const [username, setUser] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Username:', username);
        console.log('Password:', password);
    };

    return (
        <div className="login-container flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <form className="login-form text-left" onSubmit={handleSubmit}>
            <h2>Silahkan Login</h2>
            <br/>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                type="username"
                id="username"
                value={username}
                onChange={(e) => setUser(e.target.value)}
                placeholder=" Enter your username"
                required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password </label>
                <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" Enter your password"
                required
                />
            </div>
            <br/>
            <button
                type="submit"
                className="login-button hover:bg-blue-700 hover:text-white transition-colors duration-300 bg-blue-600 text-white px-6 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
                Login
            </button>
            </form>
        </div>
    );
};

export default LoginPage;
