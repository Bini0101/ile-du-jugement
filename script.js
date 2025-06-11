// DOM Elements
const mainTitle = document.getElementById('main-title');
const gameArea = document.getElementById('game-area');
const mainMenuScreen = document.getElementById('main-menu-screen');
const modeSelectionScreen = document.getElementById('mode-selection-screen');
const settingsScreen = document.getElementById('settings-screen');
const aboutScreen = document.getElementById('about-screen');
const trophiesScreen = document.getElementById('trophies-screen');
const trophiesList = document.getElementById('trophies-list');
const trophyToast = document.getElementById('trophy-toast');

const modeSelection = document.getElementById('mode-selection');
const startAdventureButton = document.getElementById('start-adventure-button');
const settingsButton = document.getElementById('settings-button');
const aboutButton = document.getElementById('about-button');
const trophiesButton = document.getElementById('trophies-button');
const menuButton = document.getElementById('menu-button');

const continueButton = document.getElementById('continue-button');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const statsContainer = document.getElementById('stats-container');
const feedbackText = document.getElementById('feedback-text');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');
const spiritGuardian = document.getElementById('spirit-guardian');
const timerContainer = document.getElementById('timer-container');
const powersContainer = document.getElementById('powers-container');

const mapScreen = document.getElementById('map-screen');
const playerToken = document.getElementById('player-token');
const mapContinueButton = document.getElementById('map-continue-button');

const musicVolumeSlider = document.getElementById('music-volume');
const sfxVolumeSlider = document.getElementById('sfx-volume');

// Game State
let gameState = {};
let nextNodeIdOnMap = null; // Stores the destination node after map screen

const gameModes = {
    normal: { lives: 5, timer: null },
    hard: { lives: 3, timer: null },
    timeTrial: { lives: 5, timer: 20 }
};

let timerInterval;

