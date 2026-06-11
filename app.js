// ==========================================
// 1. STATE & API CONFIGURATION
// ==========================================

const API_URL = 'http://localhost:3000/api';
let isBackendConnected = false;

const state = {
    language: localStorage.getItem('petverse_language') || 'zh', // 'zh' or 'en'
    theme: localStorage.getItem('petverse_theme') || 'theme-dark', // 'theme-dark' or 'theme-light'
    activeTab: 'home', // 'home' | 'circles' | 'record' | 'messages' | 'me'
    activeHomeHeaderTab: 'world', // 'follow' | 'world' | 'rank' | 'guide'
    activePetProfileId: null, // to show specific pet profile
    activePostDetailId: null, // to show specific post detail
    selectedCountryFilter: null, // 'tokyo' | 'saopaulo' etc.
    selectedSpeciesFilter: null, // species filter from circles
    mapExpanded: false, // map expansion state
    activeCommentPostId: null, // comment drawer active post ID
    radarActive: false, // radar state active
    circlesSubTab: 'circles', // 'circles' | 'care'
    activeCareDetailKey: null, // to show specific care details
    isLoggedIn: localStorage.getItem('petverse_is_logged_in') === 'true',
    blockedUsers: localStorage.getItem('petverse_blocked_users') ? JSON.parse(localStorage.getItem('petverse_blocked_users')) : [],
    loginCallback: null,
    tempLoginAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    userProfile: {
        username: '旅行极客-Me',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        desc: '🦎 睫角守宫、角蛙、节肢动物狂热爱好者 | 专注于热带雨林仿造景生态设计。'
    },
    pets: [],
    posts: [],
    hotTopics: [],
    questions: []
};

// Fallback datasets (In case backend server.js is offline)
const fallbackData = {
    language: 'zh',
    theme: 'theme-dark',
    pets: [
        {
            id: 'pet_mochi',
            name: 'Mochi (Offline)',
            species: '睫角守宫 (Crested Gecko)',
            speciesKey: 'crested_gecko',
            gender: '♀',
            age: '1.5年',
            ageEn: '1.5 yrs',
            gene: '黄莉莉皮皮 (Yellow Lily White)',
            image: 'assets/pet_gecko.png',
            companionDays: 512,
            location: "日本东京 (Tokyo, Japan)",
            locationKey: "tokyo",
            coordinates: "35.6762° N, 139.6503° E",
            followersCount: 4250,
            ownerName: "Kenji_T",
            personality: "温顺且超级贪吃，喜欢在我手心睡觉。",
            personalityEn: "Gentle and very greedy, loves sleeping in my palm.",
            story: "Mochi是我在东京宠物展第一眼相中的小家伙。从刚出生只有几克重，到现在能稳稳吸附在窗台，它见证了我每一个熬夜做设计的夜晚。",
            storyEn: "Mochi is the little guy I picked at the Tokyo Pet Show. From just a few grams to now firmly holding on the window sill, she witnessed all my late-night design work.",
            timeline: [
                { id: "t1", day: "Day 1", title: "初次见面", titleEn: "First Meet", desc: "坐着JR线把它带回了家，只有3克重，小小的像颗花生。", "descEn": "Brought her home via JR line. Only 3g, tiny like a peanut." }
            ]
        }
    ],
    posts: [
        {
            id: 'p1',
            petId: 'pet_mochi',
            username: 'Kenji_T',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
            location: '日本东京 (Tokyo, Japan)',
            coordinates: '35.6762° N, 139.6503° E',
            time: '2小时前',
            timeEn: '2 hrs ago',
            tag: '成长日记',
            tagEn: 'Growth Log',
            content: '【离线模式】本地服务器未启动。请在项目目录下执行 cmd /c node server.js 开启数据库服务以保存修改！',
            contentEn: '[Offline Mode] Local mock backend not running. Execute node server.js in terminal to persist changes!',
            image: 'assets/pet_gecko.png',
            layout: 'single-photo',
            curiousCount: 248,
            sharedCount: 42,
            commentCount: 36,
            saveCount: 89,
            curious: false,
            shared: false,
            saved: false,
            commentsList: [
                { name: "Anna (Germany)", text: "Server is offline, but sandbox mode is fully operational!" }
            ]
        }
    ],
    hotTopics: [
        { id: 'ht1', title: '服务器未启动，请运行 node server.js', titleEn: 'Server offline, please run node server.js' }
    ]
};

// ==========================================
// 2. BILINGUAL TRANSLATION DICTIONARY
// ==========================================
const translations = {
    zh: {
        appName: 'Petverse',
        greet: '记录共同生活',
        tabHome: '首页',
        tabCircles: '百科',
        recordTab: '+',
        messagesTab: '消息',
        meTab: '我',
        filterAll: '全部地区',
        filterAsia: '日本东京',
        filterSA: '巴西圣保罗',
        filterAussie: '悉尼',
        topicTitle: '本周全球动态话题',
        curious: '好奇',
        shared: '同款经历',
        comment: '评论',
        save: '收藏',
        btnTouch: '摸摸它',
        followedPet: '已关注此宠',
        followPet: '关注宠物',
        growthTimeline: '成长记录时间轴',
        petStoryTitle: '关于我们的故事',
        companionDays: '相伴天数',
        followers: '粉丝',
        personality: '性格特点',
        placeholderSearch: '搜品种、圈子、帖子、用户...',
        msgCenterTitle: '消息中心',
        myShowcase: '我的异宠橱窗',
        settingTheme: '界面主题',
        settingLang: '系统语言',
        settingAbout: '版本信息',
        justNow: '刚刚',
        btnSubmit: '发布到世界',
        promptHeader: '全球创作者灵感',
        prompt1: '它今天做了什么有趣的事？',
        prompt2: '这是你们共同生活的第几天？',
        prompt3: '当时发生了什么？想问其他宠主什么？',
        createTitle: '记录新鲜事',
        placeholderPost: '讲述你和宠物今天的故事...',
        choosePet: '选择主角异宠',
        writeTitle: '写下生活瞬间...',
        detailTitle: '动态详情',
        btnTranslate: '🌍 翻译评论',
        back: '返回首页',
        mapTitle: '此刻的世界',
        mapSub: '点击定位签，查看该地区异宠生活',
        circlesTitle: '异宠百科圈子',
        tabFollow: '关注',
        tabWorld: '世界',
        tabRank: '热榜',
        tabGuide: '养护',
        rankHeader: '今日异宠热榜',
        guideHeader: '精品异宠养护知识',
        addLogTitle: '添加成长日志',
        companionDayLabel: '相伴天数',
        logTitleLabel: '大事记标题',
        logDescLabel: '日志内容描述',
        cancelBtn: '取消',
        submitBtn: '提交',
        sendBtn: '发送',
        placeholderComment: '说点什么...',
        loginTitle: '加入 Petverse 社区',
        loginUsernameLabel: '个性昵称',
        loginDescLabel: '个人简介',
        loginSubmitBtn: '立即加入',
        guidelinesTitle: 'Petverse 社区公约',
        guidelinesHeading1: '1. 尊重与善意',
        guidelinesDesc1: '在交流异宠饲养心得时，请保持礼貌与客观。严禁侮辱、谩骂、人身攻击或恶意引战。',
        guidelinesHeading2: '2. 合法与负责任饲养',
        guidelinesDesc2: '倡导科学与合规饲养。严禁宣传、展示、交易任何法律法规禁止的野生动物或濒危保护动物，杜绝野捕与非法倒卖。',
        guidelinesHeading3: '3. 严禁放生外来物种',
        guidelinesDesc3: '外来异宠在野外可能会破坏生态平衡，甚至引发安全隐患。严禁一切不负责任的弃养、放生或散养行为。',
        guidelinesHeading4: '4. 真实与原创',
        guidelinesDesc4: '鼓励分享真实的日常瞬间和成长记录，禁止发布虚假诱导信息或剽窃他人摄影作品。',
        guidelinesAgreeBtn: '我已阅读并同意'
    },
    en: {
        appName: 'Petverse',
        greet: 'Exotic Journal',
        tabHome: 'Home',
        tabCircles: 'Encyclopedia',
        recordTab: '+',
        messagesTab: 'Inbox',
        meTab: 'Me',
        filterAll: 'All Regions',
        filterAsia: 'Tokyo, Japan',
        filterSA: 'Sao Paulo, Brazil',
        filterAussie: 'Sydney',
        topicTitle: 'Weekly Worldwide Topics',
        curious: 'Curious',
        shared: 'Like Me',
        comment: 'Comments',
        save: 'Save',
        btnTouch: 'Touch It',
        followedPet: 'Following Pet',
        followPet: 'Follow Pet',
        growTimeline: 'Life & Growth Timeline',
        petStoryTitle: 'Our Story Together',
        companionDays: 'Days Together',
        followers: 'Followers',
        personality: 'Personality',
        placeholderSearch: 'Search species, locations, owners...',
        msgCenterTitle: 'Inbox Messages',
        myShowcase: 'My Exotic Showcase',
        settingTheme: 'Visual Theme',
        settingLang: 'System Language',
        settingAbout: 'Version Info',
        justNow: 'Just now',
        btnSubmit: 'Post to World',
        promptHeader: 'Creator Inspiration Helper',
        prompt1: 'What funny thing did it do today?',
        prompt2: 'What day of your life together is this?',
        prompt3: 'What happened? Want to ask other keepers?',
        createTitle: 'Create Record',
        placeholderPost: 'Write down your story today...',
        choosePet: 'Select Pet Subject',
        writeTitle: 'Record a Moment...',
        detailTitle: 'Post Detail',
        btnTranslate: '🌍 Translate Comments',
        back: 'Back to Feed',
        mapTitle: 'World Right Now',
        mapSub: 'Click pins to view exotic dynamics in that region',
        circlesTitle: 'Exotic Species Circles',
        tabFollow: 'Follow',
        tabWorld: 'World',
        tabRank: 'Hot',
        tabGuide: 'Care',
        rankHeader: 'Today\'s Hot Ranks',
        guideHeader: 'Exotic Pet Care Guides',
        addLogTitle: 'Add Growth Log',
        companionDayLabel: 'Days Together',
        logTitleLabel: 'Milestone Title',
        logDescLabel: 'Description',
        cancelBtn: 'Cancel',
        submitBtn: 'Submit',
        sendBtn: 'Send',
        placeholderComment: 'Add a comment...',
        loginTitle: 'Join Petverse Community',
        loginUsernameLabel: 'Nickname',
        loginDescLabel: 'Bio / Description',
        loginSubmitBtn: 'Join Now',
        guidelinesTitle: 'Petverse Community Guidelines',
        guidelinesHeading1: '1. Respect & Kindness',
        guidelinesDesc1: 'Please remain polite and objective when discussing care tips. Insults, harassment, or personal attacks are strictly prohibited.',
        guidelinesHeading2: '2. Legal & Responsible Husbandry',
        guidelinesDesc2: 'We advocate scientific and legal husbandry. It is strictly prohibited to promote, showcase, or trade any endangered/protected animals. Say NO to wild-catching.',
        guidelinesHeading3: '3. NO Release of Invasive Species',
        guidelinesDesc3: 'Exotic pets released into the wild can destroy ecological balances. Irresponsible abandonment, release, or free-roaming is strictly forbidden.',
        guidelinesHeading4: '4. Truthfulness & Originality',
        guidelinesDesc4: 'We encourage sharing genuine records. Do not publish deceptive content or plagiarize others photography work.',
        guidelinesAgreeBtn: 'I Agree'
    }
};

const circlesCatalog = [
    {
        category: "两栖爬行 (Reptiles)",
        categoryEn: "Reptiles & Amphibians",
        items: [
            { name: "睫角守宫", nameEn: "Crested Gecko", key: "crested_gecko", count: "12.4k posts", img: "assets/pet_gecko.png" },
            { name: "高冠变色龙", nameEn: "Veiled Chameleon", key: "veiled_chameleon", count: "8.6k posts", img: "assets/pet_chameleon.png" },
            { name: "玉米蛇", nameEn: "Corn Snake", key: "corn_snake", count: "15.1k posts", img: "assets/pet_snake.png" },
            { name: "肥尾守宫", nameEn: "Fat-tailed Gecko", key: "fat_tail_gecko", count: "4.2k posts", img: "assets/pet_gecko.png" },
            { name: "蓝舌石龙子", nameEn: "Blue-tongued Skink", key: "blue_tongued_skink", count: "3.9k posts", img: "assets/logo.png" },
            { name: "角蛙", nameEn: "Pacman Frog", key: "pacman_frog", count: "6.2k posts", img: "assets/logo.png" },
            { name: "红眼鹰蜥", nameEn: "Red-eyed Skink", key: "red_eyed_skink", count: "2.1k posts", img: "assets/logo.png" },
            { name: "鬃狮蜥", nameEn: "Bearded Dragon", key: "bearded_dragon", count: "11.3k posts", img: "assets/logo.png" }
        ]
    },
    {
        category: "节肢昆虫 (Arthropods)",
        categoryEn: "Insects & Arachnids",
        items: [
            { name: "捕鸟蛛", nameEn: "Tarantula", key: "tarantula", count: "9.5k posts", img: "assets/logo.png" },
            { name: "帝王蝎", nameEn: "Emperor Scorpion", key: "scorpion", count: "3.2k posts", img: "assets/logo.png" },
            { name: "兰花螳螂", nameEn: "Orchid Mantis", key: "mantis", count: "2.8k posts", img: "assets/logo.png" },
            { name: "独角仙", nameEn: "Rhinoceros Beetle", key: "beetle", count: "5.4k posts", img: "assets/logo.png" }
        ]
    },
    {
        category: "小型哺乳 (Mammals)",
        categoryEn: "Small Mammals",
        items: [
            { name: "蜜袋鼯", nameEn: "Sugar Glider", key: "sugar_glider", count: "8.1k posts", img: "assets/logo.png" },
            { name: "龙猫", nameEn: "Chinchilla", key: "chinchilla", count: "7.4k posts", img: "assets/logo.png" },
            { name: "迷你刺猬", nameEn: "Pygmy Hedgehog", key: "hedgehog", count: "4.8k posts", img: "assets/logo.png" },
            { name: "仓鼠", nameEn: "Hamster", key: "hamster", count: "14.2k posts", img: "assets/logo.png" }
        ]
    }
];

