// =====================================================
// EDUFUN - ADVENTURE MODE
// 3 PULAU | 15 STAGE | 3 MINI-GAME
//
// DASAR     : DOMINO PECAHAN
// MENENGAH  : ARSIR PIZZA
// SULIT     : PENJUMLAHAN PECAHAN DENGAN KOTAK
// =====================================================


// =====================================================
// 1. PERSIAPAN PENYIMPANAN
// =====================================================

if (!state.stageProgress ||
    typeof state.stageProgress !== "object" ||
    Array.isArray(state.stageProgress)
) {
    state.stageProgress = {};
}

let adventureView = "world";
let selectedIsland = null;
let activeStage = null;
let activeGame = null;
let currentDrag = null;


// =====================================================
// 2. DATA TIGA PULAU DAN LIMA STAGE
// =====================================================

const adventureLevels = {

    dasar: {
        title: "Pulau Mudah",
        gameName: "Domino Pecahan",
        icon: "🃏",
        theme: "forest",
        art: ["🃏", "🍕", "🐲"],
        description: "Sambungkan kartu pecahan angka dengan gambar yang nilainya setara melalui lima stage domino.",

        stages: [

            {
                lessonIndex: 0,
                title: "Mengenal Pecahan",
                prompt: "Pizza dibagi menjadi dua bagian sama besar. Satu bagian berwarna. Pilih kartu yang menunjukkan bagian tersebut.",
                scene: "pizza",
                total: 2,
                shaded: 1,
                tokens: ["1/3", "1/2", "2/2", "1/4"],
                answer: "1/2",
                hint: "Satu dari dua bagian sama besar ditulis 1/2."
            },

            {
                lessonIndex: 1,
                title: "Pembilang dan Penyebut",
                prompt: "Ada 3 bagian yang diwarnai dari 4 bagian seluruhnya. Pilih kartu pecahan yang tepat.",
                scene: "fraction",
                display: "3/4",
                visualCaption: "Tiga bagian dipilih dari empat bagian.",
                tokens: ["3/5", "3/4", "4/3", "3/3"],
                answer: "3/4",
                hint: "Angka di atas adalah pembilang. Angka di bawah adalah penyebut."
            },

            {
                lessonIndex: 2,
                title: "Pecahan dengan Gambar",
                prompt: "Perhatikan pizza. Ada 3 potong yang berwarna dari 8 potong sama besar. Seret kartu pecahan yang sesuai.",
                scene: "pizza",
                total: 8,
                shaded: 3,
                tokens: ["3/6", "2/8", "3/8", "5/8"],
                answer: "3/8",
                hint: "Hitung potongan berwarna dan jumlah seluruh potongan pizza."
            },

            {
                lessonIndex: 6,
                title: "Bagian dari Keseluruhan",
                prompt: "Ada 8 permen. Empat permen berwarna merah. Pecahan yang menunjukkan permen merah adalah ...",
                scene: "candy",
                visualCaption: "Empat permen merah dari delapan permen.",
                tokens: ["4/8", "3/8", "4/6", "8/4"],
                answer: "4/8",
                hint: "Pembilang adalah jumlah permen merah. Penyebut adalah semua permen."
            },

            {
                lessonIndex: 7,
                title: "Mengenal Pecahan Satuan",
                prompt: "Pizza dibagi menjadi empat bagian sama besar. Satu bagian dipilih. Kartu mana yang menunjukkan pecahan satuan tersebut?",
                scene: "pizza",
                total: 4,
                shaded: 1,
                tokens: ["1/2", "1/3", "1/4", "2/4"],
                answer: "1/4",
                hint: "Pecahan satuan memiliki pembilang satu."
            }

        ]
    },


    menengah: {
        title: "Pulau Menengah",
        gameName: "Arsir Pizza",
        icon: "🍕",
        theme: "pizza",
        art: ["🍕", "🧀", "⭐"],
        description: "Arsir potongan pizza sesuai pembilang dan penyebut pecahan yang diberikan.",

        stages: [
            {
                lessonIndex: 3,
                title: "Arsir 1 dari 7 Potong",
                prompt: "Pizza dibagi menjadi 7 potong sama besar. Arsir tepat 1 potong.",
                hint: "Penyebut 7 berarti seluruh potongan ada 7. Pembilang 1 berarti arsir 1 potong."
            },
            {
                lessonIndex: 4,
                title: "Arsir 2 dari 8 Potong",
                prompt: "Pizza dibagi menjadi 8 potong sama besar. Arsir tepat 2 potong.",
                hint: "Pilih dua potong dari delapan potong pizza."
            },
            {
                lessonIndex: 8,
                title: "Arsir 3 dari 9 Potong",
                prompt: "Pizza dibagi menjadi 9 potong sama besar. Arsir tepat 3 potong.",
                hint: "Pilih tiga potong dari sembilan potong pizza."
            },
            {
                lessonIndex: 9,
                title: "Arsir 4 dari 10 Potong",
                prompt: "Pizza dibagi menjadi 10 potong sama besar. Arsir tepat 4 potong.",
                hint: "Pilih empat potong dari sepuluh potong pizza."
            },
            {
                lessonIndex: 10,
                title: "Arsir 5 dari 12 Potong",
                prompt: "Pizza dibagi menjadi 12 potong sama besar. Arsir tepat 5 potong.",
                hint: "Pilih lima potong dari dua belas potong pizza."
            }
        ]
    },


    lanjutan: {
        title: "Pulau Sulit",
        gameName: "Arsir Kotak Penjumlahan",
        icon: "➕",
        theme: "addition",
        art: ["🧮", "🟦", "⭐"],
        description: "Selesaikan penjumlahan pecahan dengan mengarsir kotak sesuai hasilnya.",

        stages: [
            {
                lessonIndex: 5,
                title: "Gabungkan 1/2 dan 2/3",
                prompt: "Selesaikan 1/2 + 2/3. Samakan penyebut, lalu arsir kotak sesuai hasilnya.",
                hint: "KPK dari 2 dan 3 adalah 6. Ubah menjadi 3/6 + 4/6."
            },
            {
                lessonIndex: 11,
                title: "Penjumlahan Berpenyebut Sama",
                prompt: "Selesaikan 1/4 + 2/4 dengan mengarsir kotak sesuai hasilnya.",
                hint: "Penyebut tetap 4. Jumlahkan pembilang 1 dan 2."
            },
            {
                lessonIndex: 12,
                title: "Samakan Penyebut Dahulu",
                prompt: "Selesaikan 1/3 + 1/2. Samakan penyebut sebelum mengarsir hasilnya.",
                hint: "KPK dari 3 dan 2 adalah 6. Ubah menjadi 2/6 + 3/6."
            },
            {
                lessonIndex: 13,
                title: "Penjumlahan Dua Perlima",
                prompt: "Selesaikan 2/5 + 1/5 dengan mengarsir kotak sesuai hasilnya.",
                hint: "Penyebut tetap 5. Jumlahkan pembilang 2 dan 1."
            },
            {
                lessonIndex: 14,
                title: "Hasil Lebih dari Satu Utuh",
                prompt: "Selesaikan 3/4 + 1/2. Samakan penyebut, lalu tunjukkan hasilnya pada kotak.",
                hint: "Ubah 1/2 menjadi 2/4. Hasil penjumlahannya lebih dari satu utuh."
            }
        ]
    }

};


