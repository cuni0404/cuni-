import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database("database.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    role TEXT,
    client TEXT,
    year TEXT,
    videoUrl TEXT,
    videoFile TEXT,
    thumbnailUrl TEXT,
    description TEXT,
    isFeatured INTEGER DEFAULT 0,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    logoText TEXT,
    logoImage TEXT,
    heroTitle TEXT,
    heroSubtitle TEXT,
    heroImage TEXT,
    heroVideo TEXT,
    aboutTitle TEXT,
    aboutDescription TEXT,
    aboutProfileImage TEXT,
    aboutDescFontSize TEXT,
    aboutDescFontWeight TEXT,
    aboutBackgroundImage TEXT,
    contactEmail TEXT,
    contactInstagram TEXT,
    contactX TEXT,
    contactYoutube TEXT,
    clients TEXT
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio_uploads',
    resource_type: 'auto',
  } as any,
});

const upload = multer({ 
  storage: cloudinaryStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY id DESC").all();
    res.json(projects);
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const { title, role, client, year, videoUrl, videoFile, thumbnailUrl, description, isFeatured, category } = req.body;
    const info = db.prepare(`
      INSERT INTO projects (title, role, client, year, videoUrl, videoFile, thumbnailUrl, description, isFeatured, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, role, client, year, videoUrl, videoFile, thumbnailUrl, description, isFeatured, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { title, role, client, year, videoUrl, videoFile, thumbnailUrl, description, isFeatured, category } = req.body;
    db.prepare(`
      UPDATE projects 
      SET title = ?, role = ?, client = ?, year = ?, videoUrl = ?, videoFile = ?, thumbnailUrl = ?, description = ?, isFeatured = ?, category = ?
      WHERE id = ?
    `).run(title, role, client, year, videoUrl, videoFile, thumbnailUrl, description, isFeatured, category, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const fields = Object.keys(req.body).filter(k => k !== 'id');
    const values = fields.map(k => req.body[k]);
    const setClause = fields.map(k => `${k} = ?`).join(", ");
    
    db.prepare(`UPDATE settings SET ${setClause} WHERE id = 1`).run(...values);
    res.json({ success: true });
  });

  app.get("/api/cloudinary-signature", (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'portfolio_uploads' },
      process.env.CLOUDINARY_API_SECRET!
    );
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      console.log('File uploaded to Cloudinary successfully:', (req.file as any).path);
      res.json({ url: (req.file as any).path });
    } catch (error) {
      console.error('Upload handler error:', error);
      res.status(500).json({ error: "Internal server error during upload" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.js' || ext === '.mjs') {
          res.setHeader('Content-Type', 'text/javascript');
        } else if (ext === '.css') {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
