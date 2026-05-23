const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { createCanvas, Image } = require("canvas");
const { execSync } = require("child_process");
const fs2 = require("fs");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
const APP_URL = "https://qrwegn.com";
const DPI = 300;
const W = Math.round((62 / 25.4) * DPI);
const H = Math.round((30.48 / 25.4) * DPI);
app.post("/generate-labels", async (req, res) => {
  const { businessSlug, tables } = req.body;
  try {
    for (const table of tables) {
      const label = table.label || table.name;
      const url = `${APP_URL}/scan/${businessSlug}?table=${table.id}`;
      const qrSize = H - 20;
      const qrDataUrl = await QRCode.toDataURL(url, { width: qrSize, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, W, H);
      const img = new Image();
      img.src = qrDataUrl;
      const pad = 10;
      ctx.drawImage(img, pad, pad, qrSize, qrSize);
      const textX = pad + qrSize + 16;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(H * 0.13)}px Arial`;
      ctx.fillText("QR-WEGN", textX, H * 0.28);
      ctx.font = `bold ${Math.round(H * 0.16)}px Arial`;
      ctx.fillText(businessSlug.replace(/-/g, " "), textX, H * 0.50);
      const pillH = H * 0.22;
      const pillY = H * 0.60;
      const pillW = (W - textX - pad) * 0.7;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(textX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = "#080808";
      ctx.font = `bold ${Math.round(H * 0.14)}px Arial`;
      ctx.fillText(label.toUpperCase(), textX + 10, pillY + pillH * 0.72);
      ctx.fillStyle = "#888888";
      ctx.font = `${Math.round(H * 0.10)}px Arial`;
      ctx.fillText("Scan to order", textX, H * 0.92);
      const imgPath = path.join(__dirname, `label_${table.id}.png`);
      fs2.writeFileSync(imgPath, canvas.toBuffer("image/png"));
      execSync(`rundll32 C:\\Windows\\System32\\shimgvw.dll,ImageView_PrintTo /pt "${imgPath}" "Brother QL-820NWB"`, { timeout: 20000 });
      fs2.unlinkSync(imgPath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.listen(5000, () => console.log("Print server running on port 5000"));
