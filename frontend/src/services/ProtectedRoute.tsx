import { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    isAuthenticated: boolean;
    children: JSX.Element;
}

export const ProtectedRoute = ({ isAuthenticated, children }: Props) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
