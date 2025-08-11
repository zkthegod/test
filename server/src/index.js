import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';
import { uploadToB2 } from './b2.js';

const app = express();
const port = process.env.PORT || 3001;

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/gif','image/png','image/webp','image/jpeg'].includes(file.mimetype);
    if (!ok) return cb(new Error('Unsupported file type'));
    cb(null, true);
  }
});

// DB pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try{
    const shape = (req.body.shape || 'rect').toLowerCase();
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const id = nanoid(12);
    const ext = extFromMime(req.file.mimetype);
    const fileName = `${id}.${ext}`;

    // Upload to B2
    const url = await uploadToB2(req.file.buffer, fileName, req.file.mimetype);

    // Insert metadata
    const meta = {
      id,
      url,
      shape,
      mime: req.file.mimetype,
      created_at: new Date(),
    };
    await pool.execute(
      'CREATE TABLE IF NOT EXISTS uploads (id VARCHAR(24) PRIMARY KEY, url TEXT, shape VARCHAR(32), mime VARCHAR(64), created_at DATETIME)'
    );
    await pool.execute('INSERT INTO uploads (id, url, shape, mime, created_at) VALUES (?,?,?,?,?)', [meta.id, meta.url, meta.shape, meta.mime, meta.created_at]);

    res.json({
      id,
      url,
      shape,
      bbcode: `[img]${url}[/img]`,
      html: `<span class="embed-shape ${shapeToClass(shape)}" style="display:inline-block;overflow:hidden"><img src="${url}" alt="" style="display:block;width:100%;height:auto"/></span>`
    });
  } catch (e){
    console.error(e);
    res.status(400).json({ error: e.message || 'Upload failed' });
  }
});

app.listen(port, () => {
  console.log('Uploader server listening on', port);
});

function extFromMime(m){
  if (m === 'image/gif') return 'gif';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/jpeg') return 'jpg';
  return 'bin';
}
function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}