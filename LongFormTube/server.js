const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Folder for uploaded videos
const uploadFolder = path.join(__dirname, 'uploads');
if(!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Serve frontend
app.use(express.static(__dirname));

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  const title = req.body.title || 'Untitled';
  if(req.file){
    // Save metadata
    let videos = [];
    try {
      videos = JSON.parse(fs.readFileSync('videos.json', 'utf8') || '[]');
    } catch {}
    videos.push({ title, url: '/uploads/' + req.file.filename });
    fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2));
    res.sendStatus(200);
  } else res.sendStatus(400);
});

// Serve uploaded videos
app.use('/uploads', express.static(uploadFolder));

// Send list of videos
app.get('/videos', (req, res) => {
  let videos = [];
  try {
    videos = JSON.parse(fs.readFileSync('videos.json', 'utf8') || '[]');
  } catch {}
  res.json(videos);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