const gameData = {
    startNode: 'q1',
    nodes: {
        'q1': {
            type: 'question',
            question: "Un esprit vous montre trois coffres. Seule une des inscriptions est vraie. Où est le trésor ?<br>C1: 'Le trésor n'est pas ici.'<br>C2: 'Le trésor est dans le C1.'<br>C3: 'Le trésor est ici.'",
            answers: [
                { text: 'Coffre 1', onSelect: { type: 'loseLife', amount: 1, feedback: "Incorrect. L'esprit semble déçu." } },
                { text: 'Coffre 2', onSelect: { type: 'progress', to: 'q2', feedback: "Correct ! Si le trésor est en C2, l'inscription C2 est fausse, C3 est fausse, et C1 est vraie. Une seule vérité." } },
                { text: 'Coffre 3', onSelect: { type: 'loseLife', amount: 1, feedback: "Incorrect. L'esprit semble déçu." } },
                { text: "C'est impossible", onSelect: { type: 'loseLife', amount: 2, isTrap: true, feedback: "Abandonner si vite est une grave erreur." } }
            ]
        },
        'q2': {
            type: 'question',
            question: "J'ai des villes, mais pas de maisons. J'ai des montagnes, mais pas d'arbres. J'ai de l'eau, mais pas de poissons. Que suis-je ?",
            answers: [
                { text: 'Un rêve', onSelect: { type: 'loseLife', amount: 1, feedback: "Incorrect." } },
                { text: 'Une carte', onSelect: { type: 'progress', to: 'q_powerup', feedback: "Exact ! Une carte représente le monde sans en contenir la substance." } },
                { text: 'Le ciel', onSelect: { type: 'loseLife', amount: 1, feedback: "Incorrect." } },
                { text: 'Un livre', onSelect: { type: 'loseLife', amount: 1, feedback: "Incorrect." } }
            ]
        },
        'q_powerup': {
            type: 'question',
            question: "Une fresque ancienne représente un guerrier face à un monstre. Qu'est-ce qui brille d'une lueur protectrice dans sa main ?",
            answers: [
                { text: 'Une épée', onSelect: { type: 'loseLife', amount: 1, feedback: "L'épée est pour l'attaque, pas la pure protection."} },
                { text: 'Une lance', onSelect: { type: 'loseLife', amount: 1, feedback: "Une arme de distance, mais pas ce que l'esprit veut vous enseigner."} },
                { text: 'Un bouclier', onSelect: { type: 'multi', feedback: "L'image du bouclier s'illumine. Vous sentez une aura protectrice vous envelopper. Vous avez gagné un Bouclier Mystique !", actions: [
                    { type: 'gainPower', power: 'shield', amount: 1 },
                    { type: 'progress', to: 'q3' }
                ] } },
                { text: 'Rien, il fuit', onSelect: { type: 'loseLife', amount: 1, feedback: "La fuite n'est pas une option honorable ici."} }
            ]
        },
        'q3': {
            type: 'question',
            question: "Qu'est-ce qui peut voyager dans les coins du monde tout en restant dans son propre coin ?",
            answers: [
                { text: 'Un secret', onSelect: { type: 'loseLife', amount: 1 } },
                { text: 'Un courant d\'air', onSelect: { type: 'loseLife', amount: 1 } },
                { text: 'Un timbre', onSelect: { type: 'progress', to: 'q_dilemma', feedback: "Bien vu. Le timbre voyage avec la lettre, collé dans son coin." } },
                { text: 'Une pensée', onSelect: { type: 'loseLife', amount: 2, isTrap: true, feedback: "Une réponse philosophique, mais pas celle attendue par l'esprit pragmatique." } }
            ]
        },
        'q_dilemma': {
            type: 'question',
            question: "Vous trouvez un autre naufragé, affaibli. Il supplie pour de l'aide. Près de lui se trouve une caisse de provisions.",
            answers: [
                { text: "Partager vos forces pour l'aider", onSelect: { type: 'multi', feedback: "L'effort vous coûte, mais vous n'êtes plus seul.", actions: [
                    { type: 'loseLife', amount: 1 },
                    { type: 'setFlag', flag: 'savedCastaway', value: true },
                    { type: 'progress', to: 'q4' }
                ]} },
                { text: 'Prendre ses provisions', onSelect: { type: 'multi', feedback: "Vous pillez ses affaires. L'île semble vous juger...", actions: [
                    { type: 'gainLife', amount: 1 },
                    { type: 'setFlag', flag: 'selfishChoice', value: true },
                    { type: 'progress', to: 'q4' }
                ]} },
                { text: "L'ignorer et continuer", onSelect: { type: 'progress', to: 'q4', feedback: "Vous l'abandonnez. Un frisson vous parcourt l'échine." } },
            ]
        },
        'q4': {
            type: 'question',
            question: "Plus on en prend, plus on en laisse derrière soi. Que sont-ils ?",
            answers: [
                { text: 'Des souvenirs', onSelect: { type: 'loseLife', amount: 1 } },
                { text: 'Des pas', onSelect: { type: 'progress', to: 'end', feedback: "Élémentaire ! Chaque pas en avant en laisse un autre derrière." } },
                { text: 'Des dettes', onSelect: { type: 'loseLife', amount: 1 } },
                { text: 'Des leçons', onSelect: { type: 'loseLife', amount: 1 } }
            ]
        },
        'end': { type: 'end' }
    }
};

const mapSteps = {
    start: { x: 15, y: 85 }, // Start at bottom left
    q1: { x: 15, y: 85 },
    q2: { x: 35, y: 68 },
    q_powerup: { x: 50, y: 55 },
    q3: { x: 55, y: 50 },
    q_dilemma: { x: 70, y: 38 },
    q4: { x: 75, y: 32 },
    end: { x: 90, y: 15 },
};

const achievementsList = {
    'PERFECT_START': { name: "Départ parfait", description: "Répondre aux 3 premiers nœuds sans perdre de vie.", icon: '🌟' },
    'NO_MISTAKES_5': { name: "Sagesse incarnée", description: "Répondre à 5 questions d'affilée sans erreur.", icon: '🧠' },
    'SELFLESS': { name: "Bon Samaritain", description: "Aider l'autre naufragé.", icon: '❤️' },
    'SECRET_HUNTER': { name: "Chasseur de secrets", description: "Trouver votre premier pouvoir mystique.", icon: '🛡️' },
    'NO_POWERS': { name: "Force de la nature", description: "Finir le jeu sans utiliser de pouvoir.", icon: '🔥' },
    'SURVIVOR': { name: "Survivant", description: "Terminer le jeu.", icon: '🏆' }
};

