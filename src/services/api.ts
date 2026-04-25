import axios from "axios";
import { Song } from "../types";

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};

export const getAuthUrl = async (): Promise<string> => {
  const response = await axios.get("/api/auth/url");
  return response.data.url;
};