// =====================================================
// 3. MENGHITUNG PROGRES
// =====================================================

function isStageCompleted(levelKey, stageNumber) {
    const progress = state.stageProgress[levelKey];

    return !!(
        progress &&
        progress[stageNumber] &&
        progress[stageNumber].completed
    );
}


function getIslandCompletedCount(levelKey) {
    return adventureLevels[levelKey].stages.filter(
        function(stage, index) {
            return isStageCompleted(levelKey, index + 1);
        }
    ).length;
}


function getTotalStageCompleted() {
    return (
        getIslandCompletedCount("dasar") +
        getIslandCompletedCount("menengah") +
        getIslandCompletedCount("lanjutan")
    );
}


function isIslandUnlocked(levelKey) {

    if (levelKey === "dasar") {
        return true;
    }

    if (levelKey === "menengah") {
        return getIslandCompletedCount("dasar") === 5;
    }

    if (levelKey === "lanjutan") {
        return getIslandCompletedCount("menengah") === 5;
    }

    return false;
}


function isStageUnlocked(levelKey, stageNumber) {

    if (!isIslandUnlocked(levelKey)) {
        return false;
    }

    if (stageNumber === 1) {
        return true;
    }

    return isStageCompleted(levelKey, stageNumber - 1);
}


// =====================================================
// 4. UPDATE INFORMASI PETUALANGAN
// =====================================================

