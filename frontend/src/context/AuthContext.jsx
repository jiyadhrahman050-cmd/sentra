import { createContext, useEffect, useState } from "react";
import { login as loginAPI, me } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("access");

        if (token) {

            me()
    .then((user) => {

        setUser(user);

    })
                .catch(() => {

                    localStorage.removeItem("access");

                    setUser(null);

                })
                .finally(() => {

                    setLoading(false);

                });

        } else {

            setLoading(false);

        }

    }, []);

   const login = async (credentials) => {
    const response = await loginAPI(credentials);

    localStorage.setItem("access", response.access);

    const profile = await me();

    // Save role
    localStorage.setItem("role", profile.roles[0]);

    setUser(profile);
};

    const logout = () => {

        localStorage.removeItem("access");

        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}