const careGuides = [
    { id: "g1", title: "睫角守宫饲养全攻略：从开食到造景", titleEn: "Crested Gecko Care Guide: Feeding & Vivarium", views: "12k views", readTime: "5 min read", img: "assets/pet_gecko.png" },
    { id: "g2", title: "变色龙为什么拒食？新手避坑指南", titleEn: "Why chameleons refuse food: Newbie guide", views: "8.5k views", readTime: "8 min read", img: "assets/pet_chameleon.png" },
    { id: "g3", title: "如何设计一个雨林缸：植物与垫材选择", titleEn: "Building a vivarium: plant and substrate guide", views: "15k views", readTime: "10 min read", img: "assets/logo.png" },
    { id: "g4", title: "玉米蛇温湿度控制与常见肠胃问题", titleEn: "Corn snake heating and digestion guides", views: "6.9k views", readTime: "4 min read", img: "assets/pet_snake.png" }
];

// ==========================================
// 3. API SYNCHRONIZATION
// ==========================================

async function syncState() {
    try {
        const response = await fetch(`${API_URL}/state`);
        if (!response.ok) throw new Error('API server returned error');
        
        const data = await response.json();
        state.language = data.language || 'zh';
        state.theme = data.theme || 'theme-dark';
        state.pets = data.pets || [];
        state.posts = data.posts || [];
        state.hotTopics = data.hotTopics || [];
        isBackendConnected = true;
        console.log('Database synced successfully with backend server.');
        updateConnectionStatus(true);
    } catch (err) {
        console.warn('API Server not responding. Running in offline sandbox mode.', err);
        if (state.posts.length === 0) {
            state.language = fallbackData.language;
            state.theme = fallbackData.theme;
            state.pets = fallbackData.pets;
            state.posts = fallbackData.posts;
            state.hotTopics = fallbackData.hotTopics;
        }
        isBackendConnected = false;
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(connected) {
    const panel = document.querySelector('.control-subtitle');
    if (panel) {
        if (connected) {
            panel.innerHTML = `🟢 <strong style="color:var(--color-brand)">数据库服务在线 (Persisting to db.json)</strong>`;
        } else {
            panel.innerHTML = `🔴 <strong style="color:var(--color-accent)">单机沙盒模式 (Offline Sandbox)</strong> | 终端运行 node server.js 激活保存`;
        }
    }
}

// ==========================================
// 4. UI RENDERING LOGIC
// ==========================================

function getT(key) {
    return translations[state.language][key] || key;
}

function updateAppLanguage() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        el.textContent = getT(key);
    });

    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
        const key = el.getAttribute('data-t-placeholder');
        el.setAttribute('placeholder', getT(key));
    });
}

function renderHeader() {
    const topRow = document.querySelector('.header-top');
    const chSliderWrap = document.querySelector('.tab-headers-magazine');
    const filterRow = document.querySelector('.discovery-filter-row');

    if (!topRow || !chSliderWrap || !filterRow) return;

    if (state.activeTab === 'home') {
        // Show scan icon, search bar, bell icon
        topRow.innerHTML = `
            <div class="action-icon-btn scan-outline-btn" onclick="alert('扫一扫功能开发中... / Scan is coming soon!')">
                <span style="font-size: 14px; font-weight: bold; border: 1.5px solid var(--text-primary); border-radius: 4px; padding: 1px 4px; letter-spacing: 0;">📸</span>
            </div>
            <div class="search-box-magazine" style="flex: 1; display: flex; align-items: center; gap: 6px; background-color: var(--tag-bg); padding: 6px 12px; border-radius: 18px; font-size: 11px; color: var(--text-secondary);">
                <span>🔍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getT('placeholderSearch')}</span>
            </div>
            <div class="notification-bell" onclick="alert('消息通知暂无新消息 / No notifications')">
                <span>🔔</span>
                <div class="bell-badge"></div>
            </div>
        `;

        // Show capsule tabs: 关注, 世界, 热榜, 养护
        chSliderWrap.style.display = 'flex';
        chSliderWrap.innerHTML = `
            <div class="${state.activeHomeHeaderTab === 'follow' ? 'active' : ''}" onclick="switchHomeSubTab('follow')">${getT('tabFollow')}</div>
            <div class="${state.activeHomeHeaderTab === 'world' ? 'active' : ''}" onclick="switchHomeSubTab('world')">${getT('tabWorld')}</div>
            <div class="${state.activeHomeHeaderTab === 'rank' ? 'active' : ''}" onclick="switchHomeSubTab('rank')">${getT('tabRank')}</div>
            <div class="${state.activeHomeHeaderTab === 'guide' ? 'active' : ''}" onclick="switchHomeSubTab('guide')">${getT('tabGuide')}</div>
        `;

        // Geolocation filters: only show on follow or world channel feeds
        if (state.activeHomeHeaderTab === 'world' || state.activeHomeHeaderTab === 'follow') {
            filterRow.style.display = 'flex';
            renderFilterRow();
        } else {
            filterRow.style.display = 'none';
        }
    } else {
        // Not homepage, change top row to simple page title
        chSliderWrap.style.display = 'none';
        filterRow.style.display = 'none';

        let titleText = '';
        if (state.activeTab === 'circles') titleText = getT('circlesTitle');
        else if (state.activeTab === 'record') titleText = getT('createTitle');
        else if (state.activeTab === 'messages') titleText = getT('msgCenterTitle');
        else if (state.activeTab === 'me') titleText = getT('meTab');

        topRow.innerHTML = `
            <div class="logo-brand" style="font-size:16px;">${titleText}</div>
            <div class="header-actions">
                <span class="action-icon-btn" onclick="switchTab('home')">🏠</span>
            </div>
        `;
    }
}

function renderTabs() {
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === state.activeTab) {
            item.classList.add('active');
        }
    });
}

function renderFilterRow() {
    const filterRow = document.querySelector('.discovery-filter-row');
    if (!filterRow) return;

    filterRow.innerHTML = `
        <div class="filter-pill ${state.selectedCountryFilter === null ? 'active' : ''}" onclick="setCountryFilter(null)">${getT('filterAll')}</div>
        <div class="filter-pill ${state.selectedCountryFilter === 'tokyo' ? 'active' : ''}" onclick="setCountryFilter('tokyo')">${getT('filterAsia')}</div>
        <div class="filter-pill ${state.selectedCountryFilter === 'saopaulo' ? 'active' : ''}" onclick="setCountryFilter('saopaulo')">${getT('filterSA')}</div>
    `;
}

function setCountryFilter(filter) {
    state.selectedCountryFilter = filter;
    renderFilterRow();
    renderPageHome();
}

