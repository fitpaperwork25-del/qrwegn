const express = require("express");
const cors    = require("cors");

const healthRouter = require("./routes/health");
const printRouter  = require("./routes/print");

const PORT = process.env.PORT ?? 8787;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://www.qrwegn.com",
  "https://qrwegn.com",
  "https://qrserve-v3.vercel.app",
];

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman during dev)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin not allowed — ${origin}`));
  },
  methods: ["GET", "POST"],
}));

app.use(express.json());

app.use("/health", healthRouter);
app.use("/print",  printRouter);

// Catch-all 404
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[qrwegn-local-bridge] listening on http://127.0.0.1:${PORT}`);
  console.log(`  health → http://127.0.0.1:${PORT}/health`);
});