function updateAdventureStats() {

    const count = getTotalStageCompleted();

    const progressText = document.getElementById("adventureProgressText");
    const progressFill = document.getElementById("adventureProgressFill");
    const stars = document.getElementById("adventureStars");
    const playerName = document.getElementById("adventurePlayerName");
    const rankElement = document.getElementById("adventureRank");

    if (progressText) {
        progressText.textContent = count + " dari 15 stage selesai";
    }

    if (progressFill) {
        progressFill.style.width = (count / 15 * 100) + "%";
    }

    if (stars) {
        stars.textContent = state.stars;
    }

    if (playerName) {
        playerName.textContent = state.name;
    }

    let rank = "Penjelajah Pemula";

    if (count >= 5) {
        rank = "Petualang Muda";
    }

    if (count >= 10) {
        rank = "Jago Pecahan";
    }

    if (count === 15) {
        rank = "Master Pecahan 🏆";
    }

    if (rankElement) {
        rankElement.textContent = rank;
    }
}
// =====================================================
// 5. RESET PROGRES PETUALANGAN
// =====================================================

function resetAdventureProgress() {
    const completedCount = getTotalStageCompleted();

    if (completedCount === 0) {
        toast("Belum ada progres petualangan yang perlu di-reset.");
        return;
    }

    const confirmed = window.confirm(
        "Reset seluruh progres Adventure Mode?\n\n" +
        "Semua 15 stage akan terkunci kembali dan bintang dari petualangan akan dikurangi. " +
        "Progres materi serta kuis tidak akan dihapus."
    );

    if (!confirmed) return;

    let adventureStars = 0;
    Object.values(state.stageProgress || {}).forEach(function (levelProgress) {
        if (!levelProgress || typeof levelProgress !== "object") return;

        Object.values(levelProgress).forEach(function (stageProgress) {
            if (!stageProgress || !stageProgress.completed) return;
            adventureStars += Number.isFinite(Number(stageProgress.stars))
                ? Number(stageProgress.stars)
                : 3;
        });
    });

    // Hanya kurangi hadiah yang tercatat berasal dari Adventure Mode.
    state.stars = Math.max(0, Number(state.stars || 0) - adventureStars);
    state.gameWins = Math.max(0, Number(state.gameWins || 0) - completedCount);
    state.stageProgress = {};

    selectedIsland = null;
    activeStage = null;
    activeGame = null;
    adventureView = "world";

    const panel = document.querySelector(".adventure-panel");
    const gameCard = document.querySelector(".game-card");
    if (panel) panel.classList.remove("is-hidden");
    if (gameCard) gameCard.classList.remove("is-visible");

    if (typeof window.stopEduFunStageTimer === "function") {
        window.stopEduFunStageTimer();
    }

    save();
    renderNewAdventureMap();
    toast("Petualangan berhasil diulang! Semua stage terkunci kembali. 🔒");
}


// =====================================================
// 6. PETA DUNIA - TIGA PULAU
// =====================================================

function renderAdventureWorld() {
    const map = document.getElementById("adventureMap");

    if (!map) return;

    const keys = ["dasar", "menengah", "lanjutan"];

    let html = '<div class="adventure-world-map">';

    keys.forEach(function(key) {
        const level = adventureLevels[key];
        const unlocked = isIslandUnlocked(key);
        const completed = getIslandCompletedCount(key);
        const finished = completed === 5;

        let artClass = "island-art-forest";
        let levelNumber = "01";

        if (key === "menengah") {
            artClass = "island-art-pizza";
            levelNumber = "02";
        }

        if (key === "lanjutan") {
            artClass = "island-art-addition";
            levelNumber = "03";
        }

        let status = "Selesaikan pulau sebelumnya";

        if (unlocked) {
            status = "Siap dijelajahi";
        }

        if (finished) {
            status = "Pulau selesai!";
        }

        let artItems = "";

        level.art.forEach(function(item) {
            artItems += "<span>" + item + "</span>";
        });

        let lockIcon = "";

        if (!unlocked) {
            lockIcon = '<span class="island-lock">🔒</span>';
        }

        html +=
            '<button type="button" ' +
            'class="adventure-island-card ' +
            (unlocked ? "is-unlocked" : "is-locked") + '" ' +
            'data-island-key="' + key + '">' +

            '<div class="island-art ' + artClass + '">' +
            artItems +
            lockIcon +
            '</div>' +

            '<div class="adventure-island-meta">' +
            '<small>LEVEL ' + levelNumber + '</small>' +
            '<strong>' + level.title + '</strong>' +
            '<span>' + level.gameName + ' · ' +
            level.description + '</span>' +
            '<span>' + status + '</span>' +
            '<span>' + completed + '/5 Stage selesai</span>' +
            '</div>' +

            '</button>';
    });

    html += '</div>';

    const resetToolbar = getTotalStageCompleted() > 0
        ? `
            <div class="adventure-reset-toolbar">
                <div class="adventure-reset-copy">
                    <strong>Ingin memulai petualangan dari awal?</strong>
                    <small>Reset akan mengunci kembali semua stage. Materi dan kuis tetap aman.</small>
                </div>
                <button type="button" class="adventure-reset-button" data-reset-adventure>
                    ↻ Reset Petualangan
                </button>
            </div>
        `
        : "";

    map.innerHTML = resetToolbar + html;

    const title = document.querySelector(".adventure-panel-header h2");
    const desc = document.querySelector(".adventure-panel-header .muted");
    const hint = document.querySelector(".adventure-hint");

    if (title) {
        title.textContent = "Jelajahi Tiga Pulau Ajaib! 🏝️";
    }

    if (desc) {
        desc.textContent =
            "Pilih pulau untuk melihat lima stage dan mini-game di dalamnya.";
    }

    if (hint) {
        hint.textContent =
            "💡 Selesaikan stage secara berurutan. Kumpulkan bintang untuk membuka pulau berikutnya!";
    }
}
// =====================================================
// 6. PETA STAGE - LIMA STAGE SETIAP PULAU
// =====================================================