// ---- Page: Home Feed (首页) ----
// ---- Page: Home Feed (首页) ----
function renderPageHome() {
    const container = document.getElementById('page-home');
    if (!container) return;

    if (state.activeHomeHeaderTab === 'world' || state.activeHomeHeaderTab === 'follow') {
        // Xiaohongshu-style two-column waterfall mixed grid
        let displayPosts = state.posts.filter(p => !state.blockedUsers.includes(p.username));
        
        if (state.activeHomeHeaderTab === 'follow') {
            displayPosts = displayPosts.filter(p => p.username === 'Kenji_T');
        }

        if (state.selectedCountryFilter) {
            displayPosts = displayPosts.filter(p => {
                if (!p.petId) return p.locationKey === state.selectedCountryFilter;
                const petObj = state.pets.find(pet => pet.id === p.petId);
                return (petObj && petObj.locationKey === state.selectedCountryFilter) || p.locationKey === state.selectedCountryFilter;
            });
        }

        if (state.selectedSpeciesFilter) {
            displayPosts = displayPosts.filter(p => {
                if (!p.petId) return false;
                const petObj = state.pets.find(pet => pet.id === p.petId);
                return petObj && petObj.speciesKey === state.selectedSpeciesFilter;
            });
        }

        // Search Filter
        if (typeof searchQuery !== 'undefined' && searchQuery) {
            displayPosts = displayPosts.filter(p => {
                const petObj = p.petId ? state.pets.find(pet => pet.id === p.petId) : null;
                const petName = petObj ? petObj.name.toLowerCase() : '';
                const petSpecies = petObj ? petObj.species.toLowerCase() : '';
                const tag = p.tag ? p.tag.toLowerCase() : '';
                const tagEn = p.tagEn ? p.tagEn.toLowerCase() : '';
                const content = p.content ? p.content.toLowerCase() : '';
                const contentEn = p.contentEn ? p.contentEn.toLowerCase() : '';
                const username = p.username ? p.username.toLowerCase() : '';
                const location = p.location ? p.location.toLowerCase() : '';
                
                return content.includes(searchQuery) ||
                       contentEn.includes(searchQuery) ||
                       tag.includes(searchQuery) ||
                       tagEn.includes(searchQuery) ||
                       username.includes(searchQuery) ||
                       petName.includes(searchQuery) ||
                       location.includes(searchQuery) ||
                       petSpecies.includes(searchQuery);
            });
        }

        // In-App Map Widget (World Channel only)
        let mapWidgetHtml = '';
        if (state.activeHomeHeaderTab === 'world') {
            mapWidgetHtml = `
                <div class="app-map-widget">
                    <div class="app-map-widget-header" onclick="toggleAppMap()">
                        <span class="app-map-widget-title" data-t="mapTitle">${getT('mapTitle')}</span>
                        <span class="app-map-widget-toggle" id="app-map-toggle-icon">${state.mapExpanded ? '▼ 收起 (Collapse)' : '▲ 展开 (Expand)'}</span>
                    </div>
                    <div class="app-map-viewport ${state.mapExpanded ? 'active' : ''}">
                        <!-- Radar wave container -->
                        <div class="radar-wave-container ${state.radarActive ? 'active' : ''}">
                            <div class="radar-pulse"></div>
                            <div class="radar-pulse"></div>
                            <div class="radar-pulse"></div>
                        </div>

                        <!-- Pin: Tokyo -->
                        <div class="map-marker" style="top: 30%; left: 75%;" onclick="event.stopPropagation(); triggerAppMapFilter('tokyo')" title="Tokyo, Japan">
                            <div class="map-marker-pin"></div>
                            <div class="map-marker-label" style="font-size:7px;">日本: Mochi</div>
                        </div>
                        <!-- Pin: Sao Paulo -->
                        <div class="map-marker" style="top: 65%; left: 35%;" onclick="event.stopPropagation(); triggerAppMapFilter('saopaulo')" title="Sao Paulo, Brazil">
                            <div class="map-marker-pin"></div>
                            <div class="map-marker-label" style="font-size:7px;">巴西: Zuzu</div>
                        </div>
                        <!-- Pin: Beijing -->
                        <div class="map-marker" style="top: 32%; left: 68%;" onclick="event.stopPropagation(); triggerAppMapFilter('beijing')" title="Beijing, China">
                            <div class="map-marker-pin"></div>
                            <div class="map-marker-label" style="font-size:7px;">北京: Kenji</div>
                        </div>

                        <!-- Pin: Keeper near Beijing (radar only) -->
                        <div class="map-marker map-marker-keeper" style="top: 45%; left: 63%; display: ${state.radarActive ? 'flex' : 'none'};" onclick="event.stopPropagation(); showMapInfoPopup('keeper_beijing')" title="爬友: 龙猫酱 (1.2km)">
                            <div class="map-marker-pin"></div>
                            <div class="map-marker-label" style="font-size:7px;">爬友: 龙猫酱</div>
                        </div>
                        <!-- Pin: Vet near Beijing (radar only) -->
                        <div class="map-marker map-marker-vet" style="top: 25%; left: 65%; display: ${state.radarActive ? 'flex' : 'none'};" onclick="event.stopPropagation(); showMapInfoPopup('vet_beijing')" title="诊所: 芭比堂 (2.5km)">
                            <div class="map-marker-pin"></div>
                            <div class="map-marker-label" style="font-size:7px;">诊所: 芭比堂</div>
                        </div>

                        <!-- Radar switch button -->
                        <button class="map-radar-toggle-btn ${state.radarActive ? 'active' : ''}" onclick="event.stopPropagation(); toggleMapRadar()">
                            ${state.radarActive ? '📡 雷达: 开启' : '📡 雷达: 关闭'}
                        </button>

                        <!-- Info popup overlay inside map -->
                        <div class="map-info-popup-card" id="map-info-popup-card"></div>
                    </div>
                </div>
            `;
        }

        // Eco-capsules list (故事胶囊)
        const storyCapsulesHtml = state.pets.map(pet => `
            <div class="story-capsule" onclick="showPetProfile('${pet.id}')">
                <div class="observation-window">
                    <div class="window-inner">
                        <img src="${pet.image}" alt="capsule pic" loading="lazy">
                    </div>
                </div>
                <span class="story-title">${pet.name}</span>
            </div>
        `).join('');

        // Divide posts into two columns (odd/even index) to create waterfall
        let leftColPosts = [];
        let rightColPosts = [];
        displayPosts.forEach((post, i) => {
            if (i % 2 === 0) leftColPosts.push(post);
            else rightColPosts.push(post);
        });

        const renderColumn = (postsList) => {
            if (postsList.length === 0) return `<div style="text-align:center; padding: 20px; color:var(--text-secondary); font-size:10px; width:100%;">暂无内容 / No posts</div>`;
            return postsList.map((post, idx) => {
                const petObj = post.petId ? state.pets.find(p => p.id === post.petId) : null;
                // Varying image heights for true masonry waterfall look (120px to 170px)
                const imgHeight = idx % 2 === 0 ? '135px' : '175px';

                return `
                    <div class="post-waterfall-card" onclick="showPostDetail('${post.id}')">
                        <div class="waterfall-img-wrap" style="height: ${imgHeight}">
                            <img src="${post.image}" alt="post img" loading="lazy">
                        </div>
                        <div class="waterfall-body">
                            <span class="waterfall-meta-loc">${state.language === 'zh' ? post.location.split(' ')[0] : post.location.split(',')[0]}</span>
                            <p class="waterfall-title">${state.language === 'zh' ? post.content : post.contentEn}</p>
                            <div class="waterfall-footer">
                                <div class="waterfall-author" onclick="event.stopPropagation(); ${post.petId ? `showPetProfile('${post.petId}')` : ''}">
                                    <img class="waterfall-author-av" src="${post.avatar}" alt="av" loading="lazy">
                                    <span class="waterfall-author-name">${petObj ? petObj.name : post.username}</span>
                                </div>
                                <div class="waterfall-like ${post.curious ? 'active' : ''}" onclick="event.stopPropagation(); toggleCurious('${post.id}')">
                                    <span>${post.curious ? '❤️' : '🤍'}</span>
                                    <span>${formatNumber(post.curiousCount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };

        let filterNoticeHtml = '';
        if (state.selectedSpeciesFilter) {
            filterNoticeHtml += `
                <div class="loc-ticket" style="margin-bottom:10px; background-color:var(--color-accent-light); color:var(--color-accent); border-radius:4px; padding:6px 12px; justify-content:space-between; width: 100%;">
                    <span>🔍 筛选圈子: ${state.selectedSpeciesFilter}</span>
                    <span style="cursor:pointer; font-weight:bold;" onclick="clearSpeciesFilter()">✕ 清除</span>
                </div>
            `;
        }
        if (state.selectedCountryFilter) {
            filterNoticeHtml += `
                <div class="loc-ticket" style="margin-bottom:10px; background-color:var(--color-accent-light); color:var(--color-accent); border-radius:4px; padding:6px 12px; justify-content:space-between; width: 100%;">
                    <span>📍 筛选国家: ${state.selectedCountryFilter}</span>
                    <span style="cursor:pointer; font-weight:bold;" onclick="clearCountryFilter()">✕ 清除</span>
                </div>
            `;
        }

        container.innerHTML = `
            ${mapWidgetHtml}

            <div class="stories-container" style="width: 100%;">
                <div class="stories-list">
                    ${storyCapsulesHtml}
                </div>
            </div>

            ${filterNoticeHtml}

            <!-- Waterfall double rows -->
            <div class="waterfall-container">
                <div class="waterfall-column">${renderColumn(leftColPosts)}</div>
                <div class="waterfall-column">${renderColumn(rightColPosts)}</div>
            </div>
        `;

    } else if (state.activeHomeHeaderTab === 'rank') {
        // Today's Hot Rank (热榜) - matching user's original screenshot
        const ranksHtml = state.hotTopics.map((topic, index) => `
            <div class="rank-item" onclick="selectHotTopic('${topic.id}')" style="border-bottom: 1px solid var(--border-color); padding: 14px 10px;">
                <div class="rank-num rank-num-${index <= 2 ? index + 1 : 'other'}" style="margin-right: 12px;">${index + 1}</div>
                <div class="rank-text" style="font-size:12px; font-weight:700;">${state.language === 'zh' ? topic.title : topic.titleEn}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <!-- Original banner replicated -->
            <div class="banner-card" style="margin-bottom:16px;">
                <div class="banner-bg-glow"></div>
                <div>
                    <span class="banner-tag">爬宠星球</span>
                    <h2 class="banner-title">记录你的爬宠日常，发现同城玩家和靠谱商家</h2>
                </div>
                <div class="banner-btn-group">
                    <button class="banner-btn" onclick="addNewPetPrompt()">添加我的爬宠</button>
                    <button class="banner-btn outline" onclick="switchTab('record')">发布动态</button>
                </div>
            </div>

            <h3 class="section-title" style="font-family:var(--font-logo); font-size:14px; margin-bottom:10px;" data-t="rankHeader">${getT('rankHeader')}</h3>
            <div class="rank-list" style="border: 1px solid var(--border-color); border-radius: 8px;">
                ${ranksHtml}
            </div>
        `;

    } else if (state.activeHomeHeaderTab === 'guide') {
        // Care Articles Feed (养护)
        const guidesHtml = careGuides.map(g => `
            <div class="magazine-card layout-growth-log" onclick="alert('Entering Article Guide: ' + '${g.title}')">
                <div class="card-image-wrap" style="height:120px;">
                    <img src="${g.img}" alt="guide img">
                </div>
                <div class="card-body" style="padding:10px 14px;">
                    <h4 class="pet-name-label" style="font-size:13px; line-height:1.4;">${state.language === 'zh' ? g.title : g.titleEn}</h4>
                    <p class="owner-meta-row" style="margin-top:4px;">${g.views} · ${g.readTime}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <!-- Vivarium Calculator Widget -->
            <div class="vivarium-calc-card">
                <div class="vivarium-calc-title">
                    🌿 生态缸造景与温控计算器 (Vivarium Calculator)
                </div>
                <div class="vivarium-calc-grid">
                    <div class="calc-input-group">
                        <span class="calc-input-label">选择主角物种 (Exotic Species)</span>
                        <select class="input-select" id="calc-pet-species" onchange="runVivariumCalculator()">
                            <option value="crested_gecko">睫角守宫 (Crested Gecko)</option>
                            <option value="veiled_chameleon">高冠变色龙 (Veiled Chameleon)</option>
                            <option value="corn_snake">玉米蛇 (Corn Snake)</option>
                            <option value="bearded_dragon">鬃狮蜥 (Bearded Dragon)</option>
                        </select>
                    </div>
                    <div class="calc-input-group">
                        <span class="calc-input-label">生态箱尺寸 (Dimensions in cm)</span>
                        <div class="calc-dimension-inputs">
                            <input type="number" id="calc-dim-width" placeholder="宽 (W)" value="45" oninput="runVivariumCalculator()">
                            <input type="number" id="calc-dim-depth" placeholder="深 (D)" value="45" oninput="runVivariumCalculator()">
                            <input type="number" id="calc-dim-height" placeholder="高 (H)" value="60" oninput="runVivariumCalculator()">
                        </div>
                    </div>
                    <div class="calc-result-box" id="calc-result-container">
                        <!-- Calculated dynamically -->
                    </div>
                </div>
            </div>

            <h3 class="section-title" style="font-family:var(--font-logo); font-size:14px; margin-bottom:10px;" data-t="guideHeader">${getT('guideHeader')}</h3>
            <div style="display:flex; flex-direction:column; gap:14px;">
                ${guidesHtml}
            </div>
        `;
        setTimeout(runVivariumCalculator, 0);
    }
}

function clearSpeciesFilter() {
    state.selectedSpeciesFilter = null;
    renderPageHome();
}

// ---- Page: Circles Catalog (多达几十种异宠的百科圈子) ----
function renderPageCircles() {
    const container = document.getElementById('page-circles');
    if (!container) return;

    const sectionsHtml = circlesCatalog.map(sec => {
        const title = state.language === 'zh' ? sec.category : sec.categoryEn;
        
        const gridHtml = sec.items.map(item => `
            <div class="circle-card" style="padding:10px; gap:10px;" onclick="enterExoticCircle('${item.key}', '${item.name}')">
                <img class="circle-img" src="${item.img}" style="width:36px; height:36px; border-radius:50%;" alt="circle logo">
                <div class="circle-info">
                    <h5 class="circle-name" style="font-size:12px;">${state.language === 'zh' ? item.name : item.nameEn}</h5>
                    <span class="circle-meta" style="font-size:9px;">${item.count}</span>
                </div>
            </div>
        `).join('');

        return `
            <div style="margin-bottom: 20px;">
                <h4 class="section-title" style="font-size:13px; margin-bottom:10px; color:var(--color-accent); border-left:3px solid var(--color-accent); padding-left:8px;">${title}</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    ${gridHtml}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div style="margin-bottom: 12px;">
            <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                ${state.language === 'zh' ? '这里汇集了全球数十种小众异宠圈子，点击即可查阅专区相册动态。' : 'Dozens of exotic circles around the world, click to browse.'}
            </p>
        </div>
        ${sectionsHtml}
    `;
}

// ---- Page: Circles Directory with Tab header (圈子 & 百科养护) ----
function renderPageCircles() {
    const container = document.getElementById('page-circles');
    if (!container) return;

    // Sub-navigation tabs
    const tabHeader = `
        <div class="circles-tabs-header">
            <button class="circles-tab-btn ${state.circlesSubTab === 'circles' ? 'active' : ''}" onclick="switchCirclesSubTab('circles')">
                ${state.language === 'zh' ? '百科圈子' : 'Circles'}
            </button>
            <button class="circles-tab-btn ${state.circlesSubTab === 'care' ? 'active' : ''}" onclick="switchCirclesSubTab('care')">
                ${state.language === 'zh' ? '养护常识' : 'Care Encyclo'}
            </button>
        </div>
    `;

    if (state.circlesSubTab === 'circles') {
        const sectionsHtml = circlesCatalog.map(sec => {
            const title = state.language === 'zh' ? sec.category : sec.categoryEn;
            
            const gridHtml = sec.items.map(item => `
                <div class="circle-card" style="padding:10px; gap:10px;" onclick="enterExoticCircle('${item.key}', '${item.name}')">
                    <img class="circle-img" src="${item.img}" style="width:36px; height:36px; border-radius:50%;" alt="circle logo" loading="lazy">
                    <div class="circle-info">
                        <h5 class="circle-name" style="font-size:12px;">${state.language === 'zh' ? item.name : item.nameEn}</h5>
                        <span class="circle-meta" style="font-size:9px;">${item.count}</span>
                    </div>
                </div>
            `).join('');

            return `
                <div style="margin-bottom: 20px;">
                    <h4 class="section-title" style="font-size:13px; margin-bottom:10px; color:var(--color-accent); border-left:3px solid var(--color-accent); padding-left:8px;">${title}</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        ${gridHtml}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            ${tabHeader}
            <div style="margin-bottom: 12px;">
                <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                    ${state.language === 'zh' ? '这里汇集了全球数十种小众异宠圈子，点击即可筛选专区动态。' : 'Dozens of exotic circles around the world, click to filter.'}
                </p>
            </div>
            ${sectionsHtml}
        `;
    } else {
        // Render Care Encyclopedia Layout
        renderPageCare(container, tabHeader);
    }
}

function switchCirclesSubTab(subTab) {
    state.circlesSubTab = subTab;
    state.activeCareDetailKey = null; // Close detail if open
    renderPageCircles();
}

function enterExoticCircle(speciesKey, name) {
    state.selectedSpeciesFilter = speciesKey;
    switchTab('home');
    alert(state.language === 'zh' 
        ? `已为您在首页筛选出 [${name}] 的相关动态！`
        : `Filtered homepage dynamic feed for [${name}]!`);
}

// ---- Page: Record (+ 号创作页) ----
function renderPageRecord() {
    const container = document.getElementById('page-record');
    if (!container) return;

    const petSelectOptions = state.pets.map(p => `
        <option value="${p.id}">${p.name} (${state.language === 'zh' ? p.species.split(' ')[0] : p.speciesKey})</option>
    `).join('');

    container.innerHTML = `
        <div class="add-post-box" style="margin-top: 5px;">
            <textarea class="input-content" id="new-story-textarea" data-t-placeholder="placeholderPost" placeholder="${getT('placeholderPost')}"></textarea>
            
            <div class="post-media-picker">
                ${state.selectedMediaForPost ? `
                    <div class="media-preview-box">
                        <img src="${state.selectedMediaForPost}" alt="preview">
                        <span class="remove-media" onclick="removePostMedia()">✕</span>
                    </div>
                ` : `
                    <div class="media-picker-btn" onclick="triggerPostImageSelect()">
                        <span>+ 📷</span>
                    </div>
                `}
            </div>

            <select class="input-select" id="new-story-pet-select">
                <option value="" disabled selected data-t="choosePet">${getT('choosePet')}</option>
                ${petSelectOptions}
            </select>

            <button class="submit-post-btn" onclick="submitNewStory()" data-t="btnSubmit">${getT('btnSubmit')}</button>
        </div>

        <div class="prompt-card">
            <strong data-t="promptHeader">${getT('promptHeader')}</strong>
            <ul style="margin-top:6px; padding-left:14px; list-style-type:circle;">
                <li data-t="prompt1">${getT('prompt1')}</li>
                <li data-t="prompt2">${getT('prompt2')}</li>
                <li data-t="prompt3">${getT('prompt3')}</li>
            </ul>
        </div>
    `;
}

// ---- Page: Messages (消息) ----
function renderPageMessages() {
    const container = document.getElementById('page-messages');
    if (!container) return;

    container.innerHTML = `
        <div class="ledger-history" style="padding:10px 14px;">
            <div class="ledger-row" style="padding:10px 0; border-bottom:1px solid var(--border-color)">
                <span class="ledger-time">10:25</span>
                <span class="ledger-action-name">💬 Anna (Germany) 评论了你的帖子 Mochi</span>
            </div>
            <div class="ledger-row" style="padding:10px 0; border-bottom:1px solid var(--border-color)">
                <span class="ledger-time">昨天</span>
                <span class="ledger-action-name">👀 Carlos_S (Brazil) 开始关注你的宠物 Mochi</span>
            </div>
            <div class="ledger-row" style="padding:10px 0;">
                <span class="ledger-time">3天前</span>
                <span class="ledger-action-name">🔥 你的帖子被系统推荐到了“世界”频道</span>
            </div>
        </div>
    `;
}

// ---- Page: Me (我) ----
function renderPageMe() {
    const container = document.getElementById('page-me');
    if (!container) return;

    if (!state.isLoggedIn) {
        container.innerHTML = `
            <div class="me-card" style="padding: 24px 16px;">
                <div style="position: relative; display: inline-block; margin-bottom: 12px;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background-color: var(--tag-bg); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 2px solid var(--border-color); margin: 0 auto;">
                        <svg style="width:32px; height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </div>
                <h4 class="me-name" style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">
                    ${state.language === 'zh' ? '游客模式' : 'Guest Mode'}
                </h4>
                <p class="me-desc" style="font-size: 10px; color: var(--text-secondary); max-width: 220px; margin: 0 auto 16px auto; line-height: 1.4;">
                    ${state.language === 'zh' ? '开启属于你的异宠记录之旅，发表瞬间、提问求助与大咖交流！' : 'Join Petverse to start tracking your pets, publishing moments, and exchanging tips!'}
                </p>
                <button class="join-btn" onclick="showLoginModal()" style="padding: 8px 24px; font-size: 11px; border-radius: 16px; width: auto; max-width: 160px; margin: 0 auto; display: block;">
                    ${state.language === 'zh' ? '注册 / 登录' : 'Register / Log In'}
                </button>
            </div>

            <div class="menu-list" style="margin-top: 16px;">
                <div class="menu-item" onclick="toggleThemeCtrl()">
                    <span data-t="settingTheme">${getT('settingTheme')}</span>
                    <span style="color:var(--color-accent); font-weight:700;">${state.theme === 'theme-dark' ? 'Rock Grey' : 'Warm White'}</span>
                </div>
                <div class="menu-item" onclick="toggleLanguageCtrl()">
                    <span data-t="settingLang">${getT('settingLang')}</span>
                    <span style="color:var(--color-accent); font-weight:700;">${state.language === 'zh' ? '简体中文' : 'English'}</span>
                </div>
                <div class="menu-item" onclick="showCommunityGuidelines()">
                    <span>${state.language === 'zh' ? '社区公约' : 'Community Guidelines'}</span>
                    <span style="color:var(--color-accent);">📖</span>
                </div>
                <div class="menu-item" onclick="alert('Petverse version: 2.0.0 Global community Edition')">
                    <span data-t="settingAbout">${getT('settingAbout')}</span>
                    <span>v2.0.0</span>
                </div>
            </div>
        `;
        return;
    }

    const showcasePills = state.pets.map(p => `
        <div class="me-pet-pill" onclick="showPetProfile('${p.id}')">
            🟢 ${p.name}
            <div style="font-size:9px; color:var(--text-secondary); margin-top:2px;">${state.language === 'zh' ? p.species.split(' ')[0] : p.speciesKey}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="me-card">
            <div style="position: relative; display: inline-block; cursor: pointer; margin-bottom: 8px;" onclick="triggerUserAvatarSelect()">
                <img class="me-avatar" src="${state.userProfile.avatar}" alt="avatar" loading="lazy">
                <div style="position: absolute; bottom: 0; right: 0; background: var(--color-brand); color: #fff; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 1.5px solid var(--bg-secondary);">📷</div>
            </div>
            <h4 class="me-name" onclick="changeMeNamePrompt()" style="cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 15px;">
                <span>${state.userProfile.username}</span> <span style="font-size:10px; color:var(--color-accent);">✏️</span>
            </h4>
            <p class="me-desc" onclick="changeMeDescPrompt()" style="cursor: pointer; font-size: 10px; margin-top: 6px; color: var(--text-secondary);">
                ${state.userProfile.desc} <span style="font-size:9px; color:var(--color-accent);">✏️</span>
            </p>
        </div>

        <div class="me-pet-showcase">
            <h5 class="ledger-title" data-t="myShowcase">${getT('myShowcase')}</h5>
            <div class="me-showcase-grid">
                ${showcasePills}
                <div class="me-pet-pill" style="border-style:dashed; cursor:pointer;" onclick="addNewPetPrompt()">
                    ➕ 添加异宠
                </div>
            </div>
        </div>

        <div class="menu-list">
            <div class="menu-item" onclick="toggleThemeCtrl()">
                <span data-t="settingTheme">${getT('settingTheme')}</span>
                <span style="color:var(--color-accent); font-weight:700;">${state.theme === 'theme-dark' ? 'Rock Grey (深岩灰)' : 'Warm White (暖白)'}</span>
            </div>
            <div class="menu-item" onclick="toggleLanguageCtrl()">
                <span data-t="settingLang">${getT('settingLang')}</span>
                <span style="color:var(--color-accent); font-weight:700;">${state.language === 'zh' ? '简体中文' : 'English'}</span>
            </div>
            <div class="menu-item" onclick="showCommunityGuidelines()">
                <span>${state.language === 'zh' ? '社区公约' : 'Community Guidelines'}</span>
                <span style="color:var(--color-accent);">📖</span>
            </div>
            <div class="menu-item" onclick="alert('Petverse version: 2.0.0 Global community Edition')">
                <span data-t="settingAbout">${getT('settingAbout')}</span>
                <span>v2.0.0</span>
            </div>
            <div class="menu-item" onclick="performLogOut()" style="border-top: 1.5px solid var(--border-color); margin-top: 10px; padding-top: 12px; cursor: pointer;">
                <span style="color: #E87A51; font-weight: bold;">${state.language === 'zh' ? '退出登录' : 'Log Out'}</span>
                <span style="color: #E87A51;">➔</span>
            </div>
        </div>
    `;
}

// ---- Page: Pet Profile (独立宠物成长页) ----
function renderPagePetProfile() {
    const container = document.getElementById('page-pet-profile');
    if (!container) return;

    const pet = state.pets.find(p => p.id === state.activePetProfileId);
    if (!pet) {
        container.innerHTML = `<p>Pet not found</p>`;
        return;
    }

    const timelineHtml = pet.timeline.map(node => `
        <div class="timeline-node">
            <div class="timeline-day-stamp">${node.day}</div>
            <div class="timeline-content">
                <h5 class="timeline-node-title">${state.language === 'zh' ? node.title : node.titleEn}</h5>
                <p class="timeline-node-desc">${state.language === 'zh' ? node.desc : node.descEn}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="detail-back-bar" onclick="goBackToFeed()">
            <span>⬅️ ${getT('back')}</span>
        </div>

        <div class="pet-profile-header">
            <div class="pet-cover"></div>
            <div class="pet-avatar-wrap">
                <img class="pet-avatar-img" src="${pet.image}" alt="pet avatar" loading="lazy">
                <div class="pet-actions-row">
                    <button class="pet-btn-round ${pet.followed ? 'active' : ''}" onclick="toggleFollowPet('${pet.id}')" title="${getT('followPet')}">
                        ${pet.followed ? '❤️' : '🤍'}
                    </button>
                    <button class="pet-btn-round" onclick="touchPetTrigger('${pet.id}')" title="${getT('btnTouch')}">
                        👋
                    </button>
                </div>
            </div>

            <div class="pet-profile-body">
                <div class="pet-profile-title-row">
                    <h3 class="pet-profile-name">${pet.name}</h3>
                    <span style="font-size:10px; color:var(--text-secondary); font-family:var(--font-sans)">
                        📍 ${state.language === 'zh' ? pet.location.split(' (')[0] : (pet.location.includes(' (') ? pet.location.split(' (')[1].replace(')', '') : pet.location)}
                    </span>
                </div>
                <p class="pet-profile-species">${state.language === 'zh' ? pet.species : pet.speciesKey.replace('_', ' ')} · ${pet.gender}</p>
                
                <p class="pet-profile-species" style="margin-top:10px; font-style:italic;">
                    "${state.language === 'zh' ? pet.personality : pet.personalityEn}"
                </p>

                <div class="pet-stat-row">
                    <div class="pet-stat-col">
                        <span class="pet-stat-num">${pet.companionDays}</span>
                        <span class="pet-stat-label" data-t="companionDays">${getT('companionDays')}</span>
                    </div>
                    <div class="pet-stat-col">
                        <span class="pet-stat-num">${formatNumber(pet.followersCount)}</span>
                        <span class="pet-stat-label" data-t="followers">${getT('followers')}</span>
                    </div>
                    <div class="pet-stat-col">
                        <span class="pet-stat-num">by ${pet.ownerName}</span>
                        <span class="pet-stat-label">OWNER</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- About Story -->
        <div class="timeline-card">
            <h4 class="section-title" style="font-size:13px; color:var(--color-brand)" data-t="petStoryTitle">${getT('petStoryTitle')}</h4>
            <p class="detail-body-text" style="margin-top:6px; font-size:12px;">
                ${state.language === 'zh' ? pet.story : pet.storyEn}
            </p>
        </div>

        <!-- Weight Tracking Line Chart -->
        <div class="pet-chart-container">
            <div class="pet-chart-title">
                <span>📈 ${state.language === 'zh' ? '历史体重记录折线图 (g)' : 'Weight Progress Chart (g)'}</span>
                <span style="color:var(--color-accent); font-weight:bold;">${state.language === 'zh' ? '正常发育中' : 'Healthy Growth'}</span>
            </div>
            <canvas id="pet-weight-chart" style="width:100%; height:120px; display:block;"></canvas>
        </div>

        <!-- Growth Timeline -->
        <div class="timeline-card" style="margin-top: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 class="section-title" style="font-size:13px; color:var(--color-brand); margin-bottom:0;" data-t="growthTimeline">${getT('growthTimeline')}</h4>
                <button class="join-btn" onclick="openTimelineModal()" style="padding:4px 8px; font-size:9px; border-radius:10px; cursor:pointer;">＋ 记录日志</button>
            </div>
            <div class="timeline-list">
                ${timelineHtml}
            </div>
        </div>
    `;
    // Delay slightly to ensure canvas DOM is ready
    setTimeout(() => drawPetWeightChart('pet-weight-chart'), 50);
}

// ---- Page: Post Detail (帖子详情) ----
function renderPagePostDetail() {
    const container = document.getElementById('page-post-detail');
    if (!container) return;

    const post = state.posts.find(p => p.id === state.activePostDetailId);
    if (!post) {
        container.innerHTML = `<p>Post not found</p>`;
        return;
    }

    // Initialize post and comments translation states if not set
    if (typeof postTranslationState === 'undefined') window.postTranslationState = {};
    if (typeof commentsTranslationState === 'undefined') window.commentsTranslationState = {};
    
    const isPostTranslated = window.postTranslationState[post.id] || false;
    const isCommentsTranslated = window.commentsTranslationState[post.id] || false;

    let postText = state.language === 'zh' ? post.content : post.contentEn;
    if (isPostTranslated) {
        postText = state.language === 'zh' ? post.contentEn : post.content;
    }

    const commentsHtml = post.commentsList.filter(c => !state.blockedUsers.includes(c.name)).map(c => {
        let commentText = c.text;
        if (isCommentsTranslated) {
            commentText = translateTextLocal(c.text);
        }
        return `
            <div class="comment-row" style="display:flex; justify-content:space-between; align-items:center; padding: 4px 0;">
                <div>
                    <span class="comment-row-user">${c.name}</span>: ${commentText} ${isCommentsTranslated ? '<span style="font-size:8px; color:var(--color-accent)">(已翻译/Translated)</span>' : ''}
                </div>
                <div style="display:flex; gap:6px; font-size:8px; flex-shrink:0;">
                    <span style="color:var(--text-secondary); cursor:pointer;" onclick="reportContent('comment', '${c.name}_${post.id}')" title="${state.language === 'zh' ? '举报' : 'Report'}">🏳️</span>
                    <span style="color:var(--text-secondary); cursor:pointer;" onclick="confirmBlockUser('${c.name}')" title="${state.language === 'zh' ? '拉黑' : 'Block'}">🚫</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="detail-back-bar" onclick="goBackToFeed()">
            <span>⬅️ ${getT('back')}</span>
        </div>

        <div class="magazine-card layout-single-photo">
            <div class="card-header">
                <img class="card-avatar" src="${post.avatar}" alt="av" loading="lazy">
                <div class="card-meta-info" style="width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <span class="pet-name-label">${post.username}</span>
                        <div style="display:flex; gap:8px; font-size:9px;">
                            <span style="color:var(--text-secondary); cursor:pointer; font-weight:normal;" onclick="reportContent('post', '${post.id}')">${state.language === 'zh' ? '举报' : 'Report'}</span>
                            <span style="color:var(--text-secondary); cursor:pointer; font-weight:normal;" onclick="confirmBlockUser('${post.username}')">${state.language === 'zh' ? '拉黑' : 'Block'}</span>
                        </div>
                    </div>
                    <span class="owner-meta-row">${state.language === 'zh' ? post.location : post.location.split('(')[0]} · ${state.language === 'zh' ? post.time : post.timeEn}</span>
                </div>
            </div>

            <div class="card-image-wrap">
                <img src="${post.image}" alt="detail image" loading="lazy">
            </div>

            <div class="card-body">
                <p class="detail-body-text" id="post-detail-content-text">${postText}</p>
                <div style="display:flex; justify-content:flex-end; margin-top:6px;">
                    <button class="join-btn" onclick="togglePostDetailTranslation('${post.id}')" style="padding: 3px 8px; font-size: 8px; border-radius: 8px; cursor:pointer;" id="post-translate-btn">
                        ${isPostTranslated ? (state.language === 'zh' ? '复原 (Original)' : 'Original (复原)') : '🌍 翻译 (Translate)'}
                    </button>
                </div>
            </div>

            <div class="card-actions">
                <div class="action-pill ${post.curious ? 'active' : ''}" onclick="toggleCurious('${post.id}', true)">
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>${getT('curious')} (${formatNumber(post.curiousCount)})</span>
                </div>
                <div class="action-pill ${post.shared ? 'active' : ''}" onclick="toggleSharedExperience('${post.id}', true)">
                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span>${getT('shared')} (${formatNumber(post.sharedCount)})</span>
                </div>
                <div class="action-pill" onclick="openCommentDrawer('${post.id}')" style="cursor: pointer;">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span>${getT('comment')} (${formatNumber(post.commentCount)})</span>
                </div>
            </div>
        </div>

        <!-- Comments box -->
        <div class="detail-comments-list">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 class="ledger-title" style="margin-bottom:0; cursor:pointer;" onclick="openCommentDrawer('${post.id}')">${getT('comment')} (${post.commentCount}) 💬</h5>
                <button class="join-btn" onclick="toggleCommentsTranslation('${post.id}')" data-t="btnTranslate">
                    ${isCommentsTranslated ? '复原 (Original)' : getT('btnTranslate')}
                </button>
            </div>
            <div id="comments-box-wrapper">
                ${commentsHtml}
            </div>
        </div>
    `;
}

function translateCommentsMock() {
    const wrapper = document.getElementById('comments-box-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = `
        <div class="comment-row">
            <span class="comment-row-user">Anna (Germany)</span>: 恭喜你！我的睫角守宫在打开饲养箱时还是会逃跑。你有什么驯化经验分享吗？ <span style="font-size:9px; color:var(--color-accent)">(已翻译/Translated)</span>
        </div>
        <div class="comment-row">
            <span class="comment-row-user">陈叔爬爬 (China)</span>: 好品相的莉莉白！喂食多一些耐心，经常把手放箱子里脱敏就会好很多。
        </div>
    `;
}

// ==========================================
// 5. INTERACTION LOGIC
// ==========================================

function switchTab(tabId) {
    state.activeTab = tabId;
    state.activePetProfileId = null;
    state.activePostDetailId = null;

    // Reset scroll container position when switching pages
    const scrollContainer = document.getElementById('screen-body-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    document.querySelectorAll('.phone-screen .app-page').forEach(page => {
        page.classList.remove('active');
    });

    let targetPageId = `page-${tabId}`;
    const activePage = document.getElementById(targetPageId);
    if (activePage) activePage.classList.add('active');

    renderHeader();
    renderTabs();

    if (tabId === 'home') renderPageHome();
    if (tabId === 'circles') renderPageCircles();
    if (tabId === 'record') renderPageRecord();
    if (tabId === 'messages') renderPageMessages();
    if (tabId === 'me') renderPageMe();
}

function switchHomeSubTab(subTabId) {
    state.activeHomeHeaderTab = subTabId;
    renderHeader();
    renderPageHome();
}

function showPetProfile(petId) {
    state.activePetProfileId = petId;
    state.activePostDetailId = null;
    
    // Reset scroll container
    const scrollContainer = document.getElementById('screen-body-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    document.querySelectorAll('.phone-screen .app-page').forEach(page => {
        page.classList.remove('active');
    });
    
    renderPagePetProfile();
    document.getElementById('page-pet-profile').classList.add('active');
    renderHeader(); // update header
}

function showPostDetail(postId) {
    state.activePostDetailId = postId;
    state.activePetProfileId = null;

    // Reset scroll container
    const scrollContainer = document.getElementById('screen-body-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    document.querySelectorAll('.phone-screen .app-page').forEach(page => {
        page.classList.remove('active');
    });

    renderPagePostDetail();
    document.getElementById('page-post-detail').classList.add('active');
    renderHeader(); // update header
}

function goBackToFeed() {
    switchTab('home');
}

async function toggleCurious(postId, isDetailPage = false) {
    if (!state.isLoggedIn) {
        showLoginModal(() => toggleCurious(postId, isDetailPage));
        return;
    }
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (isBackendConnected) {
        try {
            const res = await fetch(`${API_URL}/posts/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId })
            });
            if (res.ok) {
                const updatedPost = await res.json();
                post.curiousCount = updatedPost.likes;
                post.curious = updatedPost.liked;
            }
        } catch (err) {
            toggleCuriousOffline(post);
        }
    } else {
        toggleCuriousOffline(post);
    }

    if (isDetailPage) renderPagePostDetail();
    else renderPageHome();
}

