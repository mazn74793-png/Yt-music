import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import YouTubeMusic from "node-youtube-music";
// @ts-ignore
import { GoogleGenerativeAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTMusic = (YouTubeMusic as any).default || YouTubeMusic;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    try {
      const results = await YTMusic.searchMusics(q as string);
      res.json(results);
    } catch (error) {
      console.error("YT Music Search Error:", error);
      res.status(500).json({ error: "Failed to search music" });
    }
  });

  app.get("/api/suggestions", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
      const results = await YTMusic.getSuggestions(q as string);
      res.json(results);
    } catch (error) {
       res.json([]);
    }
  });

  app.get("/api/auth/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const appUrl = process.env.APP_URL;

    console.log("OAuth Request - Client ID exists:", !!clientId);
    console.log("OAuth Request - App URL:", appUrl);

    if (!clientId) {
      return res.status(400).json({ url: "", error: "Missing GOOGLE_CLIENT_ID in environment variables" });
    }
    if (!appUrl) {
      return res.status(400).json({ url: "", error: "Missing APP_URL in environment variables" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${appUrl.replace(/\/$/, '')}/auth/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      access_type: 'offline',
      prompt: 'consent'
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    // In a real app, you'd exchange the code for tokens here
    res.send(`
      <html>
        <body style="background: #121212; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <div style="text-align: center;">
            <h1 style="margin-bottom: 8px;">Success!</h1>
            <p style="opacity: 0.7;">You've been logged in. This window will close.</p>
          </div>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