function renderAdventureStages(levelKey) {

    const map = document.getElementById("adventureMap");

    if (!map) return;

    const level = adventureLevels[levelKey];
    const completed = getIslandCompletedCount(levelKey);

    map.innerHTML = `
        <div class="stage-map-shell">

            <div class="stage-map-header">

                <button
                    type="button"
                    class="stage-map-back"
                    data-back-world>
                    ← Peta Dunia
                </button>

                <div class="stage-map-intro">

                    <h3>${level.icon} ${level.title} · ${level.gameName}</h3>

                    <p>${level.description}</p>

                </div>

                <strong>⭐ ${completed}/5</strong>

            </div>


            <div class="stage-path">

                ${level.stages.map(function(stage, index) {

                    const number = index + 1;
                    const done = isStageCompleted(levelKey, number);
                    const unlocked = isStageUnlocked(levelKey, number);

                    const status = done
                        ? "Selesai"
                        : unlocked
                            ? "Bisa dimainkan"
                            : "Terkunci";

                    const className = done
                        ? "is-completed"
                        : unlocked
                            ? "is-unlocked"
                            : "is-locked";

                    const nodeContent = done
                        ? "✓"
                        : unlocked
                            ? number
                            : "🔒";

                    const timeLimit = typeof window.getEduFunStageTimeLimit === "function"
                        ? window.getEduFunStageTimeLimit(levelKey, number)
                        : 0;
                    const timeLabel = timeLimit > 0
                        ? `<span class="stage-node-time">⏱ ${Math.floor(timeLimit / 60)}:${String(timeLimit % 60).padStart(2, "0")}</span>`
                        : "";

                    return `
                        <div class="stage-node-wrap ${className}">

                            <button
                                type="button"
                                class="stage-node ${className}"
                                data-stage-level="${levelKey}"
                                data-stage-number="${number}">

                                ${nodeContent}

                            </button>

                            <span class="stage-node-label">
                                Stage ${number}<br>
                                ${stage.title}
                            </span>

                            <span class="stage-node-status">
                                ${status}${done ? " ⭐⭐⭐" : ""}
                            </span>
                            ${timeLabel}

                        </div>
                    `;

                }).join("")}

            </div>


            <p class="stage-map-hint">
                🐲 Selesaikan satu stage untuk membuka stage berikutnya.
                Setiap tantangan sesuai dengan materi yang sedang dipelajari.
            </p>

        </div>
    `;

    const title = document.querySelector(".adventure-panel-header h2");
    const desc = document.querySelector(".adventure-panel-header .muted");
    const hint = document.querySelector(".adventure-hint");

    if (title) {
        title.textContent = "Peta Stage " + level.title + " " + level.icon;
    }

    if (desc) {
        desc.textContent =
            "Selesaikan lima tantangan " + level.gameName + ".";
    }

    if (hint) {
        hint.textContent =
            completed + " dari 5 stage sudah selesai di " + level.title + ".";
    }
}


// =====================================================
// 7. RENDER PETA PETUALANGAN
// =====================================================

function renderNewAdventureMap() {

    updateAdventureStats();

    if (adventureView === "game") {
        return;
    }

    const panel = document.querySelector(".adventure-panel");
    const gameCard = document.querySelector(".game-card");

    if (panel) {
        panel.classList.remove("is-hidden");
    }

    if (gameCard) {
        gameCard.classList.remove("is-visible");
    }

    if (selectedIsland) {
        adventureView = "stages";
        renderAdventureStages(selectedIsland);
    } else {
        adventureView = "world";
        renderAdventureWorld();
    }
}


// Hubungkan dengan fungsi renderAdventureMap lama.
window.renderAdventureMap = renderNewAdventureMap;


// =====================================================
// 8. MEMILIH PULAU
// =====================================================