function toggleCuriousOffline(post) {
    if (post.curious) {
        post.curiousCount--;
        post.curious = false;
    } else {
        post.curiousCount++;
        post.curious = true;
    }
}

function toggleSharedExperience(postId, isDetailPage = false) {
    if (!state.isLoggedIn) {
        showLoginModal(() => toggleSharedExperience(postId, isDetailPage));
        return;
    }
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (post.shared) {
        post.sharedCount--;
        post.shared = false;
    } else {
        post.sharedCount++;
        post.shared = true;
    }

    if (isDetailPage) renderPagePostDetail();
    else renderPageHome();
}

function toggleFollowPet(petId) {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;

    if (pet.followed) {
        pet.followersCount--;
        pet.followed = false;
    } else {
        pet.followersCount++;
        pet.followed = true;
    }
    renderPagePetProfile();
}

function touchPetTrigger(petId) {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;

    const alertBox = document.getElementById('touch-bubble-alert');
    if (alertBox) {
        alertBox.textContent = state.language === 'zh' 
            ? `👋 你摸了摸 ${pet.name} 的小脑袋，它看起来很舒服！`
            : `👋 You gently touched ${pet.name}. It feels cool and cozy!`;
        
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 1500);
    }
}

function selectPostMediaMock() {
    const images = ['assets/pet_gecko.png', 'assets/pet_chameleon.png', 'assets/pet_snake.png'];
    state.selectedMediaForPost = images[Math.floor(Math.random() * images.length)];
    renderPageRecord();
}

