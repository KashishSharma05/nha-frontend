// AuthContext — Global authentication state

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, clearTokens } from "../services/api";
import { getProfile } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]               = useState(null);
    const [loading, setLoading]         = useState(true); // initial auth check
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const refreshUser = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const profile = await getProfile();
            setUser(profile);
            setIsAuthenticated(true);
        } catch (err) {
            // Token invalid or expired — clear it and send back to login
            console.error("[AuthContext] Failed to refresh user:", err.message);
            clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            // Only redirect if not already on an auth page
            const authPages = ["/", "/register", "/forgot-password"];
            if (!authPages.includes(window.location.pathname)) {
                window.location.replace("/");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        refreshUser,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

export default AuthContext;
