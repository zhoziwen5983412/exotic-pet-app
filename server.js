const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Increase limit to allow Base64 large image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Image(base64Str) {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
        return base64Str;
    }
    try {
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64Str;
        }
        let ext = matches[1];
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filepath, buffer);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error('Error saving base64 image:', err);
        return base64Str;
    }
}



// Helper: Read database file
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading db.json, returning empty structure', err);
        return { language: 'zh', theme: 'theme-dark', pets: [], posts: [], hotTopics: [] };
    }
}

// Helper: Write database file
function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing db.json', err);
    }
}

// 1. GET /api/state: Return the whole state
app.get('/api/state', (req, res) => {
    const db = readDB();
    res.json(db);
});

// 2. POST /api/posts: Create a new post (Supports Base64 images)
app.post('/api/posts', (req, res) => {
    const db = readDB();
    const newPost = req.body;
    
    newPost.id = 'p_' + Date.now();
    newPost.image = saveBase64Image(newPost.image);
    newPost.avatar = saveBase64Image(newPost.avatar);
    newPost.curiousCount = newPost.curiousCount || 0;
    newPost.sharedCount = newPost.sharedCount || 0;
    newPost.commentCount = 0;
    newPost.saveCount = 0;
    newPost.curious = false;
    newPost.shared = false;
    newPost.saved = false;
    newPost.commentsList = [];

    db.posts.unshift(newPost);
    writeDB(db);

    res.status(201).json(newPost);
});

// 3. POST /api/posts/like: Toggle curious (like) status
app.post('/api/posts/like', (req, res) => {
    const { postId } = req.body;
    const db = readDB();
    
    const post = db.posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    if (post.curious) {
        post.curiousCount = Math.max(0, post.curiousCount - 1);
        post.curious = false;
    } else {
        post.curiousCount += 1;
        post.curious = true;
    }

    writeDB(db);
    res.json(post);
});

// 4. POST /api/posts/comment: Add a new comment
app.post('/api/posts/comment', (req, res) => {
    const { postId, name, text } = req.body;
    const db = readDB();

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.commentsList) post.commentsList = [];
    
    post.commentsList.push({
        name: name || 'Anonymous',
        text: text
    });
    
    post.commentCount = post.commentsList.length;

    writeDB(db);
    res.json(post);
});

// 5. POST /api/pets: Add a new pet (Supports Base64 avatars)
app.post('/api/pets', (req, res) => {
    const db = readDB();
    const newPet = req.body;

    newPet.id = 'pet_' + Date.now();
    newPet.image = saveBase64Image(newPet.image);
    newPet.logs = [];
    newPet.followersCount = 1;
    newPet.companionDays = 1;
    newPet.timeline = [
        { id: 't_new_' + Date.now(), day: 'Day 1', title: '来到新家', titleEn: 'Welcome Home', desc: '安顿好小家伙，正式开启共同生活相册记录！', descEn: 'Set up enclosure, officially started our life album timeline!' }
    ];

    db.pets.push(newPet);
    writeDB(db);

    res.status(201).json(newPet);
});

// 5.5 POST /api/pets/timeline: Add a timeline node to a pet
app.post('/api/pets/timeline', (req, res) => {
    const { petId, day, title, titleEn, desc, descEn } = req.body;
    const db = readDB();

    const pet = db.pets.find(p => p.id === petId);
    if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
    }

    if (!pet.timeline) pet.timeline = [];

    const newNode = {
        id: 't_node_' + Date.now(),
        day: day || 'Day 1',
        title: title || '日常记录',
        titleEn: titleEn || 'Daily Log',
        desc: desc || '',
        descEn: descEn || ''
    };

    // Keep ascending chronological order
    pet.timeline.push(newNode);

    if (day) {
        const daysNum = parseInt(day.replace(/[^0-9]/g, ''));
        if (!isNaN(daysNum) && daysNum > pet.companionDays) {
            pet.companionDays = daysNum;
        }
    }

    writeDB(db);
    res.status(201).json(pet);
});

// 6. POST /api/settings: Save language and theme preferences
app.post('/api/settings', (req, res) => {
    const { language, theme } = req.body;
    const db = readDB();

    if (language) db.language = language;
    if (theme) db.theme = theme;

    writeDB(db);
    res.json({ status: 'ok', language: db.language, theme: db.theme });
});

// Start listening
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Petverse Mock Backend running on http://localhost:${PORT}`);
    console.log(`Database source file: ${DB_PATH}`);
    console.log(`====================================================`);
});