function removePostMedia() {
    state.selectedMediaForPost = null;
    renderPageRecord();
}

async function submitNewStory() {
    if (!state.isLoggedIn) {
        showLoginModal(() => submitNewStory());
        return;
    }
    const textEl = document.getElementById('new-story-textarea');
    const petSelectEl = document.getElementById('new-story-pet-select');

    if (!textEl || !textEl.value) {
        alert('请输入内容！/ Write a story first.');
        return;
    }

    const text = textEl.value;
    const petId = petSelectEl ? petSelectEl.value : null;
    const petObj = state.pets.find(p => p.id === petId);

    const newPost = {
        petId: petId,
        username: state.userProfile.username,
        avatar: state.userProfile.avatar,
        location: petObj ? petObj.location : '中国北京 (Beijing, China)',
        coordinates: petObj ? petObj.coordinates : '39.9042° N, 116.4074° E',
        time: getT('justNow'),
        timeEn: getT('justNow'),
        tag: '成长日记',
        tagEn: 'Growth Log',
        content: text,
        contentEn: `[EN Version] ${text}`,
        image: state.selectedMediaForPost || 'assets/logo.png',
        layout: 'single-photo',
        curiousCount: 1,
        sharedCount: 0,
        commentCount: 0,
        saveCount: 0,
        curious: false,
        shared: false,
        saved: false,
        commentsList: []
    };

    if (isBackendConnected) {
        try {
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            });
            if (res.ok) {
                const saved = await res.json();
                state.posts.unshift(saved);
            }
        } catch (err) {
            newPost.id = 'p_' + Date.now();
            state.posts.unshift(newPost);
        }
    } else {
        newPost.id = 'p_' + Date.now();
        state.posts.unshift(newPost);
    }

    state.selectedMediaForPost = null;
    switchTab('home');
}

let pendingNewPetData = null;

function triggerPostImageSelect() {
    const fileInput = document.getElementById('post-image-file');
    if (fileInput) {
        fileInput.click();
    }
}

function handlePostImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        state.selectedMediaForPost = e.target.result; // Base64 data URL
        renderPageRecord();
    };
    reader.readAsDataURL(file);
}

function handlePetImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        if (pendingNewPetData) {
            completeAddNewPet(pendingNewPetData, 'assets/logo.png');
        }
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        if (pendingNewPetData) {
            completeAddNewPet(pendingNewPetData, e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

async function addNewPetPrompt() {
    if (!state.isLoggedIn) {
        showLoginModal(() => addNewPetPrompt());
        return;
    }
    const name = prompt(state.language === 'zh' ? '请输入宠物名字:' : 'Enter pet name:');
    if (!name) return;
    const species = prompt(state.language === 'zh' ? '请输入宠物类别(如肥尾守宫, 鬃狮蜥):' : 'Enter species:');
    if (!species) return;

    pendingNewPetData = { name, species };

    const fileInput = document.getElementById('pet-image-file');
    if (fileInput) {
        fileInput.click();
    }
}

async function completeAddNewPet(petData, imgDataUrl) {
    const newPet = {
        name: petData.name,
        species: petData.species,
        speciesKey: petData.species.toLowerCase().replace(/\s+/g, '_'),
        gender: '♂',
        age: '1个月',
        ageEn: '1 mo',
        gene: 'Standard (Wild)',
        image: imgDataUrl,
        companionDays: 1,
        location: '中国北京 (Beijing, China)',
        locationKey: 'beijing',
        coordinates: '39.9042° N, 116.4074° E',
        followersCount: 1,
        ownerName: 'Kenji_T',
        personality: '好奇活泼，爱四处张望。',
        personalityEn: 'Curious and active, loves looking around.',
        story: '新来的小生命，记录我们共同生活的起点。',
        storyEn: 'New little life, the start of our journey together.',
        timeline: [
            { id: 't_new_' + Date.now(), day: 'Day 1', title: '来到新家', titleEn: 'Welcome Home', desc: '刚安顿好恒温箱，正在慢慢适应环境。', descEn: 'Just set up enclosure, adjusting to new home.' }
        ]
    };

    if (isBackendConnected) {
        try {
            const res = await fetch(`${API_URL}/pets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPet)
            });
            if (res.ok) {
                const savedPet = await res.json();
                state.pets.push(savedPet);
            }
        } catch (err) {
            newPet.id = 'pet_' + Date.now();
            state.pets.push(newPet);
        }
    } else {
        newPet.id = 'pet_' + Date.now();
        state.pets.push(newPet);
    }
    
    pendingNewPetData = null;
    document.getElementById('pet-image-file').value = '';
    
    renderPageMe();
    if (state.activeTab === 'home') renderPageHome();
}

function openCommentDrawer(postId) {
    state.activeCommentPostId = postId;
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const drawerTitle = document.getElementById('comment-drawer-title');
    if (drawerTitle) {
        drawerTitle.textContent = `${getT('comment')} (${post.commentCount})`;
    }

    renderCommentDrawerList(post);

    const backdrop = document.getElementById('comment-backdrop');
    const drawer = document.getElementById('comment-drawer');
    if (backdrop && drawer) {
        backdrop.classList.add('active');
        drawer.classList.add('active');
    }

    const input = document.getElementById('new-comment-input-box');
    if (input) {
        input.value = '';
        input.focus();
    }
}

function closeCommentDrawer() {
    state.activeCommentPostId = null;
    const backdrop = document.getElementById('comment-backdrop');
    const drawer = document.getElementById('comment-drawer');
    if (backdrop && drawer) {
        backdrop.classList.remove('active');
        drawer.classList.remove('active');
    }
}

function renderCommentDrawerList(post) {
    const listContainer = document.getElementById('comment-drawer-list-container');
    if (!listContainer) return;

    if (!post.commentsList || post.commentsList.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary); font-size: 11px;">暂无评论，快来抢沙发吧！ / No comments yet.</div>`;
        return;
    }

    listContainer.innerHTML = post.commentsList.filter(c => !state.blockedUsers.includes(c.name)).map(c => `
        <div class="comment-row" style="padding: 6px 0; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span class="comment-row-user" style="font-weight:700; color: var(--color-brand);">${c.name}</span>: 
                <span style="color: var(--text-primary); font-size:11px;">${c.text}</span>
            </div>
            <div style="display:flex; gap:6px; font-size:9px; flex-shrink:0;">
                <span style="color:var(--text-secondary); cursor:pointer;" onclick="reportContent('comment', '${c.name}_${post.id}')" title="${state.language === 'zh' ? '举报' : 'Report'}">🏳️</span>
                <span style="color:var(--text-secondary); cursor:pointer;" onclick="confirmBlockUser('${c.name}')" title="${state.language === 'zh' ? '拉黑' : 'Block'}">🚫</span>
            </div>
        </div>
    `).join('');
    
    listContainer.scrollTop = listContainer.scrollHeight;
}

async function submitNewComment() {
    if (!state.isLoggedIn) {
        showLoginModal(() => submitNewComment());
        return;
    }
    const postId = state.activeCommentPostId;
    if (!postId) return;

    const input = document.getElementById('new-comment-input-box');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    const commentData = {
        postId: postId,
        name: state.userProfile.username,
        text: text
    };

    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (isBackendConnected) {
        try {
            const res = await fetch(`${API_URL}/posts/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            if (res.ok) {
                const updatedPost = await res.json();
                post.commentsList = updatedPost.commentsList;
                post.commentCount = updatedPost.commentCount;
            }
        } catch (err) {
            post.commentsList.push({ name: commentData.name, text: commentData.text });
            post.commentCount = post.commentsList.length;
        }
    } else {
        post.commentsList.push({ name: commentData.name, text: commentData.text });
        post.commentCount = post.commentsList.length;
    }

    input.value = '';

    renderCommentDrawerList(post);
    
    const drawerTitle = document.getElementById('comment-drawer-title');
    if (drawerTitle) {
        drawerTitle.textContent = `${getT('comment')} (${post.commentCount})`;
    }

    if (state.activePostDetailId === postId) {
        renderPagePostDetail();
    }
    
    if (state.activeTab === 'home') {
        renderPageHome();
    }
}

let searchQuery = '';

function handleSearchInput(event) {
    searchQuery = event.target.value.toLowerCase().trim();
    
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'inline' : 'none';
    }

    if (state.activeTab !== 'home') {
        switchTab('home');
    } else {
        renderPageHome();
    }
}

function clearSearchInput() {
    const input = document.getElementById('search-input-box');
    if (input) {
        input.value = '';
    }
    searchQuery = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    renderPageHome();
}

function toggleAppMap() {
    state.mapExpanded = !state.mapExpanded;
    const viewport = document.querySelector('.app-map-viewport');
    const toggleIcon = document.getElementById('app-map-toggle-icon');
    if (viewport) {
        if (state.mapExpanded) {
            viewport.classList.add('active');
        } else {
            viewport.classList.remove('active');
        }
    }
    if (toggleIcon) {
        toggleIcon.textContent = state.mapExpanded ? '▼ 收起 (Collapse)' : '▲ 展开 (Expand)';
    }
}

function triggerAppMapFilter(locationKey) {
    state.selectedCountryFilter = locationKey;
    renderFilterRow();
    renderPageHome();
}

function clearCountryFilter() {
    state.selectedCountryFilter = null;
    renderFilterRow();
    renderPageHome();
}

function selectHotTopic(topicId) {
    const topic = state.hotTopics.find(t => t.id === topicId);
    if (!topic) return;
    alert(`Searching forum for: "${state.language === 'zh' ? topic.title : topic.titleEn}"\n\nFound 142 posts discussing this issue!`);
}

// ==========================================
// 6. CONTROL PANEL ACTIONS (RIGHT)
// ==========================================

async function changeLanguage(lang) {
    state.language = lang;
    localStorage.setItem('petverse_language', lang);
    updateAppLanguage();
    renderHeader();
    renderTabs();
    
    if (state.activePetProfileId) renderPagePetProfile();
    else if (state.activePostDetailId) renderPagePostDetail();
    else switchTab(state.activeTab);

    document.querySelectorAll('.ctrl-lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`ctrl-lang-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (isBackendConnected) {
        try {
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: lang })
            });
        } catch (err) {}
    }
}

function toggleLanguageCtrl() {
    const targetLang = state.language === 'zh' ? 'en' : 'zh';
    changeLanguage(targetLang);
}

async function changeTheme(theme) {
    state.theme = theme;
    document.body.className = theme;
    localStorage.setItem('petverse_theme', theme);

    // Update Top Header Theme Toggle Icon shape
    const toggleSvg = document.getElementById('theme-toggle-svg');
    if (toggleSvg) {
        if (theme === 'theme-light') {
            // Sun shape SVG
            toggleSvg.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
        } else {
            // Moon shape SVG
            toggleSvg.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        }
    }

    document.querySelectorAll('.ctrl-theme-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`ctrl-theme-${theme}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (state.activeTab === 'me') renderPageMe();

    if (isBackendConnected) {
        try {
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme })
            });
        } catch (err) {}
    }
}

