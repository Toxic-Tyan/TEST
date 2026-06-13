import { saveGame, loadGame } from "./save.js";
const coinsText = document.getElementById("coins");
const block = document.getElementById("block");
const hpText = document.getElementById("hp");

let coins = 0;
let damage = 1;

const levels = [
    { name: "Трава", image: "blocks/Grass.png", hp: 100, reward: 80, soundType: "grass" },
    { name: "Бревно", image: "blocks/Oak.png", hp: 250, reward: 200, soundType: "wood" },
    { name: "Камень", image: "blocks/Stone.png", hp: 500, reward: 400, soundType: "stone" },
    { name: "Булыжник", image: "blocks/Iron.png", hp: 1000, reward: 600, soundType: "stone" },
    { name: "Золото", image: "blocks/Gold.png", hp: 2000, reward: 800, soundType: "stone" },
    { name: "Железо", image: "blocks/Diamond.png", hp: 3500, reward: 2000, soundType: "stone" },
    { name: "Алмаз", image: "blocks/Obsidian.png", hp: 6000, reward: 4000, soundType: "stone" },
    { name: "Незерит", image: "blocks/Ancient_Debris.png", hp: 10000, reward: 6000, soundType: "stone" },
    { name: "Энд", image: "blocks/End_Stone.png", hp: 20000, reward: 7000, soundType: "stone" },
    { name: "Бэдрок", image: "blocks/Bedrock.png", hp: 50000, reward: 8000, soundType: "stone" },
];

let currentLevel = 0;
let hp = levels[currentLevel].hp;

let levelClicks = Array(levels.length).fill(0);
let bonusTaken = Array(levels.length).fill(false);

// ================= ИНИЦИАЛИЗАЦИЯ ЗВУКОВ =================



// Фоновая музыка (запускается после первого взаимодействия игрока со страницей)
const bgMusic = new Audio("sound/music.ogg");
bgMusic.loop = true;
bgMusic.volume = 0.1; // Громкость bg музыки

// Общие звуковые эффекты
const sounds = {
    click: new Audio("sound/click.ogg"),
    achievement: new Audio("sound/achiwment.ogg"), // с твоей опечаткой в имени файла :)
    newLevel: new Audio("sound/new-level.ogg"),
    newTool: new Audio("sound/new-tool.ogg")
};

function playSound(audioObject) {
    audioObject.currentTime = 0;
    audioObject.play().catch(e => console.log("Музыка ждет клика по экрану"));
}

// Функция для рандомного выбора звука ломания блока (1-4)
function playBlockSound(type) { 
    const randomIndex = Math.floor(Math.random() * 4) + 1;
    const blockSound = new Audio(`sound/blocks/${type}${randomIndex}.ogg`);
    blockSound.muted = isMuted;
    blockSound.play();
}

// Запуск музыки при первом клике на блок (требование современных браузеров)
block.addEventListener("click", () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Музыка активирована"));
    }
}, { once: true });

// ================= КНОПКА ЗВУКА =================
let isMuted = false;
const muteBtn = document.getElementById("muteBtn");

muteBtn.addEventListener("click", () => {
    isMuted = !isMuted; 
    
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    
    bgMusic.muted = isMuted;
    
    for (let key in sounds) {
        sounds[key].muted = isMuted;
    }
});
// ================================================

updateCoins();
updateBlock();

block.addEventListener("click", () => {
    hp -= damage;
    levelClicks[currentLevel]++;

    // #1) Звук ломания блока (динамический, зависит от типа в массиве уровней)
    playBlockSound(levels[currentLevel].soundType);

    

    if (hp <= 0) {
        coins += levels[currentLevel].reward;
        updateCoins();

        if (currentLevel < levels.length - 1) {
            currentLevel++;
            // #7) Звук перехода на новый уровень
            playSound(sounds.newLevel);
        }

        hp = levels[currentLevel].hp;
        updateBlock();
    }

    hpText.textContent = `${Math.max(0, hp)} / ${levels[currentLevel].hp}`;
});

function updateCoins() {
    coinsText.textContent = coins;
}

function updateBlock() {
    block.src = levels[currentLevel].image;
    hp = levels[currentLevel].hp;
    hpText.textContent = `${hp} / ${levels[currentLevel].hp}`;

    document.querySelectorAll(".level-card").forEach(card => card.classList.remove("active"));
    const cards = document.querySelectorAll(".level-card");
    if (cards[currentLevel]) {
        cards[currentLevel].classList.add("active");
    }
}

// ================= МАГАЗИНЧИК =================

