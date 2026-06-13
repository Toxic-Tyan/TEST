const SAVE_KEY = "minecraft_clicker_save";

//ЗБЕРЕЖЕННЯ
export function saveGame(state) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

// ЗАВАНТАЖЕННЯ
export function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
}

// СКИДАННЯ (опціонально)
export function resetGame() {
    localStorage.removeItem(SAVE_KEY);
}