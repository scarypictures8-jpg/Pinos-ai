import "dotenv/config";
import express from "express";
import { fal } from "@fal-ai/client";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

if (!process.env.FAL_KEY) {
  console.warn("FAL_KEY is missing. Add it to .env before generating videos.");
}
fal.config({ credentials: process.env.FAL_KEY });

app.post("/api/generate-video", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "Andika prompt ya video." });
    if (prompt.length > 1500) return res.status(400).json({ error: "Prompt ni ndende cyane." });

    const result = await fal.subscribe("minimax/h3-max-turbo/text-to-video", {
      input: {
        prompt,
        prompt_expansion_mode: "disabled"
      },
      logs: false
    });

    const videoUrl = result?.data?.video?.url;
    if (!videoUrl) return res.status(502).json({ error: "Video ntiyagarutse kuri server." });

    res.json({ videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Habaye ikibazo mu gukora video." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`PINOS AI running on http://localhost:${port}`));