const upgrades = [
    { name: "Деревянная кирка", damage: 2, price: 0, image: "pickaxe/Wooden_Pickaxe.png" },
    { name: "Каменная кирка", damage: 5, price: 100, image: "pickaxe/stone_pickaxe.png" },
    { name: "Железная кирка", damage: 15, price: 500, image: "pickaxe/iron_pickaxe.png" },
    { name: "Золотая кирка", damage: 30, price: 1500, image: "pickaxe/Golden_Pickaxe.png" },
    { name: "Алмазная кирка", damage: 50, price: 2000, image: "pickaxe/Diamond_Pickaxe.png" },
    { name: "Незер кирка", damage: 150, price: 10000, image: "pickaxe/Netherite_pickaxe.png" },
    { name: "Энд кирка", damage: 300, price: 20000, image: "pickaxe/End_Pickaxe.png" }
];

const shopContainer = document.getElementById("shop");

// Индекс кирки, которую игрок должен купить следующей
let currentShopIndex = 0; 
// Массив для хранения ссылок на элементы магазина, чтобы легко их обновлять
const shopDomElements = []; 

upgrades.forEach((upgrade, index) => {
    const item = document.createElement("div");
    item.className = "shop-item";

    const img = document.createElement("img");
    img.src = upgrade.image;

    const name = document.createElement("span");
    name.innerHTML = `
    <div class="shop-name">${upgrade.name}</div>
    <div class="shop-price">
        ${upgrade.price}
        <img src="emerald.png" class="shop-emerald" alt="">
    </div>
    `;

    const button = document.createElement("button");

    const status = document.createElement("span");
    status.className = "status";

    // Звук клика по кнопке
    button.addEventListener("click", () => {
        playSound(sounds.click);
    });

    // Логика покупки
    button.onclick = () => {
        // Покупать можно только если это следующая по очереди кирка и хватает монет
        if (index === currentShopIndex && coins >= upgrade.price) {
            coins -= upgrade.price;
            damage = upgrade.damage;

            customCursor.src = upgrade.image;

            updateCoins();

            playSound(sounds.newTool); 

            // Переходим к следующей кирке в очереди
            currentShopIndex++;
            // Обновляем внешний вид всего магазина
            updateShopUI(); 
        }
    };

    item.appendChild(img);
    item.appendChild(name); 
    item.appendChild(button);
    item.appendChild(status);

    shopContainer.appendChild(item);

    // Сохраняем элементы для функции updateShopUI
    shopDomElements.push({ item, button, index });
});

// Функция, которая настраивает кнопки и прозрачность в зависимости от прогресса
function updateShopUI() {
    shopDomElements.forEach(({ item, button, index }) => {
        if (index < currentShopIndex) {
            // Кирка уже куплена
            item.classList.remove("unavailable");
            button.textContent = "Куплено";
            button.disabled = true; // Отключаем кнопку
        } else if (index === currentShopIndex) {
            // Кирка доступна для покупки прямо сейчас
            item.classList.remove("unavailable");
            button.textContent = "Купить";
            button.disabled = false;
        } else {
            // Кирка пока недоступна (нужно купить предыдущие)
            item.classList.add("unavailable");
            button.textContent = "Недоступно";
            button.disabled = true; // Отключаем кнопку
        }
    });
}

updateShopUI();



// ================= ЗАВДАННЯ =================
let clicks = 0;
let hovers = 0;
let okClicks = 0;
let seconds = 0;

// TASK 1
const task1 = document.getElementById("task1");
task1?.addEventListener("click", () => {
    if (clicks >= 10) return; 

    clicks++;
    const p = document.getElementById("taskProgress1");
    if (p) p.textContent = clicks + " / 10";

    if (clicks === 10) {
        coins += 10;
        updateCoins();
        playSound(sounds.achievement);
        task1.classList.add("done");
    }
});

// TASK 2
const task2 = document.getElementById("task2");
task2?.addEventListener("mouseenter", () => {
    if (hovers < 5) {
        hovers++;
        const p = document.getElementById("taskProgress2");
        if (p) p.textContent = hovers + " / 5";

        if (hovers === 5) {
            coins += 5;
            updateCoins();
            playSound(sounds.achievement);
            task2.classList.add("done");
        }
    }
});

// TASK 3
const task3 = document.getElementById("task3");
const okBtn = document.getElementById("okBtn");

okBtn?.addEventListener("click", () => {
    if (okClicks >= 3) return;

    okClicks++;
    const p = document.getElementById("taskProgress3");
    if (p) p.textContent = okClicks + " / 3";

    if (okClicks === 3) {
        coins += 15;
        updateCoins();
        playSound(sounds.achievement);
        task3?.classList.add("done");
        okBtn.disabled = true; 
    }
});

