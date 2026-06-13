const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/User');
const Post = require('./models/Post');
const Pet = require('./models/Pet');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'petverse_dev_secret_2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petverse';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ============================================================
// Helper: Save Base64 image to disk
// ============================================================
function saveBase64Image(base64Str) {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
        return base64Str;
    }
    try {
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return base64Str;
        let ext = matches[1];
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error('Error saving base64 image:', err);
        return base64Str;
    }
}

// ============================================================
// Auth Middleware
// ============================================================
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '请先登录 / Please login first' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: '登录已过期，请重新登录 / Token expired' });
    }
}

// Optional auth - doesn't block, just attaches userId if present
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
            req.userId = decoded.userId;
        } catch (e) { /* ignore */ }
    }
    next();
}

// ============================================================
// Fallback data for seeding
// ============================================================
const DB_PATH = path.join(__dirname, 'db.json');
function readLocalDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        return { posts: [], pets: [], hotTopics: [] };
    }
}

// ============================================================
// AUTH ROUTES
// ============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: '请填写所有字段 / All fields required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: '密码至少6位 / Password min 6 chars' });
        }

        // Check duplicates
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: '该邮箱已注册 / Email already registered' });
            }
            return res.status(400).json({ error: '用户名已存在 / Username taken' });
        }

        const user = new User({
            username,
            email,
            password,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: '注册成功 / Registration successful',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: '服务器错误 / Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: '请填写邮箱和密码 / Email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: '邮箱或密码错误 / Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: '邮箱或密码错误 / Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: '登录成功 / Login successful',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: '服务器错误 / Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================================
// STATE API (backwards compatible with old frontend)
// ============================================================
app.get('/api/state', optionalAuth, async (req, res) => {
    try {
        // Fetch all posts from MongoDB, populated with author info
        let posts = await Post.find().sort({ createdAt: -1 }).lean();
        let pets = await Pet.find().lean();

        // If DB is empty, seed from local db.json
        if (posts.length === 0) {
            const localData = readLocalDB();
            // Return local data as fallback (seeded content)
            return res.json({
                language: 'zh',
                theme: 'theme-dark',
                posts: localData.posts || [],
                pets: localData.pets || [],
                hotTopics: localData.hotTopics || []
            });
        }

        // Transform posts for frontend compatibility
        const transformedPosts = await Promise.all(posts.map(async (post) => {
            const author = await User.findById(post.authorId).select('username avatar').lean();
            const pet = post.petId ? await Pet.findById(post.petId).lean() : null;
            return {
                id: post._id.toString(),
                petId: post.petId ? post.petId.toString() : null,
                username: author ? author.username : 'Unknown',
                avatar: author ? author.avatar : '',
                location: post.location || '',
                time: getTimeAgo(post.createdAt),
                timeEn: getTimeAgoEn(post.createdAt),
                tag: post.tag || '日常分享',
                tagEn: post.tagEn || 'Daily Story',
                content: post.content,
                contentEn: post.contentEn || post.content,
                image: post.image || '',
                layout: 'single-photo',
                curiousCount: post.curiousCount || 0,
                sharedCount: post.sharedCount || 0,
                commentCount: post.commentCount || 0,
                saveCount: post.saveCount || 0,
                curious: req.userId ? post.likedBy.some(id => id.toString() === req.userId.toString()) : false,
                saved: req.userId ? post.savedBy.some(id => id.toString() === req.userId.toString()) : false,
                shared: false,
                commentsList: post.commentsList || []
            };
        }));

        // Transform pets
        const transformedPets = pets.map(pet => ({
            id: pet._id.toString(),
            name: pet.name,
            species: pet.species,
            speciesKey: pet.speciesKey || '',
            gender: pet.gender || '',
            age: pet.age || '',
            ageEn: pet.ageEn || '',
            gene: pet.gene || '',
            image: pet.image || '',
            companionDays: pet.companionDays || 1,
            location: pet.location || '',
            locationKey: pet.locationKey || '',
            coordinates: pet.coordinates || '',
            followersCount: pet.followersCount || 0,
            ownerName: pet.ownerId ? (await User.findById(pet.ownerId).select('username').lean())?.username : '',
            personality: pet.personality || '',
            personalityEn: pet.personalityEn || '',
            story: pet.story || '',
            storyEn: pet.storyEn || '',
            timeline: pet.timeline || []
        }));

        const localData = readLocalDB();
        res.json({
            language: 'zh',
            theme: 'theme-dark',
            posts: transformedPosts,
            pets: transformedPets,
            hotTopics: localData.hotTopics || []
        });
    } catch (err) {
        console.error('State API error:', err);
        // Fallback to local DB
        const localData = readLocalDB();
        res.json(localData);
    }
});

// ============================================================
// POST ROUTES
// ============================================================

// Create post (auth required)
app.post('/api/posts', authMiddleware, async (req, res) => {
    try {
        const { content, contentEn, image, location, tag, tagEn, petId } = req.body;
        const savedImage = saveBase64Image(image);

        const post = new Post({
            authorId: req.userId,
            content,
            contentEn: contentEn || content,
            image: savedImage,
            location: location || '',
            tag: tag || '日常分享',
            tagEn: tagEn || 'Daily Story',
            petId: petId || null
        });
        await post.save();

        const author = await User.findById(req.userId).select('username avatar').lean();
        res.status(201).json({
            id: post._id.toString(),
            username: author.username,
            avatar: author.avatar,
            content: post.content,
            image: post.image,
            location: post.location,
            time: '刚刚',
            timeEn: 'Just now',
            tag: post.tag,
            tagEn: post.tagEn,
            curiousCount: 0,
            commentCount: 0,
            saveCount: 0,
            sharedCount: 0,
            curious: false,
            saved: false,
            shared: false,
            commentsList: []
        });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like/unlike post (auth required)
app.post('/api/posts/like', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.body;

        // Try MongoDB first
        let post = await Post.findById(postId);
        if (post) {
            const userIdStr = req.userId.toString();
            const alreadyLiked = post.likedBy.some(id => id.toString() === userIdStr);

            if (alreadyLiked) {
                post.likedBy = post.likedBy.filter(id => id.toString() !== userIdStr);
                post.curiousCount = Math.max(0, post.curiousCount - 1);
            } else {
                post.likedBy.push(req.userId);
                post.curiousCount += 1;
            }
            await post.save();
            return res.json({ curious: !alreadyLiked, curiousCount: post.curiousCount });
        }

        // Fallback: local db.json for seeded posts
        const localData = readLocalDB();
        const localPost = localData.posts.find(p => p.id === postId);
        if (localPost) {
            localPost.curious = !localPost.curious;
            localPost.curiousCount += localPost.curious ? 1 : -1;
            fs.writeFileSync(DB_PATH, JSON.stringify(localData, null, 2));
            return res.json({ curious: localPost.curious, curiousCount: localPost.curiousCount });
        }

        res.status(404).json({ error: 'Post not found' });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Comment on post (auth required)
app.post('/api/posts/comment', authMiddleware, async (req, res) => {
    try {
        const { postId, text } = req.body;
        const user = await User.findById(req.userId).select('username avatar').lean();

        // Try MongoDB first
        let post = await Post.findById(postId);
        if (post) {
            post.commentsList.push({
                userId: req.userId,
                name: user.username,
                avatar: user.avatar,
                text
            });
            post.commentCount = post.commentsList.length;
            await post.save();
            return res.json({ commentCount: post.commentCount, commentsList: post.commentsList });
        }

        // Fallback: local db.json
        const localData = readLocalDB();
        const localPost = localData.posts.find(p => p.id === postId);
        if (localPost) {
            if (!localPost.commentsList) localPost.commentsList = [];
            localPost.commentsList.push({ name: user.username, text });
            localPost.commentCount = localPost.commentsList.length;
            fs.writeFileSync(DB_PATH, JSON.stringify(localData, null, 2));
            return res.json({ commentCount: localPost.commentCount, commentsList: localPost.commentsList });
        }

        res.status(404).json({ error: 'Post not found' });
    } catch (err) {
        console.error('Comment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================================
// PET ROUTES
// ============================================================
app.post('/api/pets', authMiddleware, async (req, res) => {
    try {
        const petData = req.body;
        petData.ownerId = req.userId;
        petData.image = saveBase64Image(petData.image);
        petData.timeline = [{
            day: 'Day 1',
            title: '来到新家',
            titleEn: 'Welcome Home',
            desc: '正式开启共同生活！',
            descEn: 'Started our life together!'
        }];

        const pet = new Pet(petData);
        await pet.save();
        res.status(201).json(pet);
    } catch (err) {
        console.error('Create pet error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/pets/timeline', authMiddleware, async (req, res) => {
    try {
        const { petId, day, title, titleEn, desc, descEn } = req.body;

        // Try MongoDB
        let pet = await Pet.findById(petId);
        if (pet) {
            pet.timeline.push({ day, title, titleEn, desc, descEn });
            const daysNum = parseInt((day || '').replace(/[^0-9]/g, ''));
            if (!isNaN(daysNum) && daysNum > pet.companionDays) {
                pet.companionDays = daysNum;
            }
            await pet.save();
            return res.status(201).json(pet);
        }

        res.status(404).json({ error: 'Pet not found' });
    } catch (err) {
        console.error('Timeline error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================================
// SETTINGS
// ============================================================
app.post('/api/settings', optionalAuth, async (req, res) => {
    try {
        const { language, theme } = req.body;
        if (req.userId) {
            await User.findByIdAndUpdate(req.userId, {
                ...(language && { language }),
                ...(theme && { theme })
            });
        }
        res.json({ status: 'ok', language, theme });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================================
// TIME HELPERS
// ============================================================
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`;
    return `${Math.floor(seconds / 604800)}周前`;
}

function getTimeAgoEn(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
}

// ============================================================
// CONNECT TO MONGODB & START SERVER
// ============================================================
async function startServer() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'petverse'
        });
        console.log('✅ MongoDB connected successfully!');
    } catch (err) {
        console.error('⚠️ MongoDB connection failed, running in fallback mode:', err.message);
        console.log('The app will use local db.json as fallback.');
    }

    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🦎 Petverse Server running on http://localhost:${PORT}`);
        console.log(`📦 Database: ${MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local fallback'}`);
        console.log(`====================================================`);
    });
}

startServer();
