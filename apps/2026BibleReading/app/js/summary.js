// Audio Context for Pop Sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// GMT+8 Date Helpers
function getTWDate(date = new Date()) {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 8));
}

function getTWDateString(date = new Date()) {
    const tw = getTWDate(date);
    const y = tw.getFullYear();
    const m = String(tw.getMonth() + 1).padStart(2, '0');
    const d = String(tw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function playPopSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

const BOOK_MAP = {
    "創世記": "創", "出埃及記": "出", "利未記": "利", "民數記": "民", "申命記": "申",
    "約書亞記": "書", "士師記": "士", "路得記": "得", "撒母耳記上": "撒上", "撒母耳記下": "撒下",
    "列王紀上": "王上", "列王紀下": "王下", "歷代志上": "代上", "歷代志下": "代下",
    "以斯拉記": "拉", "尼希米記": "尼", "以斯帖記": "斯", "約伯記": "伯", "詩篇": "詩",
    "箴言": "箴", "傳道書": "傳", "雅歌": "歌", "以賽亞書": "賽", "耶利米書": "耶",
    "耶利米哀歌": "哀", "以西結書": "結", "但以理書": "但", "何西阿書": "何",
    "約珥書": "珥", "阿摩司書": "摩", "俄巴底亞書": "俄", "約拿書": "拿",
    "彌迦書": "彌", "那鴻書": "鴻", "哈巴谷書": "哈", "西番雅書": "番", "哈該書": "該",
    "撒迦利亞書": "亞", "瑪拉基書": "瑪",
    "馬太福音": "太", "馬可福音": "可", "路加福音": "路", "約翰福音": "約", "使徒行傳": "徒",
    "羅馬書": "羅", "哥林多前書": "林前", "哥林多後書": "林後", "加拉太書": "加", "以弗所書": "弗",
    "腓立比書": "腓", "歌羅西書": "西", "帖撒羅尼迦前書": "帖前", "帖撒羅尼迦後書": "帖後",
    "提摩太前書": "提前", "提摩太後書": "提後", "提多書": "多", "腓利門書": "門", "希伯來書": "來",
    "雅各書": "雅", "彼得前書": "彼前", "彼得後書": "彼後", "約翰一書": "約一", "約翰二書": "約二",
    "約翰三書": "約三", "猶大書": "猶", "啟示錄": "啟"
};

// State
let currentMonthIndex = new Date().getMonth();
let readingPlanData = [];
let summaryTexts = null;
let animationTimeouts = [];

// Init
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [planRes, textRes] = await Promise.all([
            fetch('../data/reading_plan.json'),
            fetch('../data/summary_texts.json')
        ]);
        readingPlanData = await planRes.json();
        summaryTexts = await textRes.json();
    } catch (err) {
        console.error("Failed to load data:", err);
        return;
    }

    window.appState = {
        readingPlan: readingPlanData,
        chapterProgress: {},
        currentLang: localStorage.getItem('bible_reading_lang') || 'zh'
    };

    loadProgress();
    renderMonth(currentMonthIndex);
});

function loadProgress() {
    const saved = localStorage.getItem('bible_reading_progress_v2');
    if (saved) {
        window.appState.chapterProgress = JSON.parse(saved);
    }
}

function changeSummaryMonth(offset) {
    let nextMonth = currentMonthIndex + offset;
    if (nextMonth < 0) nextMonth = 0;
    if (nextMonth > 11) nextMonth = 11;

    if (nextMonth === currentMonthIndex) return;

    currentMonthIndex = nextMonth;
    renderMonth(currentMonthIndex);
}

function isBehindGlobal() {
    const todayStr = getTWDateString();
    const progress = window.appState.chapterProgress;

    for (const plan of readingPlanData) {
        if (plan.date < todayStr) {
            if (plan.chapters) {
                const bookKey = BOOK_MAP[plan.book];
                for (const ch of plan.chapters) {
                    if (!progress[`${bookKey}_${ch}`]) return true;
                }
            }
        }
    }
    return false;
}

function isBehindInMonth(monthIdx, year = 2026) {
    const todayStr = getTWDateString();
    const progress = window.appState.chapterProgress;

    for (const plan of readingPlanData) {
        const d = new Date(plan.date);
        if (d.getFullYear() === year && d.getMonth() === monthIdx) {
            if (plan.date < todayStr) {
                if (plan.chapters) {
                    const bookKey = BOOK_MAP[plan.book];
                    for (const ch of plan.chapters) {
                        if (!progress[`${bookKey}_${ch}`]) return true;
                    }
                }
            }
        }
    }
    return false;
}