function toggleThemeCtrl() {
    const targetTheme = state.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    changeTheme(targetTheme);
}

function triggerMockMapDiscovery(locationKey) {
    const petObj = state.pets.find(p => p.locationKey === locationKey);
    if (petObj) {
        state.selectedCountryFilter = locationKey;
        state.activeHomeHeaderTab = 'world'; // switch to world to see map filter
        switchTab('home');
        alert(`Filtered world feed to: ${petObj.location}`);
    }
}

// ==========================================
// 7. INITIALIZATION
// ==========================================

async function initApp() {
    await syncState();
    loadUserProfile();
    loadQAQuestions();

    document.body.className = state.theme;

    // Apply the loaded theme icon shape initially
    changeTheme(state.theme);

    const langBtn = document.getElementById(`ctrl-lang-${state.language}`);
    if (langBtn) {
        document.querySelectorAll('.ctrl-lang-btn').forEach(btn => btn.classList.remove('active'));
        langBtn.classList.add('active');
    }
    const themeBtn = document.getElementById(`ctrl-theme-${state.theme}`);
    if (themeBtn) {
        document.querySelectorAll('.ctrl-theme-btn').forEach(btn => btn.classList.remove('active'));
        themeBtn.classList.add('active');
    }

    // Bind bottom navbar click listeners with smooth scroll-to-top support
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tabId = item.getAttribute('data-tab');
            if (tabId) {
                if (state.activeTab === tabId) {
                    scrollToTopSmoothly();
                } else {
                    switchTab(tabId);
                }
            }
        });
    });

    // Listen scroll events on body container for floating back-to-top button
    const scrollContainer = document.getElementById('screen-body-container');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (scrollContainer && backToTopBtn) {
        scrollContainer.addEventListener('scroll', () => {
            if (scrollContainer.scrollTop > 300) {
                backToTopBtn.style.display = 'flex';
                setTimeout(() => backToTopBtn.classList.add('visible'), 10);
            } else {
                backToTopBtn.classList.remove('visible');
                setTimeout(() => {
                    if (!backToTopBtn.classList.contains('visible')) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    updateAppLanguage();
    renderHeader();

    // Default to 'home' feed
    switchTab('home');

    // Smoothly fade out brand loader once fully initialized
    setTimeout(() => {
        const loader = document.getElementById('brand-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 400);
        }
    }, 800);
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ==========================================
// 8. PHASE 4 ADVANCED FEATURES IMPLEMENTATION
// ==========================================

const commentTranslationDict = {
    "Congrats! My crested gecko still runs away when I open the enclosure. Any tips?": "恭喜！我的睫角守宫在打开饲养箱时仍会逃跑。有什么建议吗？",
    "恭喜！我的睫角守宫在打开饲养箱时仍会逃跑。有什么建议吗？": "Congrats! My crested gecko still runs away when I open the enclosure. Any tips?",
    
    "好品相的莉莉白！喂食多一些耐心，经常把手放箱子里脱敏就会好很多。": "Great quality Lily White! Be patient with feeding, place your hands in the enclosure often for desensitization and it will improve a lot.",
    "Great quality Lily White! Be patient with feeding, place your hands in the enclosure often for desensitization and it will improve a lot.": "好品相的莉莉白！喂食多一些耐心，经常把手放箱子里脱敏就会好很多。",
    
    "Beautiful setup Carlos! Sunlight is the best UV for chameleons.": "非常漂亮的造景，Carlos！阳光对变色龙来说是最好的紫外线。",
    "非常漂亮的造景，Carlos！阳光对变色龙来说是最好的紫外线。": "Beautiful setup Carlos! Sunlight is the best UV for chameleons.",
    
    "Try the Exotic Vet clinic in Waterloo, they specialize in reptiles and birds!": "试试滑铁卢的异宠诊所，他们专门看爬虫和鸟类！",
    "试试滑铁卢的异宠诊所，他们专门看爬虫和鸟类！": "Try the Exotic Vet clinic in Waterloo, they specialize in reptiles and birds!",
    
    "Server is offline, but sandbox mode is fully operational!": "服务器处于离线状态，但沙盒模式已完全可用！",
    "服务器处于离线状态，但沙盒模式已完全可用！": "Server is offline, but sandbox mode is fully operational!"
};

function translateTextLocal(text) {
    if (commentTranslationDict[text]) {
        return commentTranslationDict[text];
    }
    if (text.startsWith('[EN] ')) {
        return text.replace('[EN] ', '');
    }
    // Fallback translation
    if (state.language === 'zh') {
        return `[EN Translation] ${text} (Natural companion)`;
    } else {
        return `[中文翻译] ${text} (自然相伴)`;
    }
}

function togglePostDetailTranslation(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (!window.postTranslationState) window.postTranslationState = {};
    window.postTranslationState[postId] = !window.postTranslationState[postId];
    
    const textEl = document.getElementById('post-detail-content-text');
    const btnEl = document.getElementById('post-translate-btn');
    if (textEl && btnEl) {
        let isTranslated = window.postTranslationState[postId];
        if (state.language === 'zh') {
            textEl.textContent = isTranslated ? post.contentEn : post.content;
            btnEl.textContent = isTranslated ? '复原 (Original)' : '🌍 翻译 (Translate)';
        } else {
            textEl.textContent = isTranslated ? post.content : post.contentEn;
            btnEl.textContent = isTranslated ? 'Original (复原)' : '🌍 翻译 (Translate)';
        }
    }
}

function toggleCommentsTranslation(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (!window.commentsTranslationState) window.commentsTranslationState = {};
    window.commentsTranslationState[postId] = !window.commentsTranslationState[postId];
    
    const wrapper = document.getElementById('comments-box-wrapper');
    const btnEl = document.querySelector('.detail-comments-list .join-btn');
    if (!wrapper) return;

    let isTranslated = window.commentsTranslationState[post.id];
    if (btnEl) {
        btnEl.textContent = isTranslated ? '复原 (Original)' : getT('btnTranslate');
    }

    const commentsHtml = post.commentsList.map(c => {
        let textToShow = c.text;
        if (isTranslated) {
            textToShow = translateTextLocal(c.text);
        }
        return `
            <div class="comment-row">
                <span class="comment-row-user">${c.name}</span>: ${textToShow} ${isTranslated ? '<span style="font-size:8px; color:var(--color-accent)">(已翻译/Translated)</span>' : ''}
            </div>
        `;
    }).join('');

    wrapper.innerHTML = commentsHtml;
}

function openTimelineModal() {
    const backdrop = document.getElementById('timeline-modal-backdrop');
    const modal = document.getElementById('timeline-modal');
    if (backdrop && modal) {
        backdrop.classList.add('active');
        modal.classList.add('active');
    }
    
    const pet = state.pets.find(p => p.id === state.activePetProfileId);
    const dayInput = document.getElementById('log-day-input');
    if (dayInput && pet) {
        dayInput.value = `Day ${pet.companionDays + 1}`;
    }
    
    const titleInput = document.getElementById('log-title-input');
    const descInput = document.getElementById('log-desc-input');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
}

function closeTimelineModal() {
    const backdrop = document.getElementById('timeline-modal-backdrop');
    const modal = document.getElementById('timeline-modal');
    if (backdrop && modal) {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
    }
}

async function submitNewTimelineLog() {
    if (!state.isLoggedIn) {
        showLoginModal(() => submitNewTimelineLog());
        return;
    }
    const petId = state.activePetProfileId;
    if (!petId) return;

    const day = document.getElementById('log-day-input').value.trim();
    const title = document.getElementById('log-title-input').value.trim();
    const desc = document.getElementById('log-desc-input').value.trim();

    if (!day || !title || !desc) {
        alert('请完整填写所有日志内容！/ Please complete all fields.');
        return;
    }

    const logData = {
        petId: petId,
        day: day,
        title: title,
        titleEn: `[EN] ${title}`,
        desc: desc,
        descEn: `[EN] ${desc}`
    };

    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;

    if (isBackendConnected) {
        try {
            const res = await fetch(`${API_URL}/pets/timeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
            if (res.ok) {
                const updatedPet = await res.json();
                pet.timeline = updatedPet.timeline;
                pet.companionDays = updatedPet.companionDays;
            }
        } catch (err) {
            offlineTimelinePush(pet, logData);
        }
    } else {
        offlineTimelinePush(pet, logData);
    }

    closeTimelineModal();
    renderPagePetProfile();
}

function offlineTimelinePush(pet, logData) {
    const newNode = {
        id: 't_node_' + Date.now(),
        day: logData.day,
        title: logData.title,
        titleEn: logData.titleEn,
        desc: logData.desc,
        descEn: logData.descEn
    };
    pet.timeline.push(newNode);

    const daysNum = parseInt(logData.day.replace(/[^0-9]/g, ''));
    if (!isNaN(daysNum) && daysNum > pet.companionDays) {
        pet.companionDays = daysNum;
    }
}

function runVivariumCalculator() {
    const speciesEl = document.getElementById('calc-pet-species');
    const widthEl = document.getElementById('calc-dim-width');
    const depthEl = document.getElementById('calc-dim-depth');
    const heightEl = document.getElementById('calc-dim-height');
    if (!speciesEl || !widthEl || !depthEl || !heightEl) return;

    const species = speciesEl.value;
    const w = parseFloat(widthEl.value) || 30;
    const d = parseFloat(depthEl.value) || 30;
    const h = parseFloat(heightEl.value) || 30;

    const volumeLiters = (w * d * h) / 1000;
    const container = document.getElementById('calc-result-container');
    if (!container) return;

    let substrate = "";
    let plants = "";
    let cleanupCrews = "";
    let heating = "";

    if (species === 'crested_gecko') {
        substrate = "椰土 40% + 泥炭土 30% + 树皮/颗粒 20% + 水苔 10% (高保湿配方)";
        plants = "鸟巢蕨 (Nest Fern)、绿萝 (Pothos)、袖珍椰子";
        cleanupCrews = Math.max(10, Math.round(volumeLiters * 0.4)) + "只 侏儒白等足虫 + 适当跳虫 (湿润降解军团)";
        heating = volumeLiters < 80 ? "25W 夜灯/夜间加热垫" : "50W 陶瓷加热灯 (配合温控器设为24℃)";
    } else if (species === 'veiled_chameleon') {
        substrate = "大颗粒椰壳 50% + 树皮 30% + 泥炭 20% (高透水防积水配方)";
        plants = "垂叶榕、鹅掌柴 (Schefflera)、吊兰";
        cleanupCrews = Math.max(15, Math.round(volumeLiters * 0.3)) + "只 橘黄等足虫 + 苔藓跳虫";
        heating = volumeLiters < 150 ? "50W UVB加热二合一灯 + 滴水器" : "75W 太阳灯 (提供局部30℃晒点，辅以日照器)";
    } else if (species === 'corn_snake') {
        substrate = "白杨木屑/竹纤维 70% + 椰土 30% (干燥耐挖掘配方，防止积水烂鳞)";
        plants = "虎尾兰 (Snake Plant)、波士顿蕨 [建议盆栽嵌入防蛇刨根]";
        cleanupCrews = Math.max(8, Math.round(volumeLiters * 0.2)) + "只 斑马等足虫 (耐干降解)";
        heating = volumeLiters < 100 ? "35W 底部加热皮/加热垫 (温控28-30℃)" : "50W 深热投影仪 (DHP，提供舒适热源区)";
    } else if (species === 'bearded_dragon') {
        substrate = "爬宠专用沙 60% + 粘土 30% + 少量椰土 10% (仿荒漠干热基质，利于磨爪)";
        plants = "多肉植物 (Succulents)、空气凤梨、无刺仙人掌";
        cleanupCrews = "不推荐湿润等足虫，可投放少量面包虫或干热跳虫";
        heating = volumeLiters < 120 ? "75W 太阳灯/日行射灯 (晒点38℃，环境30℃)" : "100W 金卤灯 + 专属 UVB 10.0 灯管 (沙漠强光环境)";
    }

    container.innerHTML = `
        <div class="calc-result-title">📊 缸体计算结果 (${Math.round(volumeLiters)}L 容积)</div>
        <div class="calc-result-row"><strong>🪵 垫材配比:</strong> ${substrate}</div>
        <div class="calc-result-row"><strong>🌿 推荐植物:</strong> ${plants}</div>
        <div class="calc-result-row"><strong>🐛 降解生物:</strong> ${cleanupCrews}</div>
        <div class="calc-result-row"><strong>🔥 控温推荐:</strong> ${heating}</div>
    `;
}

function toggleMapRadar() {
    state.radarActive = !state.radarActive;
    renderPageHome();
}

function showMapInfoPopup(key) {
    const card = document.getElementById('map-info-popup-card');
    if (!card) return;

    let html = '';
    if (key === 'keeper_beijing') {
        html = `
            <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                <strong style="font-size:10px; color:var(--text-primary);">👤 爬友: 龙猫饲养员 - 橙子</strong>
                <span style="font-size:8px; color:var(--text-secondary);">距离您: 1.2km | 橱窗宠物: Mochi (睫角)</span>
            </div>
            <button class="join-btn" onclick="event.stopPropagation(); viewKeeperPet('pet_mochi')" style="padding: 2px 6px; font-size: 8px; border-radius: 6px; cursor:pointer;">看它</button>
        `;
    } else if (key === 'vet_beijing') {
        html = `
            <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                <strong style="font-size:10px; color:var(--text-primary);">🏥 芭比堂异宠专科诊所 (北京店)</strong>
                <span style="font-size:8px; color:var(--text-secondary);">距离您: 2.5km | 评分: ⭐️ 4.9 | 电话预约制</span>
            </div>
            <button class="join-btn" onclick="event.stopPropagation(); alert('已为您呼叫预约专线: 010-8273xxxx')" style="padding: 2px 6px; font-size: 8px; border-radius: 6px; background-color: var(--color-accent); cursor:pointer;">拨打</button>
        `;
    }

    card.innerHTML = html + `<span style="cursor:pointer; font-size:9px; font-weight:bold; color:var(--text-secondary); margin-left:8px;" onclick="event.stopPropagation(); closeMapInfoPopup()">✕</span>`;
    card.classList.add('active');
}

function closeMapInfoPopup() {
    const card = document.getElementById('map-info-popup-card');
    if (card) {
        card.classList.remove('active');
    }
}

function viewKeeperPet(petId) {
    showPetProfile(petId);
    closeMapInfoPopup();
}

// ==========================================
// 9. USER PROFILE CUSTOMIZATION HELPERS
// ==========================================

function loadUserProfile() {
    const saved = localStorage.getItem('petverse_user_profile');
    if (saved) {
        try {
            state.userProfile = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing user profile from localStorage', e);
        }
    }
}

function saveUserProfile() {
    localStorage.setItem('petverse_user_profile', JSON.stringify(state.userProfile));
}

function triggerUserAvatarSelect() {
    const fileInput = document.getElementById('user-avatar-file');
    if (fileInput) {
        fileInput.click();
    }
}

function handleUserAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        state.userProfile.avatar = e.target.result; // Base64 data URL
        saveUserProfile();
        renderPageMe();
        alert(state.language === 'zh' ? '头像更新成功！' : 'Avatar updated successfully!');
    };
    reader.readAsDataURL(file);
}

function changeMeNamePrompt() {
    const newName = prompt(
        state.language === 'zh' ? '请输入新的昵称:' : 'Enter new nickname:',
        state.userProfile.username
    );
    if (newName && newName.trim()) {
        state.userProfile.username = newName.trim();
        saveUserProfile();
        renderPageMe();
    }
}

function changeMeDescPrompt() {
    const newDesc = prompt(
        state.language === 'zh' ? '请输入新的个人简介:' : 'Enter new profile description:',
        state.userProfile.desc
    );
    if (newDesc !== null) {
        state.userProfile.desc = newDesc.trim();
        saveUserProfile();
        renderPageMe();
    }
}

// ==========================================
// 10. ENCYCLOPAEDIA, Q&A BOARD & CANVAS GRAPH
// ==========================================

const careEncyclopaedia = [
    {
        key: 'crested_gecko',
        name: '睫角守宫',
        nameEn: 'Crested Gecko',
        difficulty: '⭐️⭐️ (新手友好)',
        difficultyEn: '⭐️⭐️ (Beginner Friendly)',
        temp: '22℃ - 26℃ (避免超过28℃)',
        tempEn: '22°C - 26°C (Avoid >28°C)',
        humidity: '60% - 80% (夜间喷水)',
        humidityEn: '60% - 80% (Spray at night)',
        diet: '果泥为主，辅以钙粉卷蟋蟀 (每周1-2次)',
        dietEn: 'Crested Gecko Diet primarily, dusted insects 1-2x/week',
        substrate: '椰土 / 树皮 / 厨房纸',
        substrateEn: 'Coco fiber / Orchid bark / Paper towel',
        lifespan: '10 - 15 年 / 15-20 cm',
        lifespanEn: '10 - 15 years / 15-20 cm',
        diseases: '缺钙软骨病 (MBD)、蜕皮困难、尾部自切',
        diseasesEn: 'Metabolic Bone Disease (MBD), Dysecdysis, Tail autotomy',
        brief: '睫角守宫不需要额外紫外线灯(UVB)，对温度要求温和，是非常适合公寓饲养的入门爬宠。',
        briefEn: 'Requires no UVB, mild temperature needs, perfect for apartment beginners.'
    },
    {
        key: 'veiled_chameleon',
        name: '高冠变色龙',
        nameEn: 'Veiled Chameleon',
        difficulty: '⭐️⭐️⭐️⭐️ (中高难度)',
        difficultyEn: '⭐️⭐️⭐️⭐️ (Intermediate/Advanced)',
        temp: '日间环境 26-28℃，晒点 32-35℃，夜间 20℃',
        tempEn: 'Daytime 26-28°C, Basking 32-35°C, Night 20°C',
        humidity: '50% - 70% (需要滴水器喝流动水)',
        humidityEn: '50% - 70% (Requires dripping water)',
        diet: '蟋蟀、杜比亚蟑螂，需频繁添加钙粉与D3',
        dietEn: 'Crickets, Dubia roaches; requires regular calcium + D3',
        substrate: '不建议用散装垫材，裸缸或绿植盆栽',
        substrateEn: 'Bare bottom recommended, potted live plants',
        lifespan: '5 - 8 年 / 30-45 cm',
        lifespanEn: '5 - 8 years / 30-45 cm',
        diseases: '呼吸道感染、缺钙软骨病、眼睛发炎(拒食)',
        diseasesEn: 'Respiratory Infection, MBD, Eye infection',
        brief: '高冠变色龙需要高通风网箱、UVB日照灯以及流动的饮用水，对环境通风和水源要求高。',
        briefEn: 'Requires mesh enclosure for ventilation, UVB lighting, and dripping water system.'
    },
    {
        key: 'corn_snake',
        name: '玉米蛇',
        nameEn: 'Corn Snake',
        difficulty: '⭐️ (极易上手)',
        difficultyEn: '⭐️ (Very Easy)',
        temp: '冷区 24-26℃，热区 28-30℃ (加热垫温控)',
        tempEn: 'Cool side 24-26°C, Warm side 28-30°C (via heat mat)',
        humidity: '40% - 50% (蜕皮期加湿至70%)',
        humidityEn: '40% - 50% (Increase to 70% during shed)',
        diet: '大小合适的小白鼠 (幼蛇每5-7天一只，成蛇每10-14天)',
        dietEn: 'Frozen-thawed mice (Pinkies for babies 5-7 days, adults 10-14 days)',
        substrate: '白杨木屑 / 玉米芯 / 蛇沙',
        substrateEn: 'Aspen shavings / Corn cob / Snake bedding',
        lifespan: '15 - 20 年 / 100-150 cm',
        lifespanEn: '15 - 20 years / 100-150 cm',
        diseases: '肠胃炎(吐食)、蜕皮不全、寄生虫',
        diseasesEn: 'Gastroenteritis, Dysecdysis, Parasites',
        brief: '温顺、花色丰富、无毒无味。只需准备好加温区和躲避，是最好养的冷血宠物之一。',
        briefEn: 'Gentle, colorful, non-venomous, odorless. Just need heat and hides. The best beginner snake.'
    },
    {
        key: 'bearded_dragon',
        name: '鬃狮蜥',
        nameEn: 'Bearded Dragon',
        difficulty: '⭐️⭐️⭐️ (新手适中)',
        difficultyEn: '⭐️⭐️⭐️ (Moderate)',
        temp: '冷区 28-30℃，晒点 38-42℃，夜间不低于20℃',
        tempEn: 'Cool side 28-30°C, Basking 38-42°C, Night >20°C',
        humidity: '30% - 40% (保持干燥，避免积水)',
        humidityEn: '30% - 40% (Keep dry, avoid dampness)',
        diet: '幼体偏肉食(蟋蟀/蟑螂)，成体偏素食(油麦菜/蒲公英)',
        dietEn: 'Insects for juveniles, greens/veggies for adults; D3 calcium required',
        substrate: '爬砂 / 瓷砖 / 豆腐砂 (避免误食细砂)',
        substrateEn: 'Reptile carpet / Tile / Paper pellets',
        lifespan: '10 - 12 年 / 45-60 cm',
        lifespanEn: '10 - 12 years / 45-60 cm',
        diseases: '缺钙抽搐、寄生虫感染、肠道阻塞',
        diseasesEn: 'Calcium deficiency seizures, Parasites, Impaction',
        brief: '互动性极佳，喜欢晒太阳和发呆，需要大空间饲养箱与强烈的UVB光照。',
        briefEn: 'Highly interactive, loves basking, requires a large terrarium with strong UVB.'
    }
];

function loadQAQuestions() {
    const saved = localStorage.getItem('petverse_questions');
    if (saved) {
        try {
            state.questions = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing questions', e);
        }
    }
    if (!state.questions || state.questions.length === 0) {
        state.questions = [
            {
                id: 'q1',
                title: '睫角守宫眼睛好像有点陷下去，是脱水了吗？',
                titleEn: 'My crested gecko\'s eyes look sunken. Is it dehydrated?',
                speciesKey: 'crested_gecko',
                author: '新手爬爬王',
                authorBadge: 'keeper',
                solved: false,
                repliesCount: 4,
                replyAuthor: '芭比堂林医生',
                replyAuthorBadge: 'vet',
                replyText: '很有可能是脱水。建议立刻在饲养箱内喷水，或者用温水泡澡10分钟补水。'
            },
            {
                id: 'q2',
                title: '求助！玉米蛇已经拒食两次了，肚子有点鼓，需要喂益生菌吗？',
                titleEn: 'Help! Corn snake refused food twice, belly looks bloated, probiotics?',
                speciesKey: 'corn_snake',
                author: '魔都蛇精阁',
                authorBadge: 'keeper',
                solved: true,
                repliesCount: 12,
                replyAuthor: '蛇圈大佬-陈',
                replyAuthorBadge: 'veteran',
                replyText: '肚子鼓起可能是快要排便或有宿便。暂时停食，保持静养，把温水区控温在28度，通常会自动排便。不要急着喂药。'
            }
        ];
    }
}

function saveQAQuestions() {
    localStorage.setItem('petverse_questions', JSON.stringify(state.questions));
}

function renderPageCare(container, tabHeader) {
    if (state.activeCareDetailKey) {
        const item = careEncyclopaedia.find(c => c.key === state.activeCareDetailKey);
        if (item) {
            renderCareDetailPage(container, item);
            return;
        }
    }

    const speciesCards = careEncyclopaedia.map(c => `
        <div class="care-species-card" onclick="showCareDetail('${c.key}')">
            <span class="care-species-name">${state.language === 'zh' ? c.name : c.nameEn}</span>
            <span class="care-species-difficulty">${state.language === 'zh' ? c.difficulty : c.difficultyEn}</span>
            <span class="care-species-brief">${state.language === 'zh' ? c.brief : c.briefEn}</span>
        </div>
    `).join('');

    // Q&A questions list
    const questionsHtml = state.questions.map(q => {
        const title = state.language === 'zh' ? q.title : q.titleEn;
        let authorBadgeText = state.language === 'zh' ? '玩家' : 'Keeper';
        let badgeClass = 'keeper';
        if (q.replyAuthorBadge === 'vet') {
            authorBadgeText = state.language === 'zh' ? '🩺 认证兽医' : '🩺 Verified Vet';
            badgeClass = 'vet';
        } else if (q.replyAuthorBadge === 'veteran') {
            authorBadgeText = state.language === 'zh' ? '👑 资深爬友' : '👑 Veteran Keeper';
            badgeClass = 'veteran';
        }
        
        const statusText = q.solved 
            ? (state.language === 'zh' ? '已解决' : 'Resolved') 
            : (state.language === 'zh' ? '求助中' : 'Help');
        const statusClass = q.solved ? 'resolved' : 'unresolved';

        return `
            <div class="qa-question-card" onclick="alert('最新回复 (by ${q.replyAuthor}):\\n\\n${q.replyText}')">
                <div class="qa-question-title-row">
                    <span class="qa-status-badge ${statusClass}">${statusText}</span>
                    <span class="qa-question-title">${title}</span>
                </div>
                <div class="qa-question-meta">
                    <div>
                        <span>by ${q.author}</span>
                        <span class="qa-user-badge ${badgeClass}">${authorBadgeText}</span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span>💬 ${q.repliesCount}</span>
                        <span style="color:var(--color-accent); font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); toggleQuestionSolved('${q.id}')">
                            ${q.solved ? (state.language === 'zh' ? '设为未解决' : 'Reopen') : (state.language === 'zh' ? '设为已解决' : 'Solve')}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${tabHeader}
        <div style="margin-bottom: 12px; text-align: left;">
            <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
                ${state.language === 'zh' ? '查阅最核心的异宠日常饲养要求，查看温度、湿度、食性配比。' : 'Browse crucial care guidelines: temperature, humidity, diet.'}
            </p>
        </div>
        
        <div class="care-species-grid">
            ${speciesCards}
        </div>

        <!-- Q&A Section -->
        <div class="qa-board-section">
            <div class="qa-board-header">
                <h4 class="section-title" style="font-size:12px; margin-bottom:0; color:var(--color-brand)">❓ ${state.language === 'zh' ? '爬友避坑求助板' : 'Keeper Q&A Board'}</h4>
                <button class="join-btn" onclick="submitNewQuestionPrompt()" style="padding: 3px 8px; font-size: 8px; border-radius: 8px; cursor:pointer;">${state.language === 'zh' ? '我要提问' : 'Ask Question'}</button>
            </div>
            <div class="qa-questions-list">
                ${questionsHtml}
            </div>
        </div>
    `;
}

function showCareDetail(speciesKey) {
    state.activeCareDetailKey = speciesKey;
    renderPageCircles();
}

function renderCareDetailPage(container, item) {
    container.innerHTML = `
        <div class="detail-back-bar" onclick="goBackToCareList()" style="margin-bottom: 12px; text-align: left;">
            <span>⬅️ ${state.language === 'zh' ? '返回百科' : 'Back to Encyclopaedia'}</span>
        </div>

        <div class="care-detail-header">
            <h3 class="care-detail-title">${state.language === 'zh' ? item.name : item.nameEn}</h3>
            <span class="care-detail-diff-rating">${state.language === 'zh' ? '新手友好度: ' + item.difficulty : 'Difficulty: ' + item.difficultyEn}</span>
            <p style="font-size: 10px; color: var(--text-secondary); margin-top: 8px; line-height: 1.4;">
                ${state.language === 'zh' ? item.brief : item.briefEn}
            </p>

            <div class="care-spec-grid">
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '🌡️ 适宜温度' : '🌡️ Target Temp'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.temp : item.tempEn}</span>
                </div>
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '💧 适宜湿度' : '💧 Humidity'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.humidity : item.humidityEn}</span>
                </div>
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '🥩 食性配比' : '🥩 Diet & Food'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.diet : item.dietEn}</span>
                </div>
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '🪵 垫材推荐' : '🪵 Bedding'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.substrate : item.substrateEn}</span>
                </div>
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '⏳ 寿命与体型' : '⏳ Lifespan/Size'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.lifespan : item.lifespanEn}</span>
                </div>
                <div class="care-spec-item">
                    <span class="care-spec-label">${state.language === 'zh' ? '🏥 常见疾病' : '🏥 Common Illness'}</span>
                    <span class="care-spec-value">${state.language === 'zh' ? item.diseases : item.diseasesEn}</span>
                </div>
            </div>

            <!-- Legality & Regulation Warning -->
            <div class="care-legality-warning" style="margin-top: 15px; padding: 10px; background-color: var(--tag-bg); border-radius: 8px; border-left: 4.5px solid var(--color-accent); text-align: left;">
                <h5 style="margin: 0 0 6px 0; color: var(--color-accent); font-size: 11px; display: flex; align-items: center; gap: 4px; font-weight: bold;">
                    ⚠️ ${state.language === 'zh' ? '饲养与法律提示' : 'Legality & Care Warning'}
                </h5>
                <p style="margin: 0; font-size: 9px; line-height: 1.4; color: var(--text-secondary);">
                    ${state.language === 'zh' 
                        ? '部分异宠物种在特定国家或地区可能受到华盛顿公约（CITES）或地方野生动物保护法限制。请在饲养前务必查阅当地林业及农业法规，坚持合法合规饲养，杜绝野捕与非法交易。' 
                        : 'Some exotic species may be restricted by international trade conventions (e.g. CITES) or local wildlife protection laws. Please consult your local forestry and agricultural regulations before acquisition. Keep it legal and say NO to wild-catching or illegal trade.'}
                </p>
            </div>
        </div>

        <button class="submit-post-btn" onclick="triggerVivariumCalculatorFromCare('${item.key}')">
            🌿 ${state.language === 'zh' ? '一键生成生态缸计算器' : 'Generate Vivarium Recipe'}
        </button>
    `;
}

function goBackToCareList() {
    state.activeCareDetailKey = null;
    renderPageCircles();
}

function triggerVivariumCalculatorFromCare(speciesKey) {
    state.activeHomeHeaderTab = 'guide'; // care guides sub tab
    switchTab('home');
    setTimeout(() => {
        const select = document.getElementById('calc-pet-species');
        if (select) {
            select.value = speciesKey;
            runVivariumCalculator();
        }
    }, 100);
}

function submitNewQuestionPrompt() {
    if (!state.isLoggedIn) {
        showLoginModal(() => submitNewQuestionPrompt());
        return;
    }
    const title = prompt(state.language === 'zh' ? '请输入您的问题（我们会有专业兽医和资深玩家来解答）：' : 'Enter your question (vets and veteran keepers will answer):');
    if (!title || !title.trim()) return;

    const newQ = {
        id: 'q_' + Date.now(),
        title: title.trim(),
        titleEn: `[EN] ${title.trim()}`,
        speciesKey: 'crested_gecko',
        author: state.userProfile.username,
        authorBadge: 'keeper',
        solved: false,
        repliesCount: 0,
        replyAuthor: 'System',
        replyAuthorBadge: 'veteran',
        replyText: state.language === 'zh' ? '您的问题已提交到社区，正在等待兽医或资深玩家回复！' : 'Question submitted. Waiting for community responses!'
    };
    state.questions.unshift(newQ);
    saveQAQuestions();
    renderPageCircles();
}

function toggleQuestionSolved(questionId) {
    const q = state.questions.find(item => item.id === questionId);
    if (q) {
        q.solved = !q.solved;
        saveQAQuestions();
        renderPageCircles();
    }
}

function scrollToTopSmoothly() {
    const container = document.getElementById('screen-body-container');
    if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function drawPetWeightChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, width, height);

    const weights = [3, 12, 25, 38, 42, 45];
    const labels = ['D1', 'D100', 'D200', 'D300', 'D400', 'D500'];

    // Draw background grid lines
    ctx.strokeStyle = state.theme === 'theme-dark' ? '#202824' : '#E6E2DC';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = 20 + i * (height - 40) / 4;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
    }

    // Plot points and draw line
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#E87A51'; // Morandi Terracotta Accent
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = weights.map((w, idx) => {
        const x = 30 + idx * (width - 50) / (weights.length - 1);
        const y = height - 20 - (w / 50) * (height - 40);
        return { x, y, w, label: labels[idx] };
    });

    points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw gradient fill under line
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(232, 122, 81, 0.25)');
    grad.addColorStop(1, 'rgba(232, 122, 81, 0.0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - 20);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - 20);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw dots and text labels
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#E87A51';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = state.theme === 'theme-dark' ? '#131A17' : '#FFFFFF';
        ctx.stroke();

        ctx.fillStyle = state.theme === 'theme-dark' ? '#E0E8E4' : '#1C2621';
        ctx.font = '9px sans-serif';
        ctx.fillText(p.w + 'g', p.x - 8, p.y - 8);

        ctx.fillStyle = '#8CA095';
        ctx.font = '8px sans-serif';
        ctx.fillText(p.label, p.x - 10, height - 6);
    });
}

// ---- Visitor / Guest Mode Interceptors & Modals ----
function checkLoginAndExecute(callback) {
    if (state.isLoggedIn) {
        if (callback) callback();
    } else {
        showLoginModal(callback);
    }
}

function showLoginModal(callback = null) {
    state.loginCallback = callback;
    state.tempLoginAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
    
    const backdrop = document.getElementById('login-modal-backdrop');
    const modal = document.getElementById('login-modal');
    const preview = document.getElementById('login-avatar-preview');
    const usernameInput = document.getElementById('login-username-input');
    const descInput = document.getElementById('login-desc-input');
    
    if (preview) preview.src = state.tempLoginAvatar;
    if (usernameInput) usernameInput.value = '';
    if (descInput) descInput.value = '';
    
    if (backdrop && modal) {
        backdrop.classList.add('active');
        modal.classList.add('active');
    }
}

function closeLoginModal() {
    state.loginCallback = null;
    const backdrop = document.getElementById('login-modal-backdrop');
    const modal = document.getElementById('login-modal');
    if (backdrop && modal) {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
    }
}

function triggerLoginAvatarSelect() {
    const fileInput = document.getElementById('login-avatar-file');
    if (fileInput) {
        fileInput.click();
    }
}

function handleLoginAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        state.tempLoginAvatar = e.target.result; // Base64 data URL
        const preview = document.getElementById('login-avatar-preview');
        if (preview) {
            preview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

function submitLoginRegister() {
    const usernameInput = document.getElementById('login-username-input');
    const descInput = document.getElementById('login-desc-input');
    
    if (!usernameInput || !usernameInput.value.trim()) {
        alert(state.language === 'zh' ? '请输入您的昵称！' : 'Please enter your nickname!');
        return;
    }
    
    const username = usernameInput.value.trim();
    const desc = descInput ? descInput.value.trim() : '';
    
    // Save to profile
    state.isLoggedIn = true;
    localStorage.setItem('petverse_is_logged_in', 'true');
    
    state.userProfile.username = username;
    state.userProfile.avatar = state.tempLoginAvatar;
    state.userProfile.desc = desc || (state.language === 'zh' ? '这家伙很懒，什么都没留下。' : 'No bio written.');
    
    saveUserProfile();
    closeLoginModal();
    
    // Re-render "Me" page and other places if we are currently looking at it
    if (state.activeTab === 'me') {
        renderPageMe();
    }
    
    alert(state.language === 'zh' ? `欢迎加入 Petverse，${username}！` : `Welcome to Petverse, ${username}!`);
    
    // Execute the pending action
    if (state.loginCallback) {
        const cb = state.loginCallback;
        state.loginCallback = null;
        cb();
    }
}

function performLogOut() {
    if (confirm(state.language === 'zh' ? '确定要退出登录吗？' : 'Are you sure you want to log out?')) {
        state.isLoggedIn = false;
        localStorage.removeItem('petverse_is_logged_in');
        renderPageMe();
        alert(state.language === 'zh' ? '已退出当前账号，进入游客浏览模式。' : 'Logged out. Entered guest mode.');
    }
}

// Guidelines Modal
function showGuidelinesModal() {
    const backdrop = document.getElementById('guidelines-modal-backdrop');
    const modal = document.getElementById('guidelines-modal');
    if (backdrop && modal) {
        backdrop.classList.add('active');
        modal.classList.add('active');
    }
}

function closeGuidelinesModal() {
    const backdrop = document.getElementById('guidelines-modal-backdrop');
    const modal = document.getElementById('guidelines-modal');
    if (backdrop && modal) {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
    }
}

function showCommunityGuidelines() {
    showGuidelinesModal();
}

// Trust & Safety: Report & Block
function reportContent(type, id) {
    alert(state.language === 'zh' 
        ? '感谢您的监督！已收到您的举报，我们将会在24小时内对该内容进行审核并做出处理。' 
        : 'Thank you for your report! The content has been submitted and will be reviewed within 24 hours.');
}

function confirmBlockUser(username) {
    if (username === state.userProfile.username) {
        alert(state.language === 'zh' ? '您不能拉黑您自己！' : 'You cannot block yourself!');
        return;
    }
    const msg = state.language === 'zh' 
        ? `确定要拉黑用户 "${username}" 吗？拉黑后您将不再看到其发布的动态和评论。` 
        : `Are you sure you want to block user "${username}"? You will no longer see their posts and comments.`;
    
    if (confirm(msg)) {
        if (!state.blockedUsers.includes(username)) {
            state.blockedUsers.push(username);
            localStorage.setItem('petverse_blocked_users', JSON.stringify(state.blockedUsers));
        }
        alert(state.language === 'zh' ? `已将 ${username} 加入黑名单` : `Blocked user ${username}`);
        
        // Re-render
        renderPageHome();
        if (state.activePostDetailId) {
            renderPagePostDetail();
        }
    }
}

// Number Formatting Helper
function formatNumber(num) {
    if (num === undefined || num === null) return 0;
    if (num < 1000) return num;
    if (state.language === 'zh') {
        if (num >= 10000) {
            return (num / 10000).toFixed(1).replace('.0', '') + '万';
        }
        return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    } else {
        return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
}

// Expose functions globally
window.switchCirclesSubTab = switchCirclesSubTab;
window.showCareDetail = showCareDetail;
window.goBackToCareList = goBackToCareList;
window.triggerVivariumCalculatorFromCare = triggerVivariumCalculatorFromCare;
window.submitNewQuestionPrompt = submitNewQuestionPrompt;
window.toggleQuestionSolved = toggleQuestionSolved;
window.scrollToTopSmoothly = scrollToTopSmoothly;
window.drawPetWeightChart = drawPetWeightChart;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.triggerLoginAvatarSelect = triggerLoginAvatarSelect;
window.handleLoginAvatarUpload = handleLoginAvatarUpload;
window.submitLoginRegister = submitLoginRegister;
window.performLogOut = performLogOut;
window.showGuidelinesModal = showGuidelinesModal;
window.closeGuidelinesModal = closeGuidelinesModal;
window.showCommunityGuidelines = showCommunityGuidelines;
window.reportContent = reportContent;
window.confirmBlockUser = confirmBlockUser;