// --- SOUND ENGINE ---
let audioContext;
let musicSource = null;
let musicGainNode;
let sfxGainNode;

const soundBuffers = {};
const soundsToLoad = {
    correct: 'correct_answer.mp3',
    wrong: 'wrong_answer.mp3',
    trap: 'trap_answer.mp3',
    bgm: 'background_music.mp3',
    win: 'win_music.mp3',
    lose: 'lose_music.mp3'
};

let settings = {
    musicVolume: 0.5,
    sfxVolume: 1.0,
};

function saveSettings() {
    localStorage.setItem('islandJudgmentSettings', JSON.stringify(settings));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('islandJudgmentSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    musicVolumeSlider.value = settings.musicVolume;
    sfxVolumeSlider.value = settings.sfxVolume;
    if (musicGainNode) musicGainNode.gain.value = settings.musicVolume;
    if (sfxGainNode) sfxGainNode.gain.value = settings.sfxVolume;
}

function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        musicGainNode = audioContext.createGain();
        sfxGainNode = audioContext.createGain();
        musicGainNode.connect(audioContext.destination);
        sfxGainNode.connect(audioContext.destination);
        
        loadSettings();
        loadAllSounds();
    } catch (e) {
        console.error("Web Audio API n'est pas supporté par ce navigateur.");
    }
}

async function loadSound(name, url) {
    if (!audioContext) return;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        soundBuffers[name] = audioBuffer;
    } catch (e) {
        console.error(`Erreur de chargement du son: ${name}`, e);
    }
}

function loadAllSounds() {
    for (const key in soundsToLoad) {
        loadSound(key, soundsToLoad[key]);
    }
}

function playSound(name) {
    if (!audioContext || !soundBuffers[name]) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(sfxGainNode);
    source.start(0);
}

function playMusic(name, loop = false) {
    if (!audioContext || !soundBuffers[name]) {
        setTimeout(() => playMusic(name, loop), 500); // Retry if buffer not loaded
        return;
    }
    stopMusic();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    musicSource = audioContext.createBufferSource();
    musicSource.buffer = soundBuffers[name];
    musicSource.loop = loop;
    musicSource.connect(musicGainNode);
    musicSource.start(0);
}

function stopMusic() {
    if (musicSource) {
        musicSource.stop();
        musicSource = null;
    }
}

// --- SCREEN TRANSITIONS ---
let currentScreen;

function switchScreen(newScreen) {
    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        
        const onAnimationEnd = () => {
            currentScreen.classList.add('hidden');
            currentScreen.classList.remove('fade-out');
            
            newScreen.classList.remove('hidden');
            newScreen.classList.add('fade-in');
            currentScreen = newScreen;
    
            currentScreen.removeEventListener('animationend', onAnimationEnd);
        };
        currentScreen.addEventListener('animationend', onAnimationEnd, { once: true });
    } else {
        newScreen.classList.remove('hidden');
        newScreen.classList.add('fade-in');
        currentScreen = newScreen;
    }
}