function renderMonth(monthIdx) {
    animationTimeouts.forEach(clearTimeout);
    animationTimeouts = [];

    const container = document.getElementById('summaryContainer');
    const monthLabel = document.getElementById('monthLabel');
    const theologyDisplay = document.getElementById('theologyText');
    const feedbackDisplay = document.getElementById('feedbackText');
    const percentDisplay = document.getElementById('percentDisplay');
    const progressHeader = document.getElementById('progressHeader');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    container.innerHTML = '';
    percentDisplay.textContent = '0%';

    // Arrows state
    prevBtn.disabled = (monthIdx === 0);
    nextBtn.disabled = (monthIdx === 11);

    const year = 2026;
    const isEn = window.appState.currentLang === 'en';
    const langKey = isEn ? 'en' : 'zh';

    // Update Month Label
    const monthsZh = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthLabel.textContent = isEn ? monthsEn[monthIdx] : monthsZh[monthIdx];

    // Theology Text
    if (summaryTexts) {
        theologyDisplay.textContent = summaryTexts.monthlyTheology[langKey][monthIdx];
    }

    // Filter and Group
    const groupedPlans = {};
    let totalChapters = 0;
    let completedChapters = 0;

    readingPlanData.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === year && d.getMonth() === monthIdx) {
            const dateStr = p.date;
            if (!groupedPlans[dateStr]) groupedPlans[dateStr] = [];
            groupedPlans[dateStr].push(p);

            if (p.chapters) {
                p.chapters.forEach(ch => {
                    totalChapters++;
                    const bookKey = BOOK_MAP[p.book];
                    if (window.appState.chapterProgress[`${bookKey}_${ch}`]) completedChapters++;
                });
            }
        }
    });

    const targetPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    const sortedDates = Object.keys(groupedPlans).sort();

    // Color Calculation
    progressHeader.className = 'progress-header-card'; // Reset
    if (targetPercent === 100) {
        progressHeader.classList.add('blue');
    } else if (isBehindInMonth(monthIdx)) {
        progressHeader.classList.add('orange');
    } else if (targetPercent > 0) {
        progressHeader.classList.add('green');
    } else {
        progressHeader.classList.add('gray');
    }

    // Feedback Randomizer
    if (summaryTexts) {
        let type = 'encouragement';
        const todayStr = getTWDateString();
        const viewingMonthStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;

        if (targetPercent === 100) {
            type = 'complete';
        } else if (viewingMonthStr.substring(0, 7) > todayStr.substring(0, 7)) {
            type = 'future';
        }

        const pool = summaryTexts.feedback[type][langKey];
        feedbackDisplay.textContent = pool[Math.floor(Math.random() * pool.length)];
    }

    if (targetPercent === 0) {
        // Instant Render, No Animation
        percentDisplay.textContent = '0%';
        sortedDates.forEach(dateStr => {
            const dayPlans = groupedPlans[dateStr];
            const row = createDailyRow(dateStr, dayPlans, isEn);
            container.appendChild(row);
            row.classList.add('show');
            checkCompletedChapters(row, false);
        });
        return;
    }

    // Render Loop with Animation
    sortedDates.forEach((dateStr, index) => {
        const timeoutId = setTimeout(() => {
            const dayPlans = groupedPlans[dateStr];
            const row = createDailyRow(dateStr, dayPlans, isEn);
            container.appendChild(row);

            const displayPercent = Math.round((targetPercent * (index + 1)) / sortedDates.length);
            percentDisplay.textContent = `${displayPercent}%`;
            percentDisplay.classList.remove('updating');
            void percentDisplay.offsetWidth;
            percentDisplay.classList.add('updating');

            requestAnimationFrame(() => {
                row.classList.add('show');
                checkCompletedChapters(row, true);
            });
        }, index * 100);
        animationTimeouts.push(timeoutId);
    });
}

function createDailyRow(dateStr, dayPlans, isEn) {
    const dateObj = new Date(dateStr);
    const dayDisplay = dateObj.getDate();

    const row = document.createElement('div');
    row.className = 'daily-row';

    const dateCol = document.createElement('div');
    dateCol.className = 'date-col';
    dateCol.textContent = dayDisplay;
    row.appendChild(dateCol);

    const chaptersCol = document.createElement('div');
    chaptersCol.className = 'chapters-col';

    dayPlans.forEach(plan => {
        if (plan.chapters) {
            plan.chapters.forEach(ch => {
                const bookKey = BOOK_MAP[plan.book];
                const progressKey = `${bookKey}_${ch}`;
                const isDone = window.appState.chapterProgress[progressKey];

                const box = document.createElement('div');
                box.className = 'chapter-box';
                if (isDone) box.dataset.done = "true";

                let bookName = plan.book;
                if (isEn) bookName = BOOK_MAP[plan.book] || plan.book;

                const nameSpan = document.createElement('span');
                nameSpan.className = `book-name ${bookName.length <= 2 ? 'short' : ''}`;
                nameSpan.textContent = bookName;

                const chk = document.createElement('div');
                chk.className = 'chk-icon';

                box.appendChild(chk);
                box.appendChild(nameSpan);
                box.appendChild(document.createTextNode(ch));

                chaptersCol.appendChild(box);
            });
        }
    });

    row.appendChild(chaptersCol);
    return row;
}

function checkCompletedChapters(rowElement, playSoundEnabled) {
    const boxes = rowElement.querySelectorAll('.chapter-box[data-done="true"]');
    let soundPlayed = false;

    boxes.forEach((box, idx) => {
        setTimeout(() => {
            box.classList.add('done');
            if (playSoundEnabled && !soundPlayed) {
                playPopSound();
                soundPlayed = true;
            }
        }, idx * 60);
    });
}
