/* ============================================================
   EDUFUN - SISTEM MINI-GAME PETUALANGAN

   PULAU DASAR     : DOMINO PECAHAN (mesin asli adventure-mode.js)
   PULAU MENENGAH  : ARSIR PIZZA SESUAI PECAHAN
   PULAU SULIT     : PENJUMLAHAN PECAHAN DENGAN KOTAK INTERAKTIF

   File ini sengaja memakai JavaScript Vanilla dan tidak membutuhkan
   backend. Progres stage tetap dikelola oleh adventure-mode.js.
============================================================ */

(function () {
    "use strict";

    // Simpan renderer Domino yang didefinisikan adventure-mode.js
    // sebelum renderer utama diarahkan ke sistem mini-game baru.
    const renderDominoAdventureGame = window.renderAdventureGame;

    let gameFinished = false;
    let selectedPizzaSlices = new Set();
    let selectedAdditionCells = new Set();
    let activePizzaMission = null;
    let activeAdditionMission = null;
    let activeDominoMission = null;
    let stageTimerInterval = null;
    let stageTimeRemaining = 0;

    // Batas waktu per stage dalam detik. Waktu dibuat bertahap
    // dan cukup longgar untuk anak SD.
    const STAGE_TIME_LIMITS = {
        dasar: [90, 100, 100, 110, 120],
        menengah: [75, 80, 85, 90, 100],
        lanjutan: [120, 120, 135, 135, 150]
    };

    function getEduFunStageTimeLimit(levelKey, stageNumber) {
        const limits = STAGE_TIME_LIMITS[levelKey];
        if (!limits || !Number.isInteger(Number(stageNumber))) return 0;
        return limits[Number(stageNumber) - 1] || 0;
    }

    window.getEduFunStageTimeLimit = getEduFunStageTimeLimit;

    // ========================================================
    // 1. DATA STAGE PULAU MENENGAH - ARSIR PIZZA
    // ========================================================

    const pizzaMissions = {
        1: {
            title: "Pizza Sepertujuh",
            fraction: "1/7",
            numerator: 1,
            denominator: 7,
            instruction: "Pizza dibagi menjadi 7 potong sama besar. Arsir tepat 1 potong.",
            hint: "Penyebut 7 berarti ada 7 potong seluruhnya. Pembilang 1 berarti arsir 1 potong.",
            explanation: "Penyebut menunjukkan jumlah seluruh potongan pizza, yaitu 7. Pembilang menunjukkan bagian yang diarsir, yaitu 1. Jadi bagian yang diarsir adalah 1/7."
        },
        2: {
            title: "Dua Potong Pizza",
            fraction: "2/8",
            numerator: 2,
            denominator: 8,
            instruction: "Pizza dibagi menjadi 8 potong sama besar. Arsir tepat 2 potong.",
            hint: "Ada 8 potong seluruhnya. Pilih 2 potong untuk menunjukkan 2/8.",
            explanation: "Penyebut 8 menunjukkan jumlah seluruh potongan. Pembilang 2 menunjukkan dua potong yang diarsir. Jadi pecahannya adalah 2/8."
        },
        3: {
            title: "Tiga Potong Pizza",
            fraction: "3/9",
            numerator: 3,
            denominator: 9,
            instruction: "Pizza dibagi menjadi 9 potong sama besar. Arsir tepat 3 potong.",
            hint: "Hitung semua 9 potong, lalu arsir hanya 3 potong.",
            explanation: "Dari 9 potong pizza yang sama besar, 3 potong diarsir. Maka pecahannya adalah 3/9."
        },
        4: {
            title: "Empat Potong Pizza",
            fraction: "4/10",
            numerator: 4,
            denominator: 10,
            instruction: "Pizza dibagi menjadi 10 potong sama besar. Arsir tepat 4 potong.",
            hint: "Penyebut 10 adalah jumlah semua potong. Pembilang 4 adalah jumlah yang harus diarsir.",
            explanation: "Ada 10 potong pizza seluruhnya dan 4 potong diarsir. Jadi pecahan yang ditunjukkan adalah 4/10."
        },
        5: {
            title: "Lima Potong Pizza",
            fraction: "5/12",
            numerator: 5,
            denominator: 12,
            instruction: "Pizza dibagi menjadi 12 potong sama besar. Arsir tepat 5 potong.",
            hint: "Pastikan jumlah seluruh potongan 12, kemudian arsir 5 potong saja.",
            explanation: "Penyebut 12 menunjukkan seluruh potongan pizza. Lima potong yang diarsir menjadi pembilang. Jadi pecahannya adalah 5/12."
        }
    };

    // ========================================================
    // 2. DATA STAGE PULAU SULIT - PENJUMLAHAN PECAHAN
    // ========================================================

    const additionMissions = {
        1: {
            title: "Gabungkan Setengah dan Dua Pertiga",
            first: { numerator: 1, denominator: 2 },
            second: { numerator: 2, denominator: 3 },
            operation: "+",
            instruction: "Selesaikan 1/2 + 2/3. Samakan penyebut, lalu arsir kotak sebanyak hasil penjumlahannya.",
            hint: "KPK dari 2 dan 3 adalah 6. Ubah 1/2 menjadi 3/6 dan 2/3 menjadi 4/6.",
            explanation: "Samakan penyebut menjadi 6. Jadi 1/2 = 3/6 dan 2/3 = 4/6. Jumlahkan pembilang: 3 + 4 = 7. Hasilnya 7/6 atau 1 1/6. Karena penyebutnya 6, setiap satu utuh berisi 6 kotak. Arsir 7 kotak dari 12 kotak yang tersedia."
        },
        2: {
            title: "Penjumlahan Seperempat",
            first: { numerator: 1, denominator: 4 },
            second: { numerator: 2, denominator: 4 },
            operation: "+",
            instruction: "Selesaikan 1/4 + 2/4 dengan mengarsir kotak yang tersedia.",
            hint: "Penyebutnya sama, jadi jumlahkan pembilangnya dan pertahankan penyebut 4.",
            explanation: "Kedua pecahan memiliki penyebut 4. Jumlahkan pembilang: 1 + 2 = 3. Hasilnya 3/4. Arsir 3 dari 4 kotak."
        },
        3: {
            title: "Samakan Penyebut Dahulu",
            first: { numerator: 1, denominator: 3 },
            second: { numerator: 1, denominator: 2 },
            operation: "+",
            instruction: "Selesaikan 1/3 + 1/2. Samakan penyebut sebelum mengarsir hasilnya.",
            hint: "KPK dari 3 dan 2 adalah 6. Ubah 1/3 menjadi 2/6 dan 1/2 menjadi 3/6.",
            explanation: "Samakan penyebut menjadi 6. Jadi 1/3 = 2/6 dan 1/2 = 3/6. Jumlahkan pembilang: 2 + 3 = 5. Hasilnya 5/6. Arsir 5 dari 6 kotak."
        },
        4: {
            title: "Penjumlahan Dua Perlima",
            first: { numerator: 2, denominator: 5 },
            second: { numerator: 1, denominator: 5 },
            operation: "+",
            instruction: "Selesaikan 2/5 + 1/5 dengan mengarsir kotak sesuai hasilnya.",
            hint: "Penyebut kedua pecahan sama, yaitu 5. Jumlahkan 2 dan 1.",
            explanation: "Penyebut tetap 5 karena kedua pecahan memiliki penyebut yang sama. Jumlahkan pembilang: 2 + 1 = 3. Hasilnya 3/5. Arsir 3 dari 5 kotak."
        },
        5: {
            title: "Hasil Lebih dari Satu Utuh",
            first: { numerator: 3, denominator: 4 },
            second: { numerator: 1, denominator: 2 },
            operation: "+",
            instruction: "Selesaikan 3/4 + 1/2. Samakan penyebut, lalu tunjukkan hasilnya pada kotak.",
            hint: "KPK dari 4 dan 2 adalah 4. Ubah 1/2 menjadi 2/4, kemudian jumlahkan.",
            explanation: "Ubah 1/2 menjadi 2/4. Maka 3/4 + 2/4 = 5/4. Hasil 5/4 sama dengan 1 1/4. Karena satu utuh terdiri dari 4 kotak, arsir 5 kotak dari 8 kotak yang tersedia."
        }
    };

    // ========================================================
    // 3. UTILITAS MATEMATIKA
    // ========================================================

    function greatestCommonDivisor(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);

        while (b !== 0) {
            const remainder = a % b;
            a = b;
            b = remainder;
        }

        return a || 1;
    }

    function leastCommonMultiple(a, b) {
        return Math.abs(a * b) / greatestCommonDivisor(a, b);
    }

    function simplifyFraction(numerator, denominator) {
        const divisor = greatestCommonDivisor(numerator, denominator);

        return {
            numerator: numerator / divisor,
            denominator: denominator / divisor
        };
    }

    function formatFraction(numerator, denominator) {
        const simplified = simplifyFraction(numerator, denominator);
        const whole = Math.floor(simplified.numerator / simplified.denominator);
        const remainder = simplified.numerator % simplified.denominator;

        if (remainder === 0) {
            return String(whole);
        }

        if (whole > 0) {
            return whole + " " + remainder + "/" + simplified.denominator;
        }

        return simplified.numerator + "/" + simplified.denominator;
    }

    function prepareAdditionMission(mission) {
        const commonDenominator = leastCommonMultiple(
            mission.first.denominator,
            mission.second.denominator
        );

        const firstEquivalent = mission.first.numerator * (
            commonDenominator / mission.first.denominator
        );

        const secondEquivalent = mission.second.numerator * (
            commonDenominator / mission.second.denominator
        );

        const resultNumerator = firstEquivalent + secondEquivalent;
        const wholeCount = Math.max(
            1,
            Math.ceil(resultNumerator / commonDenominator)
        );

        return {
            commonDenominator: commonDenominator,
            firstEquivalent: firstEquivalent,
            secondEquivalent: secondEquivalent,
            resultNumerator: resultNumerator,
            capacity: wholeCount * commonDenominator,
            resultText: formatFraction(resultNumerator, commonDenominator)
        };
    }

    // ========================================================
    // 4. NAVIGASI DAN TIMER STAGE
    // ========================================================

    function stopStageTimer() {
        if (stageTimerInterval) {
            clearInterval(stageTimerInterval);
            stageTimerInterval = null;
        }
    }

    function formatStageTime(seconds) {
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(safeSeconds / 60);
        const remaining = safeSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(remaining).padStart(2, "0");
    }

    function ensureStageTimerWidget() {
        const top = document.querySelector(".game-card .game-top");
        if (!top) return null;

        let timer = top.querySelector("#efStageTimer");
        if (!timer) {
            const wrapper = document.createElement("span");
            wrapper.className = "ef-stage-timer";
            wrapper.innerHTML = '<span aria-hidden="true">⏱️</span><span class="ef-stage-timer-label">Sisa waktu</span><strong id="efStageTimer">00:00</strong>';
            top.appendChild(wrapper);
            timer = wrapper.querySelector("#efStageTimer");
        }
        return timer;
    }

    function updateStageTimerDisplay() {
        const timer = document.getElementById("efStageTimer");
        if (!timer) return;

        timer.textContent = formatStageTime(stageTimeRemaining);
        const wrapper = timer.closest(".ef-stage-timer");
        if (wrapper) wrapper.classList.toggle("is-urgent", stageTimeRemaining <= 15);
    }

    function showStageTimeout() {
        if (gameFinished) return;

        gameFinished = true;
        if (typeof activeGame !== "undefined" && activeGame) {
            activeGame.done = true;
        }
        stopStageTimer();

        const result = document.getElementById("stageGameResult");
        if (!result) return;

        result.hidden = false;
        result.classList.add("is-timeout");
        result.innerHTML = `
            <div class="ef-timeout-card">
                <div class="ef-timeout-icon">⏰</div>
                <h3>Waktu Habis!</h3>
                <p>Belum berhasil kali ini. Tenang, kamu bisa mencoba stage ini lagi.</p>
                <div class="ef-timeout-actions">
                    <button type="button" class="ef-game-button ef-game-button-primary" data-ef-game-action="retry-stage">↻ Ulangi Stage</button>
                    <button type="button" class="ef-game-button ef-game-button-secondary" data-game-action="back-world">← Pilihan Pulau</button>
                </div>
            </div>
        `;
        setGameFeedback("Waktu sudah habis. Stage belum dihitung selesai dan bintang belum diberikan.", true);
    }

    function startStageTimer() {
        stopStageTimer();
        if (!activeStage) return;

        stageTimeRemaining = getEduFunStageTimeLimit(activeStage.levelKey, activeStage.stageNumber);
        if (!stageTimeRemaining) return;

        ensureStageTimerWidget();
        updateStageTimerDisplay();

        stageTimerInterval = setInterval(function () {
            stageTimeRemaining -= 1;
            updateStageTimerDisplay();

            if (stageTimeRemaining <= 0) {
                showStageTimeout();
            }
        }, 1000);
    }

    function addBackToIslandButton() {
        const top = document.querySelector(".game-card .game-top");
        if (!top) return;

        if (!top.querySelector('[data-game-action="back-world"]')) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ef-back-level-button";
            button.dataset.gameAction = "back-world";
            button.textContent = "← Kembali ke Pilihan Pulau";
            button.setAttribute("aria-label", "Kembali ke pilihan pulau petualangan");
            top.appendChild(button);
        }
        ensureStageTimerWidget();
    }

    // ========================================================
    // 5. KERANGKA MINI-GAME
    // ========================================================

    function renderCustomGameShell(levelLabel, stageNumber, title, instruction, activityHTML, hint) {
        const card = document.querySelector(".game-card");
        if (!card) return;

        card.innerHTML = `
            <div class="game-top ef-game-top">
                <span class="game-badge">${levelLabel} · STAGE ${stageNumber}/5</span>
                <button
                    type="button"
                    class="ef-back-level-button"
                    data-game-action="back-world"
                    aria-label="Kembali ke pilihan pulau petualangan">
                    ← Kembali ke Pilihan Pulau
                </button>
            </div>

            <div class="ef-mini-game">
                <div class="ef-mini-game-heading">
                    <span class="ef-mini-game-kicker">PETUALANGAN PECAHAN</span>
                    <h2>${title}</h2>
                    <p>${instruction}</p>
                </div>

                ${activityHTML}

                <div class="ef-mini-game-hint">
                    <strong>💡 Petunjuk</strong>
                    <p>${hint}</p>
                </div>

                <p id="stageGameFeedback" class="stage-game-feedback" aria-live="polite">
                    Ayo kerjakan tantangannya!
                </p>

                <p id="ef-game-explanation" class="ef-game-explanation" hidden></p>

                <div id="stageGameResult" class="stage-game-result" hidden></div>
            </div>
        `;
    }

    function setGameFeedback(message, isError) {
        const feedback = document.getElementById("stageGameFeedback");
        if (!feedback) return;

        feedback.textContent = message;
        feedback.classList.toggle("error", Boolean(isError));
    }

    function showGameExplanation(message) {
        const explanation = document.getElementById("ef-game-explanation");
        if (!explanation) return;

        explanation.textContent = message;
        explanation.hidden = false;
    }

    // ========================================================
    // 6. PULAU MENENGAH - SVG PIZZA YANG BISA DIARSIR
    // ========================================================

    function getPizzaSlicePath(index, total) {
        const center = 120;
        const radius = 96;
        const startAngle = (-90 + (index * 360 / total)) * Math.PI / 180;
        const endAngle = (-90 + ((index + 1) * 360 / total)) * Math.PI / 180;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

        return [
            "M", center, center,
            "L", x1.toFixed(3), y1.toFixed(3),
            "A", radius, radius, 0, largeArc, 1,
            x2.toFixed(3), y2.toFixed(3),
            "Z"
        ].join(" ");
    }

    function renderPizzaSlices(mission) {
        const paths = [];

        for (let index = 0; index < mission.denominator; index++) {
            const isSelected = selectedPizzaSlices.has(index);

            paths.push(`
                <path
                    d="${getPizzaSlicePath(index, mission.denominator)}"
                    class="ef-pizza-slice ${isSelected ? "is-shaded" : ""}"
                    data-pizza-slice="${index}"
                    role="button"
                    tabindex="0"
                    aria-pressed="${isSelected ? "true" : "false"}"
                    aria-label="Potongan pizza ${index + 1} ${isSelected ? "diarsir" : "belum diarsir"}">
                </path>
            `);
        }

        return `
            <svg class="ef-interactive-pizza" viewBox="0 0 240 240" role="group" aria-label="Pizza dengan ${mission.denominator} potongan yang dapat diarsir">
                <circle cx="120" cy="120" r="103" class="ef-pizza-crust"></circle>
                ${paths.join("")}
                <circle cx="120" cy="120" r="4" class="ef-pizza-center"></circle>
            </svg>
        `;
    }

    function renderPizzaGame(stageNumber) {
        activePizzaMission = pizzaMissions[stageNumber];
        selectedPizzaSlices = new Set();

        if (!activePizzaMission) {
            console.error("Data stage pizza tidak ditemukan:", stageNumber);
            return;
        }

        const mission = activePizzaMission;
        const activityHTML = `
            <section class="ef-activity-card ef-pizza-activity">
                <div class="ef-fraction-prompt">
                    <span>ARSIR PECAHAN INI</span>
                    <strong>${mission.fraction}</strong>
                    <small>${mission.numerator} dari ${mission.denominator} potong</small>
                </div>

                <div class="ef-pizza-layout">
                    <div class="ef-pizza-board" id="efPizzaBoard">
                        ${renderPizzaSlices(mission)}
                    </div>

                    <div class="ef-pizza-side-panel">
                        <div class="ef-selection-counter">
                            <span>Potongan diarsir</span>
                            <strong><span id="ef-pizza-selected">0</span> / ${mission.denominator}</strong>
                        </div>
                        <p>Ketuk setiap potongan pizza untuk memberi atau menghapus arsiran. Semua potongan bisa dipilih.</p>
                        <div class="ef-pizza-legend">
                            <span><i class="ef-legend-empty"></i> Belum diarsir</span>
                            <span><i class="ef-legend-filled"></i> Sudah diarsir</span>
                        </div>
                    </div>
                </div>

                <div class="ef-game-actions">
                    <button type="button" class="ef-game-button ef-game-button-secondary" data-ef-game-action="reset-pizza">↺ Hapus Arsiran</button>
                    <button type="button" class="ef-game-button ef-game-button-primary" data-ef-game-action="check-pizza">✓ Periksa Jawaban</button>
                </div>
            </section>
        `;

        renderCustomGameShell(
            "PULAU MENENGAH · ARSIR PIZZA",
            stageNumber,
            mission.title,
            mission.instruction,
            activityHTML,
            mission.hint
        );
    }

    function updatePizzaCounter() {
        const counter = document.getElementById("ef-pizza-selected");
        if (counter) counter.textContent = String(selectedPizzaSlices.size);

        const board = document.getElementById("efPizzaBoard");
        if (!board) return;

        board.querySelectorAll("[data-pizza-slice]").forEach(function (slice) {
            const index = Number(slice.dataset.pizzaSlice);
            const selected = selectedPizzaSlices.has(index);

            slice.classList.toggle("is-shaded", selected);
            slice.setAttribute("aria-pressed", selected ? "true" : "false");
            slice.setAttribute(
                "aria-label",
                "Potongan pizza " + (index + 1) + (selected ? " diarsir" : " belum diarsir")
            );
        });
    }

    function togglePizzaSlice(sliceElement) {
        if (gameFinished || !activePizzaMission) return;

        const index = Number(sliceElement.dataset.pizzaSlice);
        if (!Number.isInteger(index) || index < 0 || index >= activePizzaMission.denominator) {
            return;
        }

        if (selectedPizzaSlices.has(index)) {
            selectedPizzaSlices.delete(index);
        } else {
            selectedPizzaSlices.add(index);
        }

        updatePizzaCounter();
        setGameFeedback(
            "Kamu mengarsir " + selectedPizzaSlices.size + " dari " + activePizzaMission.denominator + " potong.",
            false
        );
    }

    function checkPizzaAnswer() {
        if (gameFinished || !activePizzaMission) return;

        const selectedCount = selectedPizzaSlices.size;
        const correctCount = activePizzaMission.numerator;

        if (selectedCount !== correctCount) {
            const message = selectedCount < correctCount
                ? "Masih kurang " + (correctCount - selectedCount) + " potong. Tambahkan arsiran lagi!"
                : "Terlalu banyak " + (selectedCount - correctCount) + " potong. Hapus beberapa arsiran!";

            setGameFeedback(message, true);
            return;
        }

        gameFinished = true;
        showGameExplanation(activePizzaMission.explanation);
        setGameFeedback("Tepat sekali! Jumlah potongan yang kamu arsir sudah benar. ⭐", false);
        completeAdventureStage();
    }

    function resetPizzaSelection() {
        if (gameFinished) return;

        selectedPizzaSlices.clear();
        updatePizzaCounter();
        setGameFeedback("Arsiran sudah dihapus. Coba lagi, ya!", false);
    }

    // ========================================================
    // 7. PULAU SULIT - PENJUMLAHAN DENGAN KOTAK INTERAKTIF
    // ========================================================

    function renderAdditionGrid(mission, prepared) {
        const rows = [];

        for (let wholeIndex = 0; wholeIndex < prepared.capacity / prepared.commonDenominator; wholeIndex++) {
            const cells = [];

            for (let cellIndex = 0; cellIndex < prepared.commonDenominator; cellIndex++) {
                const globalIndex = wholeIndex * prepared.commonDenominator + cellIndex;
                const selected = selectedAdditionCells.has(globalIndex);

                cells.push(`
                    <button
                        type="button"
                        class="ef-addition-cell ${selected ? "is-shaded" : ""}"
                        data-addition-cell="${globalIndex}"
                        aria-pressed="${selected ? "true" : "false"}"
                        aria-label="Kotak ${globalIndex + 1} ${selected ? "diarsir" : "belum diarsir"}">
                    </button>
                `);
            }

            rows.push(`
                <div class="ef-addition-whole">
                    <div class="ef-addition-whole-label">
                        ${wholeIndex === 0 ? "Bagian utuh 1" : "Bagian utuh " + (wholeIndex + 1)}
                        <span>${prepared.commonDenominator} kotak</span>
                    </div>
                    <div class="ef-addition-cell-row" style="--ef-denominator:${prepared.commonDenominator}">
                        ${cells.join("")}
                    </div>
                </div>
            `);
        }

        return rows.join("");
    }

    function renderAdditionGame(stageNumber) {
        activeAdditionMission = additionMissions[stageNumber];
        selectedAdditionCells = new Set();

        if (!activeAdditionMission) {
            console.error("Data stage penjumlahan tidak ditemukan:", stageNumber);
            return;
        }

        const mission = activeAdditionMission;
        const prepared = prepareAdditionMission(mission);
        const fractionA = mission.first.numerator + "/" + mission.first.denominator;
        const fractionB = mission.second.numerator + "/" + mission.second.denominator;
        const equivalentA = prepared.firstEquivalent + "/" + prepared.commonDenominator;
        const equivalentB = prepared.secondEquivalent + "/" + prepared.commonDenominator;

        const activityHTML = `
            <section class="ef-activity-card ef-addition-activity">
                <div class="ef-addition-equation">
                    <div class="ef-addition-term">
                        <span>PECahan PERTAMA</span>
                        <strong>${fractionA}</strong>
                        <small>${equivalentA}</small>
                    </div>
                    <b class="ef-addition-plus">+</b>
                    <div class="ef-addition-term">
                        <span>PECAHAN KEDUA</span>
                        <strong>${fractionB}</strong>
                        <small>${equivalentB}</small>
                    </div>
                    <b class="ef-addition-equals">=</b>
                    <div class="ef-addition-term ef-addition-result-term">
                        <span>HASIL</span>
                        <strong>?</strong>
                        <small>Hitung dahulu</small>
                    </div>
                </div>

                <div class="ef-common-denominator-note">
                    Penyebut sudah disamakan menjadi <strong>${prepared.commonDenominator}</strong>.
                    Setiap kotak mewakili <strong>1/${prepared.commonDenominator}</strong>.
                    Hitung hasilnya sendiri, lalu arsir kotak yang sesuai.
                </div>

                <div class="ef-addition-board" id="efAdditionBoard">
                    ${renderAdditionGrid(mission, prepared)}
                </div>

                <div class="ef-selection-counter ef-addition-counter">
                    <span>Kotak yang diarsir</span>
                    <strong><span id="ef-addition-selected">0</span> / ${prepared.capacity}</strong>
                    <small>Jumlah kotak yang tersedia</small>
                </div>

                <div class="ef-game-actions">
                    <button type="button" class="ef-game-button ef-game-button-secondary" data-ef-game-action="reset-addition">↺ Hapus Arsiran</button>
                    <button type="button" class="ef-game-button ef-game-button-primary" data-ef-game-action="check-addition">✓ Periksa Hasil</button>
                </div>
            </section>
        `;

        renderCustomGameShell(
            "PULAU SULIT · PENJUMLAHAN PECAHAN",
            stageNumber,
            mission.title,
            mission.instruction,
            activityHTML,
            mission.hint
        );
    }

    function updateAdditionCounter() {
        const counter = document.getElementById("ef-addition-selected");
        if (counter) counter.textContent = String(selectedAdditionCells.size);

        const board = document.getElementById("efAdditionBoard");
        if (!board) return;

        board.querySelectorAll("[data-addition-cell]").forEach(function (cell) {
            const index = Number(cell.dataset.additionCell);
            const selected = selectedAdditionCells.has(index);

            cell.classList.toggle("is-shaded", selected);
            cell.setAttribute("aria-pressed", selected ? "true" : "false");
            cell.setAttribute(
                "aria-label",
                "Kotak " + (index + 1) + (selected ? " diarsir" : " belum diarsir")
            );
        });
    }

    function toggleAdditionCell(cellElement) {
        if (gameFinished || !activeAdditionMission) return;

        const index = Number(cellElement.dataset.additionCell);
        const prepared = prepareAdditionMission(activeAdditionMission);

        if (!Number.isInteger(index) || index < 0 || index >= prepared.capacity) {
            return;
        }

        if (selectedAdditionCells.has(index)) {
            selectedAdditionCells.delete(index);
        } else {
            selectedAdditionCells.add(index);
        }

        updateAdditionCounter();
        setGameFeedback(
            "Kamu mengarsir " + selectedAdditionCells.size + " kotak. Periksa kembali hasil hitunganmu.",
            false
        );
    }

    function checkAdditionAnswer() {
        if (gameFinished || !activeAdditionMission) return;

        const prepared = prepareAdditionMission(activeAdditionMission);
        const selectedCount = selectedAdditionCells.size;
        const targetCount = prepared.resultNumerator;

        if (selectedCount !== targetCount) {
            const difference = Math.abs(targetCount - selectedCount);
            const message = selectedCount < targetCount
                ? "Masih kurang " + difference + " kotak. Tambahkan arsiran lagi!"
                : "Kelebihan " + difference + " kotak. Hapus beberapa arsiran!";

            setGameFeedback(message, true);
            return;
        }

        gameFinished = true;
        showGameExplanation(activeAdditionMission.explanation);
        setGameFeedback(
            "Hebat! Kamu berhasil membentuk hasil penjumlahannya, yaitu " + prepared.resultText + ". ⭐",
            false
        );
        completeAdventureStage();
    }

    function resetAdditionSelection() {
        if (gameFinished) return;

        selectedAdditionCells.clear();
        updateAdditionCounter();
        setGameFeedback("Semua arsiran dihapus. Silakan coba lagi!", false);
    }

    // ========================================================
    // 8. PULAU MUDAH - DOMINO PECAHAN VISUAL (5 STAGE)
    // Setiap kartu: pecahan angka di kiri dan gambar pecahan di kanan.
    // Pemain menyambungkan gambar kartu terakhir dengan pecahan angka
    // pada kartu berikutnya. Satu kartu pengecoh disediakan per stage.
    // ========================================================

    const dominoMissions = {
        1: {
            title: "Rantai Pecahan Setengah",
            prompt: "Mulai dari kartu pertama. Gambar di sisi kanan menunjukkan 2/4, jadi sambungkan dengan kartu yang angka kirinya tepat 2/4. Lanjutkan sampai lima kartu tersusun.",
            hint: "Hitung semua bagian pada gambar dan bagian yang diarsir. Angka di kiri kartu berikutnya harus sama persis dengan hasil hitungan gambar sebelumnya.",
            explanation: "Hebat! Kamu berhasil menyusun rantai 1/2 → 2/4 → 3/6 → 4/8 → 5/10. Setiap gambar menunjukkan pecahan yang ditulis pada kartu berikutnya.",
            chain: [
                { left: [1, 2], right: [2, 4], shape: "pizza", color: "pizza" },
                { left: [2, 4], right: [3, 6], shape: "watermelon", color: "melon" },
                { left: [3, 6], right: [4, 8], shape: "flower", color: "flower" },
                { left: [4, 8], right: [5, 10], shape: "honeycomb", color: "honey" },
                { left: [5, 10], right: [6, 12], shape: "grid", color: "blue" }
            ],
            decoy: { left: [1, 4], right: [2, 4], shape: "triangle", color: "coral" }
        },
        2: {
            title: "Rantai Pecahan Sepertiga",
            prompt: "Susun lima kartu dengan memperhatikan gambar yang beragam. Cocokkan jumlah bagian yang diarsir dengan angka di sisi kiri kartu berikutnya.",
            hint: "Contohnya, gambar 2 dari 6 bagian harus disambungkan ke kartu yang memiliki angka 2/6 di sebelah kiri.",
            explanation: "Bagus! Kamu memahami bahwa angka pada kartu berikutnya diperoleh dengan membaca jumlah bagian yang diarsir dan jumlah seluruh bagian pada gambar sebelumnya.",
            chain: [
                { left: [1, 3], right: [2, 6], shape: "flower", color: "flower" },
                { left: [2, 6], right: [3, 9], shape: "watermelon", color: "melon" },
                { left: [3, 9], right: [4, 12], shape: "honeycomb", color: "honey" },
                { left: [4, 12], right: [5, 15], shape: "grid", color: "blue" },
                { left: [5, 15], right: [6, 18], shape: "pizza", color: "pizza" }
            ],
            decoy: { left: [2, 9], right: [1, 3], shape: "triangle", color: "coral" }
        },
        3: {
            title: "Rantai Pecahan Seperempat",
            prompt: "Lanjutkan rantai pecahan seperempat. Perhatikan bahwa jumlah potongan gambar bisa berubah, tetapi angka pada kartu berikutnya harus mengikuti gambar sebelumnya.",
            hint: "Jika gambar memperlihatkan 3 bagian diarsir dari 12 bagian, cari kartu dengan angka 3/12 di sebelah kiri.",
            explanation: "Luar biasa! Kamu berhasil membaca pecahan dari berbagai gambar, lalu menghubungkannya dengan notasi angka yang tepat.",
            chain: [
                { left: [1, 4], right: [2, 8], shape: "triangle", color: "honey" },
                { left: [2, 8], right: [3, 12], shape: "pizza", color: "pizza" },
                { left: [3, 12], right: [4, 16], shape: "watermelon", color: "melon" },
                { left: [4, 16], right: [5, 20], shape: "grid", color: "blue" },
                { left: [5, 20], right: [6, 24], shape: "honeycomb", color: "honey" }
            ],
            decoy: { left: [3, 16], right: [1, 4], shape: "flower", color: "coral" }
        },
        4: {
            title: "Rantai Pecahan Dua Pertiga",
            prompt: "Tantangan berikutnya menggunakan pecahan yang lebih besar. Sambungkan setiap gambar ke kartu dengan angka yang sama persis.",
            hint: "Jangan hanya melihat bentuk gambarnya. Hitung pembilang dari bagian yang diarsir dan penyebut dari seluruh bagian.",
            explanation: "Hebat! Kamu dapat mengikuti rantai pecahan dengan berbagai ilustrasi dan jumlah bagian yang semakin banyak.",
            chain: [
                { left: [2, 3], right: [4, 6], shape: "honeycomb", color: "honey" },
                { left: [4, 6], right: [6, 9], shape: "flower", color: "flower" },
                { left: [6, 9], right: [8, 12], shape: "watermelon", color: "melon" },
                { left: [8, 12], right: [10, 15], shape: "grid", color: "blue" },
                { left: [10, 15], right: [12, 18], shape: "pizza", color: "pizza" }
            ],
            decoy: { left: [3, 9], right: [2, 3], shape: "triangle", color: "coral" }
        },
        5: {
            title: "Misi Domino Pecahan Master",
            prompt: "Selesaikan rantai terakhir! Perhatikan ilustrasi pizza, semangka, bentuk segitiga, dan pola lainnya. Setiap gambar menentukan angka pada kartu berikutnya.",
            hint: "Hitung banyak bagian berwarna dan jumlah seluruh bagian. Cocokkan kedua angka itu secara tepat dengan kartu berikutnya.",
            explanation: "Selamat! Kamu menuntaskan lima stage Domino Pecahan. Kamu sudah bisa membaca pecahan dari angka maupun berbagai bentuk gambar.",
            chain: [
                { left: [3, 5], right: [6, 10], shape: "watermelon", color: "melon" },
                { left: [6, 10], right: [9, 15], shape: "honeycomb", color: "honey" },
                { left: [9, 15], right: [12, 20], shape: "grid", color: "blue" },
                { left: [12, 20], right: [15, 25], shape: "triangle", color: "coral" },
                { left: [15, 25], right: [18, 30], shape: "pizza", color: "pizza" }
            ],
            decoy: { left: [4, 25], right: [3, 5], shape: "flower", color: "flower" }
        }
    };

    // Dalam domino berantai, notasi pada sisi kiri harus sama persis
    // dengan jumlah arsiran/seluruh bagian pada gambar kartu sebelumnya.
    // Contoh: gambar 2 dari 4 wajib disambungkan ke angka 2/4,
    // bukan sekadar pecahan lain yang nilainya setara seperti 1/2.
    function fractionsMatchExactly(a, b) {
        return Number(a[0]) === Number(b[0]) && Number(a[1]) === Number(b[1]);
    }

    function fractionText(pair) {
        return `<span>${pair[0]}</span><i></i><span>${pair[1]}</span>`;
    }

    function makePieWedgePath(cx, cy, radius, startAngle, endAngle) {
        const toPoint = (angle) => {
            const radians = angle * Math.PI / 180;
            return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
        };
        const start = toPoint(startAngle);
        const end = toPoint(endAngle);
        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${start[0].toFixed(2)} ${start[1].toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end[0].toFixed(2)} ${end[1].toFixed(2)} Z`;
    }

    function renderDominoFractionArt(pair, shape, color, cardKey) {
        const numerator = Number(pair[0]);
        const denominator = Number(pair[1]);
        const themes = {
            pizza: { selected: "#F5A623", idle: "#FFF0CC", stroke: "#A65E23" },
            melon: { selected: "#F05D68", idle: "#FFF9F0", stroke: "#19885A" },
            flower: { selected: "#EC6BB5", idle: "#FCE7F3", stroke: "#9D397B" },
            honey: { selected: "#F4C928", idle: "#FFF8CF", stroke: "#92711A" },
            blue: { selected: "#49A7E8", idle: "#E8F5FF", stroke: "#347DB4" },
            coral: { selected: "#FB846E", idle: "#FFE9E2", stroke: "#B94F47" }
        };
        const palette = themes[color] || themes.pizza;
        const safeId = `domino-art-${cardKey}-${shape}`;

        if (shape === "grid") {
            const cols = Math.ceil(Math.sqrt(denominator));
            const rows = Math.ceil(denominator / cols);
            const cellW = 92 / cols;
            const cellH = 66 / rows;
            let cells = "";
            for (let i = 0; i < denominator; i++) {
                const x = 4 + (i % cols) * cellW;
                const y = 7 + Math.floor(i / cols) * cellH;
                cells += `<rect x="${(x + 1).toFixed(1)}" y="${(y + 1).toFixed(1)}" width="${(cellW - 2).toFixed(1)}" height="${(cellH - 2).toFixed(1)}" rx="3" fill="${i < numerator ? palette.selected : palette.idle}" stroke="${palette.stroke}" stroke-width="1.2"/>`;
            }
            return `<svg class="ef-domino-art" viewBox="0 0 100 80" role="img" aria-label="Ilustrasi ${numerator} dari ${denominator} bagian diarsir"><title>${numerator} dari ${denominator} bagian diarsir</title>${cells}</svg>`;
        }

        if (shape === "honeycomb") {
            const cols = Math.ceil(Math.sqrt(denominator));
            const rows = Math.ceil(denominator / cols);
            const cellW = 88 / cols;
            const cellH = 66 / rows;
            const radius = Math.max(3.2, Math.min(cellW, cellH) * 0.46);
            let cells = "";
            for (let i = 0; i < denominator; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const cx = 6 + cellW * (col + 0.5) + (row % 2) * Math.min(2, cellW * 0.08);
                const cy = 7 + cellH * (row + 0.5);
                const points = Array.from({ length: 6 }, (_, p) => {
                    const a = (60 * p - 30) * Math.PI / 180;
                    return `${(cx + radius * Math.cos(a)).toFixed(1)},${(cy + radius * Math.sin(a)).toFixed(1)}`;
                }).join(" ");
                cells += `<polygon points="${points}" fill="${i < numerator ? palette.selected : palette.idle}" stroke="${palette.stroke}" stroke-width="1.2"/>`;
            }
            return `<svg class="ef-domino-art" viewBox="0 0 100 80" role="img" aria-label="Ilustrasi ${numerator} dari ${denominator} bagian diarsir"><title>${numerator} dari ${denominator} bagian diarsir</title>${cells}</svg>`;
        }

        if (shape === "triangle") {
            const divisions = Math.round(Math.sqrt(denominator));
            if (divisions * divisions === denominator && divisions >= 2) {
                const point = (i, j) => [10 + i * (90 / divisions) + j * (45 / divisions), 78 - j * (76 / divisions)];
                let parts = "";
                let partIndex = 0;
                const polygon = (points, index) => {
                    const coords = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
                    return `<polygon points="${coords}" fill="${index < numerator ? palette.selected : palette.idle}" stroke="${palette.stroke}" stroke-width="1.3" stroke-linejoin="round"/>`;
                };
                // Segitiga kecil menghadap ke atas.
                for (let j = 0; j < divisions; j++) {
                    for (let i = 0; i < divisions - j; i++) {
                        parts += polygon([point(i, j), point(i + 1, j), point(i, j + 1)], partIndex++);
                    }
                }
                // Segitiga kecil terbalik yang mengisi celah antarbagian.
                for (let j = 0; j < divisions - 1; j++) {
                    for (let i = 0; i < divisions - 1 - j; i++) {
                        parts += polygon([point(i + 1, j), point(i + 1, j + 1), point(i, j + 1)], partIndex++);
                    }
                }
                return `<svg class="ef-domino-art" viewBox="0 0 110 88" role="img" aria-label="Ilustrasi segitiga ${numerator} dari ${denominator} bagian diarsir"><title>${numerator} dari ${denominator} bagian diarsir</title>${parts}</svg>`;
            }
            // Jika penyebut bukan bilangan kuadrat, gunakan kotak agar setiap
            // unit tetap merupakan bagian yang sama besar dan mudah dihitung.
            shape = "grid";
        }

        if (shape === "flower") {
            const cx = 50;
            const cy = 42;
            const petalRadius = 21;
            let petals = "";
            for (let i = 0; i < denominator; i++) {
                const angle = (360 / denominator) * i - 90;
                const rad = angle * Math.PI / 180;
                const px = cx + Math.cos(rad) * petalRadius;
                const py = cy + Math.sin(rad) * petalRadius;
                petals += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="8" ry="17" transform="rotate(${angle} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${i < numerator ? palette.selected : palette.idle}" stroke="${palette.stroke}" stroke-width="1.2"/>`;
            }
            return `<svg class="ef-domino-art" viewBox="0 0 100 88" role="img" aria-label="Ilustrasi bunga ${numerator} dari ${denominator} kelopak diarsir"><title>${numerator} dari ${denominator} kelopak diarsir</title>${petals}<circle cx="50" cy="42" r="7" fill="#FFD45B" stroke="#B57A20" stroke-width="1.5"/></svg>`;
        }

        // Pizza dan semangka memakai lingkaran yang dibagi menjadi irisan sama besar.
        let wedges = "";
        for (let i = 0; i < denominator; i++) {
            const start = -90 + (360 / denominator) * i;
            const end = -90 + (360 / denominator) * (i + 1);
            wedges += `<path d="${makePieWedgePath(50, 42, 34, start, end)}" fill="${i < numerator ? palette.selected : palette.idle}" stroke="#FFFFFF" stroke-width="1.8"/>`;
        }
        const outer = shape === "watermelon"
            ? `<circle cx="50" cy="42" r="37" fill="none" stroke="#27945E" stroke-width="6"/><circle cx="50" cy="42" r="33" fill="none" stroke="#A7E47D" stroke-width="1.8"/>`
            : `<circle cx="50" cy="42" r="35.5" fill="none" stroke="${palette.stroke}" stroke-width="2.4"/>`;
        let toppings = "";
        if (shape === "pizza") {
            const dots = [[39, 31], [58, 28], [31, 49], [57, 54], [45, 61]];
            toppings = dots.slice(0, Math.min(5, numerator * 2)).map(([x, y], i) =>
                `<circle cx="${x}" cy="${y}" r="2.4" fill="${i % 2 ? "#D84A4A" : "#4D9C58"}"/>`
            ).join("");
        } else if (shape === "watermelon") {
            const seeds = [[39, 30], [56, 33], [33, 48], [53, 51], [43, 58]];
            toppings = seeds.slice(0, Math.min(5, numerator * 2)).map(([x, y]) =>
                `<ellipse cx="${x}" cy="${y}" rx="1.2" ry="2.4" fill="#25364B"/>`
            ).join("");
        }
        return `<svg class="ef-domino-art" viewBox="0 0 100 84" role="img" aria-label="Ilustrasi ${numerator} dari ${denominator} bagian diarsir"><title>${numerator} dari ${denominator} bagian diarsir</title>${wedges}${outer}${toppings}</svg>`;
    }

    function renderDominoTile(card, index, used, isStart) {
        const leftLabel = `${card.left[0]}/${card.left[1]}`;
        const rightLabel = `${card.right[0]} dari ${card.right[1]} bagian diarsir; kartu berikutnya harus memiliki angka ${card.right[0]}/${card.right[1]}`;
        return `
            <button type="button"
                class="ef-domino-card${used ? " is-used" : ""}${isStart ? " is-start" : ""}"
                data-domino-card="${index}"
                draggable="${!used && !isStart ? "true" : "false"}"
                ${used ? "disabled" : ""}
                aria-label="Kartu ${leftLabel} dan gambar ${rightLabel}">
                <span class="ef-domino-number" aria-label="${leftLabel}">${fractionText(card.left)}</span>
                <span class="ef-domino-divider"></span>
                <span class="ef-domino-picture">${renderDominoFractionArt(card.right, card.shape, card.color, index)}</span>
                ${isStart ? '<span class="ef-domino-start-label">MULAI</span>' : ""}
            </button>
        `;
    }

    function shuffleArray(items) {
        const copy = items.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function renderDominoGame(stageNumber) {
        const stage = Number(stageNumber);
        const mission = dominoMissions[stage];
        const gameCard = document.querySelector(".game-card");
        if (!mission || !gameCard) return;

        gameFinished = false;
        activeDominoMission = {
            stageNumber: stage,
            mission,
            cards: mission.chain.concat([mission.decoy]),
            placed: [0],
            rackOrder: shuffleArray([1, 2, 3, 4, 5])
        };

        const challenge = adventureLevels.dasar.stages[stage - 1];
        activeGame = {
            levelKey: "dasar",
            stageNumber: stage,
            challenge,
            placed: [0],
            done: false
        };

        const startCard = activeDominoMission.cards[0];
        gameCard.innerHTML = `
            <div class="game-top">
                <span class="game-badge">DOMINO PECAHAN · STAGE ${stage}/5</span>
                <span class="muted" id="gameScore">Rantai tersambung: 1/5 kartu</span>
            </div>
            <div class="game-content">
                <div class="stage-game ef-domino-game">
                    <div class="stage-game-topline">
                        <button type="button" class="game-back-button" data-game-action="back-stages">← Kembali ke Peta Stage</button>
                        <span class="home-eyebrow">🏝️ PULAU MUDAH · DOMINO PECAHAN</span>
                    </div>
                    <div class="stage-game-title ef-domino-title">
                        <p class="eyebrow">STAGE ${stage} · MISI DOMINO</p>
                        <h2>${mission.title}</h2>
                        <p>${mission.prompt}</p>
                    </div>
                    <section class="ef-domino-playmat" aria-label="Meja sambung kartu domino">
                        <div class="ef-domino-playmat-heading">
                            <div><span class="ef-domino-kicker">RANTAI DOMINO</span><h3>Hubungkan kartu yang cocok!</h3></div>
                            <span class="ef-domino-progress" id="efDominoProgress">1 / 5</span>
                        </div>
                        <p class="ef-domino-instruction">Jumlah bagian yang diarsir/seluruh bagian pada gambar harus sama persis dengan angka pecahan di sisi kiri kartu berikutnya.</p>
                        <div class="ef-domino-chain" id="efDominoChain">
                            ${renderDominoTile(startCard, 0, true, true)}
                            <span class="ef-domino-connector" aria-hidden="true">➜</span>
                            <div class="ef-domino-open-slot"><span>🧩</span><small>Kartu berikutnya</small></div>
                        </div>
                    </section>
                    <section class="ef-domino-rack" aria-label="Kartu domino yang tersedia">
                        <div class="ef-domino-rack-heading"><h3>🃏 Pilih kartu yang sesuai</h3><span>Ketuk kartu atau seret ke rantai domino</span></div>
                        <div class="ef-domino-rack-list" id="efDominoRack">
                            ${activeDominoMission.rackOrder.map((index) => renderDominoTile(activeDominoMission.cards[index], index, false, false)).join("")}
                        </div>
                    </section>
                    <p id="stageGameFeedback" class="stage-game-feedback" aria-live="polite">Mulai dari kartu pertama. Contoh: gambar 2 dari 4 bagian harus disambungkan ke kartu yang angka kirinya 2/4.</p>
                    <div class="ef-domino-hint"><span>💡</span><div><strong>Petunjuk</strong><p>${mission.hint}</p></div></div>
                    <div id="stageGameResult" class="stage-game-result" hidden></div>
                </div>
            </div>
        `;
        addBackToIslandButton();
    }

    function handleDominoCardSelection(button) {
        if (!activeDominoMission || gameFinished || !activeGame || activeGame.done) return;
        const selectedId = Number(button.dataset.dominoCard);
        const state = activeDominoMission;
        const expectedId = state.placed.length;
        const expectedCard = state.cards[expectedId];
        const selectedCard = state.cards[selectedId];
        if (!selectedCard || !expectedCard || state.placed.includes(selectedId)) return;

        // Cocokkan gambar di kanan kartu terakhir dengan angka di kiri kartu pilihan.
        const lastCard = state.cards[state.placed[state.placed.length - 1]];
        if (!fractionsMatchExactly(lastCard.right, selectedCard.left)) {
            setAdventureFeedback("Belum cocok! Jika gambar menunjukkan 2 dari 4 bagian, kartu berikutnya harus bertuliskan 2/4 di sebelah kiri.", true);
            button.classList.add("is-wrong");
            window.setTimeout(() => button.classList.remove("is-wrong"), 550);
            return;
        }

        // ID menjaga urutan rantai yang sudah disusun setelah notasi pecahan
        // pada kartu benar-benar cocok dengan gambar sebelumnya.
        if (selectedId !== expectedId) {
            setAdventureFeedback("Pecahannya cocok, tetapi susun kartu sesuai urutan rantai yang sedang dibangun.", true);
            button.classList.add("is-wrong");
            window.setTimeout(() => button.classList.remove("is-wrong"), 550);
            return;
        }

        state.placed.push(selectedId);
        button.remove();
        const chain = document.getElementById("efDominoChain");
        const progress = document.getElementById("efDominoProgress");
        const score = document.getElementById("gameScore");
        if (chain) {
            const oldSlot = chain.querySelector(".ef-domino-open-slot");
            if (oldSlot) oldSlot.remove();
            const wrapper = document.createElement("div");
            wrapper.innerHTML = renderDominoTile(selectedCard, selectedId, true, false);
            const tile = wrapper.firstElementChild;
            tile.classList.add("is-connected");
            chain.appendChild(tile);
            if (state.placed.length < state.mission.chain.length) {
                const next = document.createElement("span");
                next.className = "ef-domino-connector";
                next.setAttribute("aria-hidden", "true");
                next.textContent = "➜";
                chain.appendChild(next);
                const slot = document.createElement("div");
                slot.className = "ef-domino-open-slot";
                slot.innerHTML = '<span>🧩</span><small>Kartu berikutnya</small>';
                chain.appendChild(slot);
            }
        }
        if (progress) progress.textContent = `${state.placed.length} / ${state.mission.chain.length}`;
        if (score) score.textContent = `Rantai tersambung: ${state.placed.length}/5 kartu`;
        setAdventureFeedback("Tepat! Angka di kiri sama persis dengan pecahan pada gambar sebelumnya. Lanjutkan rantainya! ⭐", false);

        if (state.placed.length === state.mission.chain.length) {
            gameFinished = true;
            const hint = document.querySelector(".ef-domino-hint");
            if (hint) {
                hint.innerHTML = `<span>🏆</span><div><strong>Rantai domino lengkap!</strong><p>${state.mission.explanation}</p></div>`;
            }
            completeAdventureStage();
        }
    }

    // ========================================================
    // 9. RENDER ROUTER - PILIH MINI-GAME SESUAI PULAU
    // ========================================================

    function renderAdventureGameOverride() {
        if (!activeStage) return;

        stopStageTimer();
        gameFinished = false;
        activeGame = {
            levelKey: activeStage.levelKey,
            stageNumber: activeStage.stageNumber,
            challenge: (typeof adventureLevels !== "undefined" && adventureLevels[activeStage.levelKey])
                ? adventureLevels[activeStage.levelKey].stages[activeStage.stageNumber - 1]
                : null,
            placed: [],
            done: false
        };
        selectedPizzaSlices = new Set();
        selectedAdditionCells = new Set();
        activePizzaMission = null;
        activeAdditionMission = null;

        // Pulau mudah: Domino Pecahan dua sisi (angka di kiri, gambar di kanan).
        if (activeStage.levelKey === "dasar") {
            renderDominoGame(activeStage.stageNumber);
            ensureStageTimerWidget();
            startStageTimer();
            return;
        }

        // Pulau menengah: pemain mengarsir sejumlah potongan pizza.
        if (activeStage.levelKey === "menengah") {
            renderPizzaGame(activeStage.stageNumber);
            ensureStageTimerWidget();
            startStageTimer();
            return;
        }

        // Pulau sulit: pemain mengarsir kotak untuk membentuk hasil penjumlahan.
        if (activeStage.levelKey === "lanjutan") {
            renderAdditionGame(activeStage.stageNumber);
            ensureStageTimerWidget();
            startStageTimer();
            return;
        }

        console.warn("Level petualangan tidak dikenal:", activeStage.levelKey);
    }

    // ========================================================
    // 9. EVENT INTERAKSI SEMUA MINI-GAME
    // ========================================================

    // Drag-and-drop untuk desktop; klik/ketuk tetap tersedia untuk layar sentuh.
    document.addEventListener("dragstart", function (event) {
        const card = event.target && event.target.closest
            ? event.target.closest(".ef-domino-rack [data-domino-card]:not(:disabled)")
            : null;
        if (!card || !activeDominoMission || gameFinished) return;
        if (event.dataTransfer) {
            event.dataTransfer.setData("text/plain", card.dataset.dominoCard);
            event.dataTransfer.effectAllowed = "move";
        }
    });

    document.addEventListener("dragover", function (event) {
        const playmat = event.target && event.target.closest
            ? event.target.closest(".ef-domino-playmat")
            : null;
        if (!playmat || !activeDominoMission || gameFinished) return;
        event.preventDefault();
        playmat.classList.add("is-drop-ready");
    });

    document.addEventListener("drop", function (event) {
        const playmat = event.target && event.target.closest
            ? event.target.closest(".ef-domino-playmat")
            : null;
        if (!playmat || !activeDominoMission || gameFinished) return;
        event.preventDefault();
        playmat.classList.remove("is-drop-ready");
        const selectedId = Number(event.dataTransfer ? event.dataTransfer.getData("text/plain") : NaN);
        const card = document.querySelector(`.ef-domino-rack [data-domino-card="${selectedId}"]`);
        if (card) handleDominoCardSelection(card);
    });

    document.addEventListener("dragleave", function (event) {
        const playmat = event.target && event.target.closest
            ? event.target.closest(".ef-domino-playmat")
            : null;
        if (playmat && !playmat.contains(event.relatedTarget)) {
            playmat.classList.remove("is-drop-ready");
        }
    });

    document.addEventListener("click", function (event) {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;

        const dominoCard = target.closest("[data-domino-card]");
        if (dominoCard) {
            handleDominoCardSelection(dominoCard);
            return;
        }

        const pizzaSlice = target.closest("[data-pizza-slice]");
        if (pizzaSlice) {
            togglePizzaSlice(pizzaSlice);
            return;
        }

        const additionCell = target.closest("[data-addition-cell]");
        if (additionCell) {
            toggleAdditionCell(additionCell);
            return;
        }

        const actionButton = target.closest("[data-ef-game-action]");
        if (!actionButton) return;

        const action = actionButton.dataset.efGameAction;

        if (action === "check-pizza") checkPizzaAnswer();
        if (action === "reset-pizza") resetPizzaSelection();
        if (action === "check-addition") checkAdditionAnswer();
        if (action === "reset-addition") resetAdditionSelection();
        if (action === "retry-stage") renderAdventureGameOverride();
    });

    // Mendukung penggunaan keyboard pada potongan pizza SVG.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;

        const target = event.target;
        if (!target || typeof target.closest !== "function") return;

        const pizzaSlice = target.closest("[data-pizza-slice]");
        if (!pizzaSlice) return;

        event.preventDefault();
        togglePizzaSlice(pizzaSlice);
    });

    // ========================================================
    // 10. HENTIKAN STATE MINI-GAME SAAT KELUAR / PINDAH HALAMAN
    // ========================================================

    function stopAllGames() {
        gameFinished = true;
        stopStageTimer();
        selectedPizzaSlices.clear();
        selectedAdditionCells.clear();
        activeDominoMission = null;
    }

    document.addEventListener("click", function (event) {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;

        const navigationButton = target.closest('[data-game-action="back-world"], [data-game-action="back-stages"]');
        if (navigationButton) stopAllGames();
    });

    const originalShowPage = window.showPage;
    if (typeof originalShowPage === "function" && !window.__edufunGamePageWrapped) {
        window.showPage = function (page) {
            if (page !== "games") stopAllGames();
            return originalShowPage.apply(this, arguments);
        };
        window.__edufunGamePageWrapped = true;
    }

    // adventure-mode.js memanggil renderer dan penghenti timer melalui fungsi global ini.
    window.stopEduFunStageTimer = stopStageTimer;
    window.renderAdventureGame = renderAdventureGameOverride;

    console.log("EduFun Game System siap: Domino, Arsir Pizza, Penjumlahan Kotak, timer per stage, dan reset petualangan.");
})();