// --- GAME LOGIC ---
function saveGame() {
    localStorage.setItem('islandJudgmentState', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('islandJudgmentState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        return true;
    }
    return false;
}

function clearSave() {
    localStorage.removeItem('islandJudgmentState');
}

function resetGame(mode) {
    const config = gameModes[mode];
    gameState = {
        lives: config.lives,
        maxLives: config.lives,
        currentNodeId: gameData.startNode,
        gameMode: mode,
        timer: config.timer,
        powers: { shield: 0 },
        shieldActive: false,
        stats: {
            consecutiveCorrect: 0,
            nodesVisited: 0,
            powersUsed: 0,
        },
        achievements: [],
        storyFlags: {},
    };
    saveGame();
}

function startGame(mode) {
    resetGame(mode);
    switchScreen(gameArea);
    playMusic('bgm', true);
    updateHealthUI();
    updatePowersUI();
    displayNode();
    menuButton.classList.remove('hidden');
    statsContainer.style.display = 'flex';
}

function continueGame() {
    if (loadGame() && gameData.nodes[gameState.currentNodeId] && gameData.nodes[gameState.currentNodeId].type !== 'end') {
        switchScreen(gameArea);
        playMusic('bgm', true);
        updateHealthUI();
        updatePowersUI();
        displayNode();
        menuButton.classList.remove('hidden');
        statsContainer.style.display = 'flex';
    } else {
        // Corrupted or finished save
        continueButton.classList.add('hidden');
        clearSave();
    }
}

function updateHealthUI() {
    statsContainer.innerHTML = '';
    for (let i = 0; i < gameState.maxLives; i++) {
        const heart = document.createElement('img');
        heart.src = 'heart.png';
        heart.alt = 'Vie';
        heart.classList.add('heart-icon');
        if (i < gameState.lives) {
             heart.classList.remove('lost');
        } else {
            heart.classList.add('lost');
        }
        statsContainer.appendChild(heart);
    }
}

function loseLife(amount = 1) {
    const oldLives = gameState.lives;
    gameState.lives = Math.max(0, oldLives - amount);
    gameState.stats.consecutiveCorrect = 0; // Reset streak
    
    const hearts = statsContainer.querySelectorAll('.heart-icon:not(.lost)');
    for (let i = 0; i < amount; i++) {
        if (hearts.length > i) {
            hearts[hearts.length - 1 - i].classList.add('lost');
        }
    }
}

function gainLife(amount = 1) {
    gameState.lives = Math.min(gameState.maxLives, gameState.lives + amount);
    // This is simple, a full update is easier than finding the "empty" heart
    updateHealthUI();
}

function updatePowersUI() {
    powersContainer.innerHTML = '';
    if (gameState.powers.shield > 0) {
        const shieldButton = document.createElement('button');
        shieldButton.id = 'shield-power-button';
        shieldButton.className = 'power-button';
        shieldButton.innerHTML = `Bouclier <span>(${gameState.powers.shield})</span>`;
        if (gameState.shieldActive) {
            shieldButton.classList.add('active');
        }
        shieldButton.addEventListener('click', toggleShield);
        powersContainer.appendChild(shieldButton);
    }
}

function toggleShield() {
    gameState.shieldActive = !gameState.shieldActive;
    if(gameState.shieldActive) {
        playSound('correct'); // Placeholder sound
    }
    updatePowersUI();
}

function displayNode() {
    feedbackText.textContent = '';
    spiritGuardian.className = ''; // Reset animation classes
    
    const node = gameData.nodes[gameState.currentNodeId];

    if (!node || node.type === 'end') {
        checkAndUnlockAchievements(true); // Final check on game end
        showWinScreen();
        return;
    }

    clearInterval(timerInterval);
    if (gameState.timer) {
        timerContainer.classList.remove('hidden');
        startTimer(gameState.timer);
    } else {
        timerContainer.classList.add('hidden');
    }

    const currentQuestion = node;
    questionText.innerHTML = currentQuestion.question;
    answersContainer.innerHTML = '';

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.classList.add('answer-button');
        button.dataset.action = JSON.stringify(answer.onSelect);
        button.addEventListener('click', handleAnswerClick);
        answersContainer.appendChild(button);
    });
}

