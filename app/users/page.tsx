'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const handleLogin = async (username: string, password: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !data) {
            alert('Invalid username or password');
            return false;
        }

        const isPasswordValid = await bcrypt.compare(password, data.password);
        if (!isPasswordValid) {
            alert('Invalid username or password');
            return false;
        }

        return true;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Login error:', err.message);
        }
        alert('An error occurred during login');
        return false;
    }
};

const redirectToPosts = (router: ReturnType<typeof useRouter>) => {
    router.push('/posts');
};

const LoginPage = () => {
    const [username, setUser] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic client-side validation
        if (!username || !password) {
            alert('Both username and password are required');
            return;
        }

        const loginSuccess = await handleLogin(username, password);
        if (loginSuccess) {
            redirectToPosts(router);
        }
    };

    // Optional: Check if the user is already logged in and redirect
    useEffect(() => {
        const checkSession = async () => {
            const { data: session } = await supabase.auth.getSession();
            if (session) {
                redirectToPosts(router);
            }
        };
        checkSession();
    }, [router]);

    return (
        <div className="login-container flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <form className="login-form text-left" onSubmit={handleSubmit}>
                <h2>Silahkan Login</h2>
                <br />
                <div className="form-group flex flex-col gap-2">
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
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" Enter your password"
                        required
                    />
                </div>
                <br />
                <button
                    type="submit"
                    className="login-button hover:bg-blue-700 hover:text-white transition-colors duration-300 bg-blue-600 text-white px-6 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