// TASK 4
const task4 = document.getElementById("task4");
if (task4) {
    const timer = setInterval(() => {
        if (seconds < 10) {
            seconds++;
            const p = document.getElementById("taskProgress4");
            if (p) p.textContent = seconds + " / 10 сек";

            if (seconds === 10) {
                coins += 20;
                updateCoins();
                playSound(sounds.achievement);
                task4.classList.add("done");
                clearInterval(timer);
            }
        }
    }, 1000);
}

// TASK 5
const task5 = document.getElementById("task5");
document.getElementById("taskInput")?.addEventListener("input", (e) => {
    if (e.target.value.toLowerCase() === "emerald") {
        const p = document.getElementById("taskProgress5");
        if (p) p.textContent = "1 / 1";

        coins += 30;
        updateCoins();
        playSound(sounds.achievement);
        task5?.classList.add("done");

        e.target.disabled = true;
    }
});


//тема
const themeBtn = document.getElementById("themeBtn");
let isLight = false; // базовая тема — тёмная
const bgVideo = document.getElementById("bg-video");

// начальная иконка
themeBtn.textContent = "🌙";

// гарантируем, что при старте нет светлой темы
document.body.classList.remove("light");

// фон по умолчанию — тёмный
bgVideo.querySelector("source").src = "BG-dark.mp4";
bgVideo.load();
bgVideo.play();

themeBtn.addEventListener("click", () => {
    isLight = !isLight;
    document.body.classList.toggle("light", isLight);
    themeBtn.textContent = isLight ? "☀️" : "🌙";

    // Меняем фон
    const newSrc = isLight ? "BG-light.mp4" : "BG-dark.mp4";
    bgVideo.querySelector("source").src = newSrc;
    bgVideo.load();
    bgVideo.play();
});



window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    // Небольшая задержка для красивого эффекта
    setTimeout(() => {
        loader.classList.add("hide");

        // Полностью удаляем через время анимации
        setTimeout(() => {
            loader.remove();
        }, 800);

    }, 1500); // 1.5 секунды
});
// =================БОНУСИ(СИГМО) =================

// контейнер для бонусів
const bonusContainer = document.createElement("div");
bonusContainer.id = "bonus-container";
document.body.appendChild(bonusContainer);

// створення бонуса
function spawnBonus() {
    const bonus = document.createElement("img");

    bonus.src = "emerald.png"; 
    bonus.className = "falling-bonus";

    const x = Math.random() * window.innerWidth;
    const duration = 3 + Math.random() * 3;

    bonus.style.left = x + "px";
    bonus.style.animationDuration = duration + "s";

    bonus.addEventListener("click", () => {
        coins += 25;
        updateCoins();
        playSound(sounds.achievement);
        bonus.remove();
    });

    bonusContainer.appendChild(bonus);

    setTimeout(() => {
        bonus.remove();
    }, duration * 1000);
}

// спавн бонусів
setInterval(() => {
    spawnBonus();
}, 7000 + Math.random() * 2000);
// ================= ГЕНИИ СОЗДАВШИЕ ШЕДЕВР =================

const creditsBtn = document.getElementById("creditsBtn");

const creditsContainer = document.createElement("div");
creditsContainer.id = "credits-container";
document.body.appendChild(creditsContainer);
const authors = [
    " Владислав Рідош ",
    " Сергій Дротянко",
    " Моісєєва Ельвіра",
    " Мостовий Олексій ",
    " Кулібаба Тимур "
];

function spawnCredit() {
    const text = document.createElement("div");
    text.className = "credit-name";

    text.textContent = authors[Math.floor(Math.random() * authors.length)];

    const x = Math.random() * window.innerWidth;
    const duration = 3 + Math.random() * 3;

    text.style.left = x + "px";
    text.style.animationDuration = duration + "s";

    creditsContainer.appendChild(text);

    setTimeout(() => text.remove(), duration * 1000);
}

creditsBtn.addEventListener("click", () => {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => spawnCredit(), i * 150);
    }
});
const customCursor = document.getElementById("customCursor");
document.addEventListener("mousemove", (e) => {
    const scale = 1 / 0.8; 

    customCursor.style.left = (e.clientX * scale) + "px";
    customCursor.style.top = (e.clientY * scale) + "px";
});
block.addEventListener("mouseenter", () => {
    customCursor.style.display = "block";
});

block.addEventListener("mouseleave", () => {
    customCursor.style.display = "none";
});
block.addEventListener("mouseenter", () => {
    customCursor.style.display = "block";
    block.style.cursor = "none"; 
});
block.addEventListener("mouseleave", () => {
    customCursor.style.display = "none";
    block.style.cursor = "pointer";
});

