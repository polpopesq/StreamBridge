import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    loggedIn: boolean;
    setLoggedIn: (val: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(() => {
        const saved = localStorage.getItem("loggedIn");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("loggedIn", String(loggedIn));
    }, [loggedIn]);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
