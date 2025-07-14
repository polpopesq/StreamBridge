import { Request, Response } from "express";
import * as adminService from "../services/adminService";
import { MatchedSong, NonMatchedSong } from "@shared/types";

export const getMatchedSongs = async (req: Request, res: Response) => {
  try {
    const songs = await adminService.getMatchedSongs();
    res.json(songs);
  } catch (err) {
    console.error("Error fetching matched songs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createMatchedSong = async (req: Request, res: Response) => {
  try {
    const song: MatchedSong = req.body;
    const created = await adminService.createMatchedSong(song);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating matched song:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMatchedSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const song: MatchedSong = req.body;
    const updated = await adminService.updateMatchedSong(song);
    if (!updated) res.status(404).json({ message: "Matched song not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating matched song:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMatchedSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await adminService.deleteMatchedSong(Number(req.params.id));
    if (!deleted) res.status(404).json({ message: "Matched song not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting matched song:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNonMatchedSongs = async (req: Request, res: Response) => {
  try {
    const songs = await adminService.getNonMatchedSongs();
    res.json(songs);
  } catch (err) {
    console.error("Error fetching non-matched songs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNonMatchedSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const song: NonMatchedSong = req.body;
    const destination_id = req.body.destination_id;
    const destination_name = req.body.destination_name;
    const updated = await adminService.updateNonMatchedSong(song, destination_id, destination_name);
    if (!updated) res.status(404).json({ message: "Non-matched song not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating non-matched song:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNonMatchedSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await adminService.deleteNonMatchedSong(Number(req.params.id));
    if (!deleted) res.status(404).json({ message: "Non-matched song not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting non-matched song:", err);
    res.status(500).json({ message: "Server error" });
  }
};
