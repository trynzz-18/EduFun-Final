/* ============================================================
   EDUFUN - AUDIO MANAGER
   Musik orisinal untuk Petualangan, Materi, dan Mini-game.
   Audio dimulai setelah interaksi pertama pengguna agar sesuai
   dengan kebijakan autoplay browser.
============================================================ */
(function () {
    "use strict";

    const SETTINGS_KEY = "edufun-audio-settings-v1";
    const DEFAULTS = {
        musicEnabled: true,
        sfxEnabled: true,
        musicVolume: 80
    };

    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
            return {
                musicEnabled: typeof saved.musicEnabled === "boolean" ? saved.musicEnabled : DEFAULTS.musicEnabled,
                sfxEnabled: typeof saved.sfxEnabled === "boolean" ? saved.sfxEnabled : DEFAULTS.sfxEnabled,
                musicVolume: Number.isFinite(Number(saved.musicVolume))
                    ? Math.max(0, Math.min(100, Number(saved.musicVolume)))
                    : DEFAULTS.musicVolume
            };
        } catch (error) {
            console.warn("Pengaturan audio EduFun tidak dapat dibaca:", error);
            return { ...DEFAULTS };
        }
    }

    const settings = loadSettings();
    const tracks = {
        adventure: createTrack("assets/audio/adventure-theme.mp3"),
        learning: createTrack("assets/audio/learning-theme.mp3"),
        game: createTrack("assets/audio/game-theme.mp3")
    };

    function createTrack(src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0;
        audio.setAttribute("playsinline", "true");
        return audio;
    }

    let hasUserGesture = false;
    let currentScene = "adventure";
    let currentTrack = null;
    let audioContext = null;
    let panelOpen = false;
    const fadeIntervals = new Map();

    const ui = {
        widget: document.getElementById("eduAudioWidget"),
        toggle: document.getElementById("eduAudioToggle"),
        icon: document.getElementById("eduAudioIcon"),
        panel: document.getElementById("eduAudioPanel"),
        mute: document.getElementById("eduAudioMute"),
        status: document.getElementById("eduAudioStatus"),
        musicEnabled: document.getElementById("eduMusicEnabled"),
        musicVolume: document.getElementById("eduMusicVolume"),
        musicVolumeValue: document.getElementById("eduMusicVolumeValue"),
        sfxEnabled: document.getElementById("eduSfxEnabled")
    };

    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn("Pengaturan audio EduFun tidak dapat disimpan:", error);
        }
    }

    function setStatus(message) {
        if (ui.status) ui.status.textContent = message;
    }

    function updateControls() {
        const isAudible = settings.musicEnabled && settings.musicVolume > 0;
        if (ui.icon) ui.icon.textContent = isAudible ? "🔊" : "🔇";
        if (ui.toggle) {
            ui.toggle.classList.toggle("is-muted", !isAudible);
            ui.toggle.setAttribute("aria-label", isAudible ? "Pengaturan suara, musik aktif" : "Pengaturan suara, musik mati");
        }
        if (ui.musicEnabled) ui.musicEnabled.checked = settings.musicEnabled;
        if (ui.sfxEnabled) ui.sfxEnabled.checked = settings.sfxEnabled;
        if (ui.musicVolume) ui.musicVolume.value = String(settings.musicVolume);
        if (ui.musicVolumeValue) ui.musicVolumeValue.textContent = settings.musicVolume + "%";
        if (ui.mute) ui.mute.textContent = settings.musicEnabled || settings.sfxEnabled ? "Matikan semua" : "Aktifkan semua";
    }

    function fadeTrack(track, target, duration, pauseAtEnd) {
        if (!track) return;
        const oldInterval = fadeIntervals.get(track);
        if (oldInterval) clearInterval(oldInterval);

        const start = track.volume;
        const steps = Math.max(1, Math.round(duration / 35));
        let step = 0;
        const interval = setInterval(function () {
            step += 1;
            const progress = Math.min(1, step / steps);
            track.volume = Math.max(0, Math.min(1, start + (target - start) * progress));
            if (progress >= 1) {
                clearInterval(interval);
                fadeIntervals.delete(track);
                if (pauseAtEnd && track !== currentTrack) {
                    track.pause();
                    track.currentTime = 0;
                }
            }
        }, 35);
        fadeIntervals.set(track, interval);
    }

    function playCurrentTrack() {
        if (!hasUserGesture || !settings.musicEnabled || settings.musicVolume <= 0) {
            stopMusic();
            return;
        }
        const nextTrack = tracks[currentScene] || tracks.adventure;
        if (nextTrack === currentTrack && !nextTrack.paused) {
            fadeTrack(nextTrack, settings.musicVolume / 100, 250, false);
            return;
        }

        const previousTrack = currentTrack;
        currentTrack = nextTrack;
        nextTrack.volume = 0;
        const playPromise = nextTrack.play();
        if (playPromise && typeof playPromise.then === "function") {
            playPromise.then(function () {
                fadeTrack(nextTrack, settings.musicVolume / 100, 850, false);
                if (previousTrack && previousTrack !== nextTrack) {
                    fadeTrack(previousTrack, 0, 650, true);
                }
                setStatus("Musik sedang diputar · volume " + settings.musicVolume + "%");
            }).catch(function (error) {
                console.warn("Musik EduFun belum dapat diputar:", error);
                setStatus("Ketuk halaman sekali lagi untuk memulai musik.");
            });
        } else {
            fadeTrack(nextTrack, settings.musicVolume / 100, 850, false);
            if (previousTrack && previousTrack !== nextTrack) fadeTrack(previousTrack, 0, 650, true);
        }
    }

    function stopMusic() {
        Object.values(tracks).forEach(function (track) {
            const interval = fadeIntervals.get(track);
            if (interval) {
                clearInterval(interval);
                fadeIntervals.delete(track);
            }
            track.pause();
            track.volume = 0;
        });
        currentTrack = null;
        setStatus("Musik latar sedang mati.");
    }

    function detectScene() {
        const activePage = document.querySelector(".page.active");
        if (!activePage) return "adventure";
        if (activePage.id === "page-materials" || activePage.id === "page-quiz" ||
            activePage.id === "page-progress" || activePage.id === "page-profile") {
            return "learning";
        }
        if (activePage.id === "page-games") {
            const gameCard = activePage.querySelector(".game-card");
            const gameIsVisible = gameCard && gameCard.getClientRects().length > 0 && gameCard.innerHTML.trim();
            return gameIsVisible ? "game" : "adventure";
        }
        return "adventure";
    }

    function syncScene() {
        const nextScene = detectScene();
        if (nextScene === currentScene) return;
        currentScene = nextScene;
        if (hasUserGesture && settings.musicEnabled) playCurrentTrack();
    }

    function startAfterGesture() {
        if (hasUserGesture) return;
        hasUserGesture = true;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            try {
                audioContext = new AudioContextClass();
                if (audioContext.state === "suspended") audioContext.resume();
            } catch (error) {
                console.warn("Efek suara tidak tersedia:", error);
            }
        }
        currentScene = detectScene();
        playCurrentTrack();
        setStatus("Musik sedang diputar · volume " + settings.musicVolume + "%");
    }

    // Efek suara pendek dibuat langsung melalui Web Audio API.
    // Semua nada ini orisinal dan tidak mengambil audio berhak cipta.
    function playSfx(kind) {
        if (!settings.sfxEnabled || !hasUserGesture || !audioContext) return;
        if (audioContext.state === "suspended") audioContext.resume();

        const now = audioContext.currentTime;
        const patterns = {
            click: [{ f: 620, t: 0, d: 0.075, a: 0.12 }],
            select: [{ f: 520, t: 0, d: 0.08, a: 0.13 }, { f: 720, t: 0.055, d: 0.09, a: 0.10 }],
            correct: [{ f: 660, t: 0, d: 0.15, a: 0.17 }, { f: 830, t: 0.12, d: 0.16, a: 0.16 }, { f: 990, t: 0.24, d: 0.23, a: 0.18 }],
            wrong: [{ f: 300, t: 0, d: 0.16, a: 0.14 }, { f: 235, t: 0.13, d: 0.2, a: 0.12 }],
            win: [{ f: 523, t: 0, d: 0.18, a: 0.16 }, { f: 659, t: 0.14, d: 0.18, a: 0.16 }, { f: 784, t: 0.28, d: 0.2, a: 0.17 }, { f: 1047, t: 0.43, d: 0.34, a: 0.19 }],
            timeout: [{ f: 440, t: 0, d: 0.22, a: 0.14 }, { f: 330, t: 0.2, d: 0.26, a: 0.12 }]
        };
        const notes = patterns[kind] || patterns.click;
        notes.forEach(function (note) {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const start = now + note.t;
            const end = start + note.d;
            oscillator.type = kind === "wrong" || kind === "timeout" ? "triangle" : "sine";
            oscillator.frequency.setValueAtTime(note.f, start);
            if (kind === "click" || kind === "select") {
                oscillator.frequency.exponentialRampToValueAtTime(note.f * 1.12, end);
            }
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.001, note.a * 0.86), start + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(start);
            oscillator.stop(end + 0.02);
        });
    }

    function togglePanel(force) {
        panelOpen = typeof force === "boolean" ? force : !panelOpen;
        if (ui.panel) ui.panel.hidden = !panelOpen;
        if (ui.toggle) ui.toggle.setAttribute("aria-expanded", String(panelOpen));
    }

    if (ui.toggle) {
        ui.toggle.addEventListener("click", function (event) {
            event.stopPropagation();
            togglePanel();
        });
    }

    if (ui.mute) {
        ui.mute.addEventListener("click", function () {
            const turnOn = !settings.musicEnabled && !settings.sfxEnabled;
            settings.musicEnabled = turnOn;
            settings.sfxEnabled = turnOn;
            if (turnOn) {
                if (hasUserGesture) playCurrentTrack();
                else setStatus("Ketuk halaman untuk mulai memutar musik.");
            } else {
                stopMusic();
            }
            saveSettings();
            updateControls();
        });
    }

    if (ui.musicEnabled) {
        ui.musicEnabled.addEventListener("change", function () {
            settings.musicEnabled = ui.musicEnabled.checked;
            if (settings.musicEnabled) {
                if (hasUserGesture) playCurrentTrack();
                else setStatus("Ketuk halaman untuk mulai memutar musik.");
            } else stopMusic();
            saveSettings();
            updateControls();
        });
    }

    if (ui.sfxEnabled) {
        ui.sfxEnabled.addEventListener("change", function () {
            settings.sfxEnabled = ui.sfxEnabled.checked;
            saveSettings();
            updateControls();
        });
    }

    if (ui.musicVolume) {
        ui.musicVolume.addEventListener("input", function () {
            settings.musicVolume = Math.max(0, Math.min(100, Number(ui.musicVolume.value) || 0));
            saveSettings();
            updateControls();
            if (currentTrack && !currentTrack.paused) {
                fadeTrack(currentTrack, settings.musicVolume / 100, 120, false);
            }
            if (settings.musicVolume === 0) stopMusic();
            else if (settings.musicEnabled && hasUserGesture && !currentTrack) playCurrentTrack();
            if (settings.musicVolume > 0 && settings.musicEnabled) {
                setStatus("Volume musik " + settings.musicVolume + "%");
            }
        });
    }

    document.addEventListener("pointerdown", startAfterGesture, { once: true, capture: true });
    document.addEventListener("keydown", startAfterGesture, { once: true, capture: true });

    document.addEventListener("pointerdown", function (event) {
        if (panelOpen && ui.widget && !ui.widget.contains(event.target)) togglePanel(false);
    });

    document.addEventListener("click", function (event) {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        if (target.closest("#eduAudioWidget")) return;
        if (target.closest(".drag-token, .ef-domino-card, [data-pizza-slice], [data-addition-cell]")) {
            playSfx("select");
            return;
        }
        if (target.closest("button, .nav-link")) playSfx("click");
    });

    // Deteksi pesan benar/salah dan hasil stage untuk memainkan efek yang sesuai.
    const seenMessages = new WeakMap();
    function checkFeedback(node) {
        if (!node || !node.matches) return;
        const selectors = ["#gameFeedback", "#quizFeedback", "#toast", "#stageGameFeedback", "#stageGameResult"];
        if (!selectors.some(function (selector) { return node.matches(selector); })) return;
        const message = (node.textContent || "").trim();
        if (!message || seenMessages.get(node) === message) return;
        seenMessages.set(node, message);
        const isStageFeedback = node.id === "stageGameFeedback";
        const isPositive = /stage selesai|semua stage|luar biasa|berhasil|jawaban benar|tepat sekali|hebat|sempurna|selamat/i.test(message);
        if (isPositive) {
            // Efek kemenangan dipicu oleh panel hasil stage agar tidak bertumpuk
            // dengan bunyi jawaban benar dari feedback stage yang sama.
            if (!isStageFeedback) {
                playSfx(/stage selesai|semua stage|luar biasa|sempurna/i.test(message) ? "win" : "correct");
            }
        } else if (/waktu( sudah)? habis|jawaban salah|belum tepat|kurang tepat|coba lagi|tidak cocok/i.test(message)) {
            playSfx(/waktu( sudah)? habis/i.test(message) ? "timeout" : "wrong");
        }
    }

    const observer = new MutationObserver(function (mutations) {
        syncScene();
        mutations.forEach(function (mutation) {
            if (mutation.target.nodeType === Node.ELEMENT_NODE) checkFeedback(mutation.target);
            if (mutation.target.parentElement) checkFeedback(mutation.target.parentElement);
            mutation.addedNodes.forEach(function (added) {
                if (added.nodeType !== Node.ELEMENT_NODE) return;
                checkFeedback(added);
                if (added.querySelectorAll) {
                    added.querySelectorAll("#gameFeedback, #quizFeedback, #toast, #stageGameFeedback, #stageGameResult").forEach(checkFeedback);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });

    updateControls();
    window.EduFunAudio = {
        play: playSfx,
        setScene: function (scene) {
            if (tracks[scene]) {
                currentScene = scene;
                playCurrentTrack();
            }
        },
        getSettings: function () { return { ...settings }; }
    };
})();
