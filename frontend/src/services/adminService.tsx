import { BACKEND_URL } from "../constants";
import { MatchedSong, NonMatchedSong } from "@shared/types";

export const fetchMatchedSongs = async (): Promise<MatchedSong[]> => {
    const res = await fetch(`${BACKEND_URL}/admin/matched-songs`, {
        credentials: "include"
    });
    return res.json();
};

export const fetchNonMatchedSongs = async (): Promise<NonMatchedSong[]> => {
    const res = await fetch(`${BACKEND_URL}/admin/non-matched-songs`, {
        credentials: "include"
    });
    return res.json();
};

export const addMatchedSong = async (data: any) => {
    const res = await fetch(`${BACKEND_URL}/admin/matched-songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
    });
    return res.json();
};

export const updateMatchedSong = async (data: any) => {
    const res = await fetch(`${BACKEND_URL}/admin/matched-songs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
    });
    return res.json();
};

export const deleteMatchedSong = async (id: number) => {
    await fetch(`${BACKEND_URL}/admin/matched-songs/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
};

export const addNonMatchedSong = async (data: any) => {
    const res = await fetch(`${BACKEND_URL}/admin/non-matched-songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
    });
    return res.json();
};

export const updateNonMatchedSong = async (data: any) => {
    const res = await fetch(`${BACKEND_URL}/admin/non-matched-songs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
    });
    return res.json();
};

export const deleteNonMatchedSong = async (id: number) => {
    await fetch(`${BACKEND_URL}/admin/non-matched-songs/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
};