function startTimer(duration) {
    let timeLeft = duration;
    timerContainer.textContent = timeLeft;
    timerContainer.style.color = 'var(--timer-color)';

    timerInterval = setInterval(() => {
        timeLeft--;
        timerContainer.textContent = timeLeft;
        if (timeLeft <= 5) {
            timerContainer.style.color = 'var(--wrong-color)';
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    feedbackText.textContent = "Le temps est écoulé... L'esprit est impatient.";
    playSound('wrong');
    loseLife(1);
    updateHealthUI();

    answersContainer.querySelectorAll('.answer-button').forEach(btn => {
        btn.disabled = true;
    });

    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2000);
    } else {
        // Retry same question
        setTimeout(displayNode, 2500);
    }
}

function handleAnswerClick(event) {
    clearInterval(timerInterval);
    const selectedButton = event.target;
    const action = JSON.parse(selectedButton.dataset.action);

    answersContainer.querySelectorAll('.answer-button').forEach(btn => {
        btn.disabled = true;
    });
    
    // Shield Logic
    const isWrong = action.type === 'loseLife' || (action.type === 'multi' && action.actions.some(a => a.type === 'loseLife'));
    if (gameState.shieldActive && isWrong) {
        gameState.shieldActive = false;
        gameState.powers.shield--;
        gameState.stats.powersUsed++;
        playSound('trap'); // Shield break sound
        feedbackText.textContent = "Votre bouclier mystique se brise, absorbant la mauvaise réponse !";
        spiritGuardian.classList.add('spirit-shake');
        updatePowersUI();
        setTimeout(() => {
            // Let them retry the question
            feedbackText.textContent = "L'esprit attend à nouveau votre réponse...";
            displayNode();
        }, 2500);
        return;
    }
    
    let nextNodeId = null;
    let isCorrect = false;

    const actions = action.type === 'multi' ? action.actions : [action];

    for (const act of actions) {
        switch(act.type) {
            case 'loseLife':
                loseLife(act.amount || 1);
                break;
            case 'gainLife':
                gainLife(act.amount || 1);
                break;
            case 'gainPower':
                gameState.powers[act.power] = (gameState.powers[act.power] || 0) + act.amount;
                break;
            case 'setFlag':
                gameState.storyFlags[act.flag] = act.value;
                break;
            case 'progress':
                nextNodeId = act.to;
                isCorrect = true;
                break;
        }
    }
    
    feedbackText.textContent = action.feedback || (isCorrect ? "Correct !" : "Incorrect.");

    if (isCorrect) {
        selectedButton.classList.add('correct');
        playSound('correct');
        spiritGuardian.classList.add('spirit-nod');
        gameState.stats.consecutiveCorrect++;
        gameState.stats.nodesVisited++;
    } else {
        selectedButton.classList.add(action.isTrap ? 'trap' : 'wrong');
        playSound(action.isTrap ? 'trap' : 'wrong');
        spiritGuardian.classList.add('spirit-shake');
    }

    updateHealthUI();
    updatePowersUI();
    checkAndUnlockAchievements();

    if (gameState.lives <= 0) {
        setTimeout(showGameOver, 2500);
        return;
    }

    if (nextNodeId) {
        setTimeout(() => {
            showMapProgression(gameState.currentNodeId, nextNodeId);
            nextNodeIdOnMap = nextNodeId; // Store for after the map
        }, 2000);
    } else { // Wrong answer, retry
        setTimeout(displayNode, 2500);
    }
}

function showMapProgression(fromNodeId, toNodeId) {
    switchScreen(mapScreen);

    const startPos = mapSteps[fromNodeId] || mapSteps['start'];
    const endPos = mapSteps[toNodeId] || mapSteps['end'];

    // Set initial position without transition
    playerToken.style.transition = 'none';
    playerToken.style.left = `${startPos.x}%`;
    playerToken.style.top = `${startPos.y}%`;

    // Force a reflow before applying the transition to make the animation work
    setTimeout(() => {
        playerToken.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out';
        playerToken.style.left = `${endPos.x}%`;
        playerToken.style.top = `${endPos.y}%`;
    }, 100);
}

function showGameOver() {
    switchScreen(gameOverScreen);
    stopMusic();
    playMusic('lose');
    clearSave();
}

function showWinScreen() {
    const winText = winScreen.querySelector('p');
    if (gameState.storyFlags.savedCastaway) {
        winText.textContent = "Grâce à votre sagesse et votre compassion, les esprits vous libèrent. L'autre naufragé vous remercie. Vous quittez l'île ensemble.";
    } else if (gameState.storyFlags.selfishChoice) {
        winText.textContent = "Votre sagesse vous a permis de triompher, mais l'égoïsme a laissé une ombre sur votre victoire. Vous partez, seul et hanté par vos choix.";
    } else {
        winText.textContent = "Les esprits, impressionnés par votre sagesse, vous montrent le chemin pour quitter l'île. Vous êtes libre.";
    }
    switchScreen(winScreen);
    stopMusic();
    playMusic('win');
    clearSave();
}

function showIntroScreen() {
    stopMusic();
    clearInterval(timerInterval);
    switchScreen(mainMenuScreen);
    initUI();
    menuButton.classList.add('hidden');
    statsContainer.style.display = 'none';
}

function initUI() {
    // Check for saved game on load
    if (loadGame() && gameData.nodes[gameState.currentNodeId] && gameData.nodes[gameState.currentNodeId].type !== 'end') {
        continueButton.classList.remove('hidden');
    } else {
        continueButton.classList.add('hidden');
        clearSave();
    }
    loadSettings();
}

function showTrophies() {
    trophiesList.innerHTML = '';
    for (const id in achievementsList) {
        const achievement = achievementsList[id];
        const isUnlocked = gameState.achievements.includes(id);

        const item = document.createElement('div');
        item.className = `trophy-item ${isUnlocked ? 'unlocked' : ''}`;

        item.innerHTML = `
            <span class="trophy-icon">${achievement.icon}</span>
            <div class="trophy-details">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        trophiesList.appendChild(item);
    }
    switchScreen(trophiesScreen);
}

function showToast(message) {
    trophyToast.textContent = message;
    trophyToast.classList.add('show');
    setTimeout(() => {
        trophyToast.classList.remove('show');
    }, 4000);
}

function unlockAchievement(id) {
    if (!gameState.achievements.includes(id)) {
        gameState.achievements.push(id);
        const achievement = achievementsList[id];
        console.log(`Trophée débloqué : ${achievement.name}`);
        showToast(`🏆 Trophée débloqué : ${achievement.name}`);
        saveGame();
    }
}

function checkAndUnlockAchievements(isGameEnd = false) {
    if (gameState.stats.consecutiveCorrect >= 3 && gameState.lives === gameState.maxLives) unlockAchievement('PERFECT_START');
    if (gameState.stats.consecutiveCorrect >= 5) unlockAchievement('NO_MISTAKES_5');
    if (gameState.storyFlags.savedCastaway) unlockAchievement('SELFLESS');
    if (gameState.powers.shield > 0) unlockAchievement('SECRET_HUNTER');
    if (isGameEnd) {
        unlockAchievement('SURVIVOR');
        if (gameState.stats.powersUsed === 0) unlockAchievement('NO_POWERS');
    }
}

// --- EVENT LISTENERS ---
window.addEventListener('DOMContentLoaded', () => {
    currentScreen = document.querySelector('.screen:not(.hidden)');
    initUI();
});

modeSelection.addEventListener('click', (e) => {
    if (e.target.matches('.mode-button')) {
        initAudio();
        const mode = e.target.dataset.mode;
        startGame(mode);
    }
});

continueButton.addEventListener('click', () => {
    initAudio();
    continueGame();
});

const returnToMenuHandler = () => {
    if (currentScreen === gameArea) {
        if (confirm("Voulez-vous vraiment quitter la partie en cours et retourner au menu ? Votre progression sera sauvegardée.")) {
            showIntroScreen();
        }
    } else if (currentScreen !== mainMenuScreen) {
        showIntroScreen();
    }
};

mainTitle.addEventListener('click', returnToMenuHandler);
menuButton.addEventListener('click', returnToMenuHandler);

restartButton.addEventListener('click', showIntroScreen);

playAgainButton.addEventListener('click', showIntroScreen);

mapContinueButton.addEventListener('click', () => {
    gameState.currentNodeId = nextNodeIdOnMap;
    saveGame();
    switchScreen(gameArea);
    displayNode();
});

startAdventureButton.addEventListener('click', () => {
    switchScreen(modeSelectionScreen);
});

settingsButton.addEventListener('click', () => {
    initAudio(); // Ensure audio context is ready for volume changes
    switchScreen(settingsScreen);
});

aboutButton.addEventListener('click', () => {
    switchScreen(aboutScreen);
});

trophiesButton.addEventListener('click', () => {
    showTrophies();
});

document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetScreenId = e.target.dataset.target;
        const targetScreen = document.getElementById(targetScreenId);
        if (targetScreen) {
            switchScreen(targetScreen);
        }
    });
});

musicVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    settings.musicVolume = volume;
    if (musicGainNode) {
        musicGainNode.gain.value = volume;
    }
    saveSettings();
});

sfxVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    settings.sfxVolume = volume;
    if (sfxGainNode) {
        sfxGainNode.gain.value = volume;
    }
    saveSettings();
});