function openAdventureIsland(key) {

    if (!islandUnlockedForMessage(key)) {
        toast("Selesaikan lima stage di pulau sebelumnya dahulu! 🔒");
        return;
    }

    selectedIsland = key;
    activeStage = null;
    activeGame = null;
    adventureView = "stages";

    renderNewAdventureMap();
}


function islandUnlockedForMessage(key) {
    return isIslandUnlocked(key);
}


// =====================================================
// 9. KEMBALI KE PETA DUNIA
// =====================================================

function backToAdventureWorld() {

    selectedIsland = null;
    activeStage = null;
    activeGame = null;
    adventureView = "world";

    renderNewAdventureMap();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// 10. KEMBALI KE PETA STAGE
// =====================================================

function backToAdventureStages() {

    activeStage = null;
    activeGame = null;
    adventureView = "stages";

    renderNewAdventureMap();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// 11. ILUSTRASI MINI-GAME
// =====================================================

function renderAdventureVisual(challenge) {

    if (challenge.scene === "pizza") {

        return createPizzaSVG(
            challenge.total,
            challenge.shaded
        );
    }


    if (challenge.scene === "candy") {

        return `
            <div class="candy-visual">
                <span>🍬</span>
                <span>🍬</span>
                <span>🍬</span>
                <span>🍬</span>
                <span>🍭</span>
                <span>🍭</span>
                <span>🍭</span>
                <span>🍭</span>
            </div>
        `;
    }


    if (
        challenge.scene === "comparison" ||
        challenge.scene === "comparison-pair"
    ) {

        return `
            <div class="fraction-visual-card">

                <strong>${challenge.display}</strong>

                <span>${challenge.visualCaption}</span>

                <span style="font-size:32px">⚖️</span>

            </div>
        `;
    }


    if (challenge.scene === "ordering") {

        return `
            <div class="fraction-visual-card">

                <strong>1/4 · 2/4 · 3/4</strong>

                <span>${challenge.visualCaption}</span>

                <span style="font-size:34px">💎 💎 💎</span>

            </div>
        `;
    }


    if (challenge.scene === "recipe") {

        return `
            <div class="fraction-visual-card">

                <span style="font-size:40px">🥛 🥣 🧁</span>

                <strong>${challenge.display}</strong>

                <span>${challenge.visualCaption}</span>

            </div>
        `;
    }


    return `
        <div class="fraction-visual-card">

            <strong>${challenge.display || "?"}</strong>

            <span>${challenge.visualCaption || "Perhatikan pecahannya"}</span>

        </div>
    `;
}


// =====================================================
// 12. KARTU DRAG AND DROP
// =====================================================

function renderAdventureToken(value) {
    const parts = value.split("/");

    return `
        <button
            type="button"
            class="drag-token domino-token"
            data-drag-value="${value}">

            <span class="domino-half">${parts[0]}</span>
            <span class="domino-divider"></span>
            <span class="domino-half">${parts[1]}</span>

        </button>
    `;
}


// =====================================================
// 13. MEMBUKA STAGE
// =====================================================

function openAdventureStage(levelKey, stageNumber) {

    if (!isStageUnlocked(levelKey, stageNumber)) {
        toast("Selesaikan stage sebelumnya terlebih dahulu! 🔒");
        return;
    }

    selectedIsland = levelKey;

    activeStage = {
        levelKey: levelKey,
        stageNumber: stageNumber
    };

    adventureView = "game";

    const panel = document.querySelector(".adventure-panel");
    const gameCard = document.querySelector(".game-card");

    if (panel) {
        panel.classList.add("is-hidden");
    }

    if (gameCard) {
        gameCard.classList.add("is-visible");
    }

    renderAdventureGame();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// 14. TAMPILKAN MINI-GAME
// =====================================================

function renderAdventureGame() {

    if (!activeStage) return;

    const levelKey = activeStage.levelKey;
    const level = adventureLevels[levelKey];

    const stageNumber = activeStage.stageNumber;
    const challenge = level.stages[stageNumber - 1];

    if (!challenge) return;

    activeGame = {
        levelKey: levelKey,
        stageNumber: stageNumber,
        challenge: challenge,
        placed: [],
        done: false
    };

    const isOrdering = Array.isArray(challenge.order);

    const tokens = challenge.tokens.slice();

    // Acak posisi kartu.
    for (let i = tokens.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        const temp = tokens[i];
        tokens[i] = tokens[j];
        tokens[j] = temp;
    }


    const gameCard = document.querySelector(".game-card");

    if (!gameCard) return;


    const dropArea = isOrdering

        ? `
            <div class="order-slots">

                ${challenge.order.map(function(value, index) {

                    return `
                        <div class="order-slot"
                             data-slot-index="${index}">

                            <span>Urutan ${index + 1}</span>

                            <small>Letakkan kristal</small>

                        </div>
                    `;
                }).join("")}

            </div>
        `

        : `
            <div class="stage-drop-target"
                 data-drop-target="single">

                <span style="font-size:28px">✨</span>

                <strong>Letakkan jawaban di sini</strong>

            </div>
        `;


    const trayTitle = "🁢 Kartu domino yang kamu miliki";
    const boardTitle = "Meja jawaban domino";


    gameCard.innerHTML = `

        <div class="game-top">

            <span class="game-badge">
                ${level.gameName.toUpperCase()} · STAGE ${stageNumber}/5
            </span>

            <span class="muted" id="gameScore">
                Stage selesai: ${getTotalStageCompleted()}/15
            </span>

        </div>


        <div class="game-content">

            <div class="stage-game">


                <!-- HEADER GAME -->
                <div class="stage-game-topline">

                    <button
                        type="button"
                        class="game-back-button"
                        data-game-action="back-stages">

                        ← Kembali ke Peta Stage

                    </button>

                    <span class="home-eyebrow">
                        🐲 ${level.title.toUpperCase()}
                    </span>

                </div>


                <!-- JUDUL DAN PERTANYAAN -->
                <div class="stage-game-title">

                    <p class="eyebrow">

                        STAGE ${stageNumber}
                        ·
                        ${lessons[challenge.lessonIndex][0]}

                    </p>

                    <h2>${challenge.title}</h2>

                    <p>${challenge.prompt}</p>

                </div>


                <!-- PAPAN PERMAINAN -->
                <div class="stage-game-board">

                    <div class="stage-game-visual">

                        ${renderAdventureVisual(challenge)}

                    </div>


                    <!-- AREA JAWABAN -->
                    <div class="stage-game-drop-area">

                        <h3>${boardTitle}</h3>

                        <p>
                            ${
                                isOrdering
                                    ? "Susun dari pecahan terkecil hingga terbesar."
                                    : "Angkat salah satu kartu, lalu seret ke area jawaban."
                            }
                        </p>

                        ${dropArea}


                        <p
                            id="stageGameFeedback"
                            class="stage-game-feedback"
                            aria-live="polite">
                        </p>

                    </div>

                </div>


                <!-- RAK KARTU -->
                <div class="stage-game-tray">

                    <h3>${trayTitle}</h3>

                    <div class="drag-token-list" id="stageDragTokens">

                        ${tokens.map(function(value) {
                            return renderAdventureToken(value);
                        }).join("")}

                    </div>

                </div>


                <!-- PETUNJUK -->
                <div class="stage-game-hint">

                    🐲 Petunjuk: ${challenge.hint}

                </div>


                <!-- HASIL -->
                <div
                    id="stageGameResult"
                    class="stage-game-result"
                    hidden>
                </div>


            </div>

        </div>

    `;
}


// =====================================================
// 15. FEEDBACK
// =====================================================

function setAdventureFeedback(message, isError) {

    const feedback = document.getElementById("stageGameFeedback");

    if (!feedback) return;

    feedback.textContent = message;

    feedback.classList.toggle("error", !!isError);
}


// =====================================================
// 16. SELESAIKAN STAGE
// =====================================================

function completeAdventureStage() {

    if (!activeGame || activeGame.done) return;

    activeGame.done = true;

    if (typeof window.stopEduFunStageTimer === "function") {
        window.stopEduFunStageTimer();
    }

    const levelKey = activeGame.levelKey;
    const stageNumber = activeGame.stageNumber;

    const alreadyCompleted = isStageCompleted(levelKey, stageNumber);


    if (!alreadyCompleted) {

        if (!state.stageProgress[levelKey]) {
            state.stageProgress[levelKey] = {};
        }

        state.stageProgress[levelKey][stageNumber] = {
            completed: true,
            stars: 3,
            date: new Date().toLocaleDateString("id-ID")
        };

        state.stars += 3;
        state.gameWins += 1;

        save();
    }


    // Perbarui statistik setelah fungsi save().
    updateAdventureStats();


    // Matikan seluruh kartu setelah selesai.
    document.querySelectorAll(".drag-token").forEach(function(token) {

        token.disabled = true;
        token.classList.add("is-used");

    });


    // Tampilkan hasil. Buat kontainer cadangan jika renderer game tidak menyediakannya.
    let result = document.getElementById("stageGameResult");

    if (!result) {
        const gameCard = document.querySelector(".game-card");
        if (gameCard) {
            result = document.createElement("div");
            result.id = "stageGameResult";
            result.className = "stage-game-result";
            result.hidden = true;
            gameCard.appendChild(result);
        }
    }

    if (result) {
        result.classList.remove("is-timeout");

        let nextAction = "";

        if (stageNumber < 5) {

            nextAction = `
                <button
                    type="button"
                    class="stage-action-primary"
                    data-game-action="next-stage">

                    Lanjut Stage ${stageNumber + 1} →

                </button>
            `;

        } else {

            nextAction = `
                <button
                    type="button"
                    class="stage-action-primary"
                    data-game-action="back-world">

                    Kembali ke Peta Dunia 🏝️

                </button>
            `;
        }


        result.hidden = false;

        result.innerHTML = `

            <div class="result-stars">
                ⭐⭐⭐
            </div>

            <h3>
                ${
                    alreadyCompleted
                        ? "Stage berhasil kamu ulangi!"
                        : "Hebat! Stage berhasil diselesaikan!"
                }
            </h3>

            <p>
                ${
                    alreadyCompleted
                        ? "Kamu sudah pernah memperoleh hadiah stage ini."
                        : "Kamu mendapatkan 3 bintang dan membuka tantangan berikutnya."
                }
            </p>

            <div class="stage-game-result-actions">

                <button
                    type="button"
                    class="stage-action-secondary"
                    data-game-action="back-stages">

                    Kembali ke Peta Stage

                </button>

                ${nextAction}

            </div>

        `;
    }


    setAdventureFeedback(
        "Benar! Tantangan berhasil diselesaikan. ⭐",
        false
    );
}


// =====================================================
// 17. VALIDASI JAWABAN DRAG AND DROP
// =====================================================

function handleAdventureDrop(value, target) {

    if (!activeGame || activeGame.done || !target) {
        return;
    }

    const challenge = activeGame.challenge;


    // ==============================================
    // MODE MENGURUTKAN KRISTAL
    // ==============================================

    if (Array.isArray(challenge.order)) {

        const slotIndex = Number(target.dataset.slotIndex);

        const expected = challenge.order[slotIndex];

        if (
            expected === undefined ||
            target.classList.contains("is-filled")
        ) {
            return;
        }


        if (value !== expected) {

            setAdventureFeedback(
                "Belum tepat. Bandingkan ukuran pecahannya lagi!",
                true
            );

            return;
        }


        target.classList.remove("is-over");
        target.classList.add("is-filled");

        target.innerHTML = `
            <strong>${value}</strong>
            <span>✓ Benar</span>
        `;


        activeGame.placed.push(value);


        // Nonaktifkan kartu yang sudah diletakkan.
        const tokens = Array.from(
            document.querySelectorAll(".drag-token")
        );

        const selectedToken = tokens.find(function(token) {
            return (
                token.dataset.dragValue === value &&
                !token.disabled
            );
        });

        if (selectedToken) {

            selectedToken.disabled = true;
            selectedToken.classList.add("is-used");

        }


        setAdventureFeedback(
            "Benar! " + value + " berada di urutan yang tepat.",
            false
        );


        // Semua slot telah terisi.
        if (activeGame.placed.length === challenge.order.length) {
            completeAdventureStage();
        }

        return;
    }


    // ==============================================
    // MODE MENCARI SATU JAWABAN
    // ==============================================

    if (target.dataset.dropTarget !== "single") {
        return;
    }

    if (value !== challenge.answer) {

        setAdventureFeedback(
            "Belum tepat. Kartu dikembalikan ke tempatnya. Coba lagi!",
            true
        );

        return;
    }


    target.classList.remove("is-over");
    target.classList.add("is-filled");

    target.innerHTML = `
        <strong>${value}</strong>
        <span>✓ Jawaban benar!</span>
    `;

    completeAdventureStage();
}


// =====================================================
// 18. INTERAKSI PETA
// =====================================================

function setupAdventureMapEvents() {

    const map = document.getElementById("adventureMap");

    if (!map || map.dataset.newAdventureReady === "true") {
        return;
    }

    map.addEventListener("click", function(event) {

        const resetButton = event.target.closest("[data-reset-adventure]");
        if (resetButton) {
            resetAdventureProgress();
            return;
        }

        const backButton = event.target.closest("[data-back-world]");

        if (backButton) {

            backToAdventureWorld();

            return;
        }


        const islandButton = event.target.closest("[data-island-key]");

        if (islandButton) {

            openAdventureIsland(islandButton.dataset.islandKey);

            return;
        }


        const stageButton = event.target.closest("[data-stage-level]");

        if (stageButton) {

            openAdventureStage(
                stageButton.dataset.stageLevel,
                Number(stageButton.dataset.stageNumber)
            );
        }

    });

    map.dataset.newAdventureReady = "true";
}


// =====================================================
// 19. INTERAKSI TOMBOL MINI-GAME
// =====================================================

function setupAdventureGameEvents() {

    const gameCard = document.querySelector(".game-card");

    if (!gameCard || gameCard.dataset.newAdventureReady === "true") {
        return;
    }

    gameCard.addEventListener("click", function(event) {

        const button = event.target.closest("[data-game-action]");

        if (!button) return;

        const action = button.dataset.gameAction;


        if (action === "back-stages") {
            backToAdventureStages();
        }


        if (action === "back-world") {
            backToAdventureWorld();
        }


        if (action === "next-stage" && activeStage) {

            const nextNumber = activeStage.stageNumber + 1;

            openAdventureStage(
                activeStage.levelKey,
                nextNumber
            );
        }

    });

    gameCard.dataset.newAdventureReady = "true";
}


// =====================================================
// 20. SISTEM DRAG AND DROP
// MOUSE DAN LAYAR SENTUH
// =====================================================

function startAdventureDrag(event) {

    const token = event.target.closest(".drag-token");

    if (
        !token ||
        token.disabled ||
        !activeGame ||
        activeGame.done ||
        adventureView !== "game"
    ) {
        return;
    }

    if (
        event.button !== undefined &&
        event.button !== 0
    ) {
        return;
    }

    event.preventDefault();


    const rect = token.getBoundingClientRect();

    const ghost = token.cloneNode(true);

    ghost.classList.add("drag-ghost");

    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";


    document.body.appendChild(ghost);

    token.classList.add("dragging-source");


    currentDrag = {
        token: token,
        ghost: ghost,
        value: token.dataset.dragValue
    };
}


// Mengikuti gerakan pointer.
function moveAdventureDrag(event) {

    if (!currentDrag || !currentDrag.ghost) {
        return;
    }

    const ghost = currentDrag.ghost;

    ghost.style.left =
        (event.clientX - ghost.offsetWidth / 2) + "px";

    ghost.style.top =
        (event.clientY - ghost.offsetHeight / 2) + "px";


    // Bersihkan highlight sebelumnya.
    document.querySelectorAll(
        ".stage-drop-target.is-over, .order-slot.is-over"
    ).forEach(function(item) {

        item.classList.remove("is-over");

    });


    const hovered = document.elementFromPoint(
        event.clientX,
        event.clientY
    );

    const target = hovered
        ? hovered.closest("[data-drop-target], .order-slot")
        : null;


    if (
        target &&
        !target.classList.contains("is-filled")
    ) {
        target.classList.add("is-over");
    }
}


// Menghapus objek drag.
function cleanupAdventureDrag() {

    if (!currentDrag) return;

    if (
        currentDrag.ghost &&
        currentDrag.ghost.parentNode
    ) {
        currentDrag.ghost.remove();
    }

    if (currentDrag.token) {
        currentDrag.token.classList.remove("dragging-source");
    }

    document.querySelectorAll(
        ".stage-drop-target.is-over, .order-slot.is-over"
    ).forEach(function(item) {

        item.classList.remove("is-over");

    });
}


// Saat kartu dilepaskan.
function finishAdventureDrag(event) {

    if (!currentDrag) return;

    const hovered = document.elementFromPoint(
        event.clientX,
        event.clientY
    );

    const target = hovered
        ? hovered.closest("[data-drop-target], .order-slot")
        : null;

    const value = currentDrag.value;

    cleanupAdventureDrag();

    currentDrag = null;


    if (target) {
        handleAdventureDrop(value, target);
    }
}


// Saat drag dibatalkan.
function cancelAdventureDrag() {

    if (!currentDrag) return;

    cleanupAdventureDrag();

    currentDrag = null;
}


// =====================================================
// 21. INISIALISASI EVENT DRAG
// =====================================================

function setupAdventureDragEvents() {

    const gameCard = document.querySelector(".game-card");

    if (!gameCard) return;

    gameCard.addEventListener(
        "pointerdown",
        startAdventureDrag
    );

    document.addEventListener(
        "pointermove",
        moveAdventureDrag
    );

    document.addEventListener(
        "pointerup",
        finishAdventureDrag
    );

    document.addEventListener(
        "pointercancel",
        cancelAdventureDrag
    );
}


// =====================================================
// 22. INISIALISASI ADVENTURE MODE
// =====================================================

setupAdventureMapEvents();

setupAdventureGameEvents();

setupAdventureDragEvents();

renderNewAdventureMap();

console.log("EduFun Adventure Mode berhasil dimuat!");