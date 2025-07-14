import { BACKEND_URL } from "../constants";
import { Transfer, ProfileData } from "@shared/types";


export const getUserData = async (): Promise<ProfileData | null> => {
    const response = await fetch(`${BACKEND_URL}/auth/info`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        console.error("Nu a putut fi găsit utilizatorul");
        console.error(response.status)
        console.error(response.statusText)
        return null;
    }

    const data: ProfileData = await response.json();
    return data;
};