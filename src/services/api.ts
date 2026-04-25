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

export const getAuthUrl = async (): Promise<{url: string, error?: string}> => {
  try {
    const response = await axios.get("/api/auth/url");
    return response.data;
  } catch (error: any) {
    console.error("Search API Error:", error);
    return { url: "", error: error.response?.data?.error || "Failed to contact server" };
  }
};
