// =====================================================
// EDUFUN - MAGICAL FRACTION WORLD
// 15 MATERI + 15 ILUSTRASI SVG
// 3 TINGKAT, MASING-MASING 5 MATERI
// =====================================================


// =====================================================
// 1. UTILITAS DAN PENYIMPANAN DATA
// =====================================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORE = "edufun-pecahan-v1";

const defaultState = {
    name: "Pejuang Pecahan",
    stars: 0,
    completed: [],
    quizzes: [],
    gameWins: 0,
    stageProgress: {}
};

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORE) || "{}");

        return {
            ...defaultState,
            ...saved,

            completed: Array.isArray(saved.completed) ? [...new Set(saved.completed)] : [],

            quizzes: Array.isArray(saved.quizzes) ?
                saved.quizzes : [],

            stageProgress: saved.stageProgress &&
                typeof saved.stageProgress === "object" &&
                !Array.isArray(saved.stageProgress) ?
                saved.stageProgress : {}
        };

    } catch (error) {
        console.warn("Data EduFun gagal dibaca:", error);
        return {...defaultState };
    }
}

let state = loadState();

function save() {
    try {
        localStorage.setItem(STORE, JSON.stringify(state));
    } catch (error) {
        console.warn("Progres tidak dapat disimpan:", error);
    }

    updateDashboard();
}

function toast(message) {
    const element = $("#toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toast.timeout);

    toast.timeout = setTimeout(() => {
        element.classList.remove("show");
    }, 2300);
}


// =====================================================
// 2. NAVIGASI HALAMAN
// =====================================================

const pageNames = {
    home: "Beranda",
    materials: "Materi",
    games: "Petualangan",
    quiz: "Kuis",
    progress: "Progres Belajar",
    profile: "Profil Saya"
};

function showPage(page) {
    const target = $(`#page-${page}`);

    if (!target) {
        console.warn(`Halaman ${page} tidak ditemukan.`);
        return;
    }

    $$(".page").forEach(section => {
        section.classList.toggle(
            "active",
            section === target
        );
    });

    $$(".nav-link[data-page]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    if ($("#pageLabel")) {
        $("#pageLabel").textContent =
            pageNames[page] || "Beranda";
    }

    const sidebar = $("#sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (page === "progress") {
        renderProgress();
    }

    if (page === "games") {
        renderAdventureMap();
    }

    if (page === "materials" && activeMaterialLevel === null) {
        renderLessons();
    }
}


// Navigasi sidebar.
$$("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});


// Navigasi tombol dashboard.
$$("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.go);
    });
});


// Menu mobile.
const menuToggle = $("#menuToggle");
const sidebar = $("#sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}


// =====================================================
// 3. DATA 15 MATERI PECAHAN
// URUTAN INDEKS DIPERTAHANKAN AGAR PROGRES LAMA AMAN
// =====================================================

const lessons = [

    // INDEKS 0
    [
        "Mengenal Pecahan",
        "Memahami pecahan sebagai bagian dari satu benda utuh.",
        "Bayangkan satu pizza dipotong menjadi dua bagian sama besar. Jika kamu mengambil satu bagian, bagian tersebut disebut satu per dua atau 1/2.",
        "Pecahan menunjukkan bagian yang diambil dari keseluruhan bagian yang sama besar."
    ],

    // INDEKS 1
    [
        "Pembilang dan Penyebut",
        "Mengenal angka di atas dan di bawah garis pecahan.",
        "Pada pecahan 3/4, angka 3 adalah pembilang dan angka 4 adalah penyebut.",
        "Pembilang berada di atas garis, sedangkan penyebut berada di bawah garis."
    ],

    // INDEKS 2
    [
        "Pecahan dengan Gambar",
        "Memahami pecahan menggunakan gambar.",
        "Jika sebuah persegi dibagi menjadi 4 bagian sama besar dan 2 bagian diwarnai, pecahannya adalah 2/4.",
        "Gambar membantu kita memahami bagian yang dipilih dari keseluruhan."
    ],

    // INDEKS 3
    [
        "Pecahan Senilai",
        "Mengenal pecahan yang memiliki nilai sama.",
        "Pecahan 1/2 memiliki nilai yang sama dengan 2/4 dan 3/6.",
        "Meskipun angka pembilang dan penyebut berbeda, nilainya bisa sama."
    ],

    // INDEKS 4
    [
        "Membandingkan Pecahan",
        "Menentukan pecahan yang lebih besar atau lebih kecil.",
        "Jika penyebutnya sama, bandingkan pembilangnya. Contohnya 3/4 lebih besar daripada 1/4.",
        "Gunakan tanda lebih besar (>), lebih kecil (<), atau sama dengan (=)."
    ],

    // INDEKS 5
    [
        "Penjumlahan Pecahan",
        "Menjumlahkan pecahan sederhana dengan penyebut sama.",
        "Contohnya 1/4 + 2/4 = 3/4. Pembilang dijumlahkan, sedangkan penyebut tetap.",
        "Pastikan penyebut kedua pecahan sama sebelum menjumlahkan."
    ],

    // INDEKS 6
    [
        "Bagian dari Keseluruhan",
        "Menentukan bagian dari suatu benda atau kumpulan benda.",
        "Ada 8 permen. Sebanyak 4 permen berwarna merah. Berarti 4 dari 8 permen adalah permen merah atau 4/8.",
        "Pecahan dapat digunakan untuk menunjukkan bagian dari sekumpulan benda."
    ],

    // INDEKS 7
    [
        "Mengenal Pecahan Satuan",
        "Memahami pecahan yang memiliki pembilang satu.",
        "Contohnya 1/2, 1/3, dan 1/4. Angka 1 menunjukkan satu bagian yang dipilih dari seluruh bagian.",
        "Semakin banyak bagian yang sama besar, semakin kecil nilai satu bagiannya."
    ],

    // INDEKS 8
    [
        "Menyederhanakan Pecahan",
        "Mengenal cara mendapatkan bentuk pecahan yang lebih sederhana.",
        "Pecahan 2/4 dapat disederhanakan menjadi 1/2 dengan membagi pembilang dan penyebut menggunakan angka 2.",
        "Pembilang dan penyebut harus dibagi dengan bilangan yang sama."
    ],

    // INDEKS 9
    [
        "Membandingkan Penyebut Berbeda",
        "Membandingkan dua pecahan yang memiliki penyebut berbeda.",
        "Contohnya 1/2 dan 1/4. Nilai 1/2 lebih besar daripada 1/4 karena setengah bagian lebih besar daripada seperempat bagian.",
        "Gunakan gambar atau samakan penyebut untuk membantu perbandingan."
    ],

    // INDEKS 10
    [
        "Mengurutkan Pecahan",
        "Mengurutkan beberapa pecahan dari nilai terkecil hingga terbesar.",
        "Contohnya 1/4, 2/4, dan 3/4. Urutan dari terkecil adalah 1/4, 2/4, kemudian 3/4.",
        "Perhatikan nilai pecahan sebelum menentukan urutannya."
    ],

    // INDEKS 11
    [
        "Pengurangan Pecahan Berpenyebut Sama",
        "Mengurangi pecahan sederhana dengan penyebut yang sama.",
        "Contohnya 3/4 - 1/4 = 2/4. Kurangkan pembilang dan pertahankan penyebut.",
        "Penyebut tetap sama apabila kedua pecahan memiliki penyebut yang sama."
    ],

    // INDEKS 12
    [
        "Penjumlahan Pecahan Berpenyebut Berbeda",
        "Menjumlahkan pecahan sederhana dengan penyebut berbeda.",
        "Contohnya 1/2 + 1/4. Ubahlah 1/2 menjadi 2/4, kemudian 2/4 + 1/4 = 3/4.",
        "Samakan penyebut terlebih dahulu sebelum menjumlahkan."
    ],

    // INDEKS 13
    [
        "Pengurangan Pecahan Berpenyebut Berbeda",
        "Mengurangi pecahan sederhana dengan penyebut berbeda.",
        "Contohnya 3/4 - 1/2. Ubahlah 1/2 menjadi 2/4, kemudian 3/4 - 2/4 = 1/4.",
        "Samakan penyebut terlebih dahulu sebelum melakukan pengurangan."
    ],

    // INDEKS 14
    [
        "Soal Cerita Pecahan",
        "Menggunakan konsep pecahan untuk menyelesaikan masalah sehari-hari.",
        "Ibu memiliki satu pizza. Rani memakan 1/4 bagian dan adiknya memakan 2/4 bagian. Berapa bagian pizza yang sudah dimakan? Jawabannya adalah 3/4.",
        "Baca soal dengan teliti, cari informasi pecahan, lalu tentukan operasi yang diperlukan."
    ]

];


// =====================================================
// 4. PEMBAGIAN TIGA TINGKAT MATERI
// =====================================================

const materialLevels = {

    dasar: {
        title: "Materi Dasar",
        badge: "LEVEL 01",
        emoji: "🌱",
        description: "Kenali konsep pecahan dari benda dan gambar sederhana.",
        lessonIndexes: [0, 1, 2, 6, 7]
    },

    menengah: {
        title: "Materi Menengah",
        badge: "LEVEL 02",
        emoji: "🚀",
        description: "Pelajari hubungan, perbandingan, dan urutan pecahan.",
        lessonIndexes: [3, 4, 8, 9, 10]
    },

    lanjutan: {
        title: "Materi Lanjutan",
        badge: "LEVEL 03",
        emoji: "🏆",
        description: "Terapkan konsep pecahan melalui operasi hitung dan soal cerita.",
        lessonIndexes: [5, 11, 12, 13, 14]
    }

};

let activeMaterialLevel = null;


// Menentukan tingkat materi.
function getMaterialLevel(index) {
    const entry = Object.entries(materialLevels).find(
        ([key, level]) => level.lessonIndexes.includes(index)
    );

    return entry ? entry[0] : null;
}


// Mendapatkan nomor lokal 1 sampai 5.
function getLocalLessonNumber(index) {
    const levelKey = getMaterialLevel(index);

    if (!levelKey) return index + 1;

    const position =
        materialLevels[levelKey].lessonIndexes.indexOf(index);

    return position + 1;
}


// =====================================================
// 5. HELPER PEMBUAT ILUSTRASI SVG
// =====================================================

// Membuat potongan lingkaran pecahan.
function makeCircleSlices(total, shaded, color = "#FF984B") {

    const center = 105;
    const radius = 72;

    let paths = "";

    for (let i = 0; i < total; i++) {

        const start =
            (-90 + i * 360 / total) * Math.PI / 180;

        const end =
            (-90 + (i + 1) * 360 / total) * Math.PI / 180;

        const x1 = center + radius * Math.cos(start);
        const y1 = center + radius * Math.sin(start);

        const x2 = center + radius * Math.cos(end);
        const y2 = center + radius * Math.sin(end);

        const largeArc = 360 / total > 180 ? 1 : 0;

        const fill = i < shaded ? color : "#FFE7AF";

        paths += `
            <path
                d="M ${center} ${center}
                   L ${x1.toFixed(2)} ${y1.toFixed(2)}
                   A ${radius} ${radius} 0 ${largeArc} 1
                   ${x2.toFixed(2)} ${y2.toFixed(2)}
                   Z"
                fill="${fill}"
                stroke="#FFFFFF"
                stroke-width="3"
            />
        `;
    }

    return `
        <circle cx="${center}" cy="${center}"
                r="82" fill="#D18A4B"/>
        ${paths}
    `;
}


// Membuat batang pecahan.
function makeFractionBar(
    x,
    y,
    width,
    height,
    total,
    shaded,
    color = "#7056D9"
) {
    const partWidth = width / total;

    let output = `
        <rect x="${x}" y="${y}"
              width="${width}" height="${height}"
              rx="7" fill="#FFE8B5"/>
    `;

    for (let i = 0; i < shaded; i++) {

        output += `
            <rect
                x="${x + i * partWidth}"
                y="${y}"
                width="${partWidth}"
                height="${height}"
                fill="${color}"
            />
        `;
    }

    for (let i = 1; i < total; i++) {

        output += `
            <path
                d="M ${x + i * partWidth} ${y}
                   V ${y + height}"
                stroke="#FFFFFF"
                stroke-width="3"
            />
        `;
    }

    return output;
}


// Dekorasi bintang SVG.
function svgStars() {
    return `
        <g fill="#F8BD45">
            <path d="M35 30 L40 42 L52 47 L40 52 L35 64 L30 52 L18 47 L30 42 Z"/>
            <path d="M450 25 L454 34 L464 38 L454 42 L450 52 L446 42 L436 38 L446 34 Z"/>
            <path d="M445 160 L449 168 L457 172 L449 176 L445 184 L441 176 L433 172 L441 168 Z"/>
        </g>

        <circle cx="76" cy="160" r="5" fill="#69C8ED"/>
        <circle cx="400" cy="40" r="5" fill="#F88C9E"/>
    `;
}


// =====================================================
// 6. 15 ILUSTRASI MATERI
// SEMUA MATERI MEMILIKI ILUSTRASI
// =====================================================

function getLessonIllustration(index) {

    const captions = [

        "Satu bagian dari dua bagian yang sama besar.",

        "Kenali pembilang dan penyebut melalui bentuk pecahan.",

        "Warna menunjukkan bagian yang dipilih dari seluruh bagian.",

        "Pecahan 1/2, 2/4, dan 3/6 memiliki nilai yang sama.",

        "Bandingkan bagian berwarna untuk mengetahui pecahan terbesar.",

        "Gabungkan bagian pecahan untuk mendapatkan hasil penjumlahan.",

        "Empat dari delapan benda menunjukkan pecahan 4/8.",

        "Semakin banyak bagian sama besar, semakin kecil satu bagiannya.",

        "Dua per empat dapat disederhanakan menjadi satu per dua.",

        "Setengah bagian lebih besar daripada seperempat bagian.",

        "Susun pecahan dari bagian yang paling kecil hingga paling besar.",

        "Kurangi bagian yang diambil dari jumlah bagian semula.",

        "Samakan penyebut sebelum menjumlahkan pecahan.",

        "Samakan penyebut sebelum mengurangi pecahan.",

        "Gunakan pecahan untuk menyelesaikan cerita kehidupan sehari-hari."

    ];

    let illustration = "";


    // =============================================
    // DASAR 1 - MENGENAL PECAHAN
    // =============================================

    if (index === 0) {

        illustration = `
            ${makeCircleSlices(2, 1, "#FF984B")}

            <text x="240" y="95"
                  font-size="48"
                  fill="#7056D9"
                  font-weight="900">1/2</text>

            <text x="240" y="123"
                  font-size="16"
                  fill="#77829D">Setengah pizza</text>

            <text x="240" y="155" font-size="28">🍕</text>
        `;
    }


    // =============================================
    // DASAR 2 - PEMBILANG DAN PENYEBUT
    // =============================================
    else if (index === 1) {

        illustration = `
            <rect x="120" y="15"
                  width="150" height="180"
                  rx="22"
                  fill="#EAE8FF"/>

            <text x="195" y="91"
                  text-anchor="middle"
                  font-size="62"
                  font-weight="900"
                  fill="#625BDB">3</text>

            <path d="M150 107 H240"
                  stroke="#202B55"
                  stroke-width="6"
                  stroke-linecap="round"/>

            <text x="195" y="167"
                  text-anchor="middle"
                  font-size="62"
                  font-weight="900"
                  fill="#FF984B">4</text>

            <path d="M270 70 H310"
                  stroke="#625BDB"
                  stroke-width="3"/>

            <text x="318" y="75"
                  font-size="14"
                  fill="#625BDB">Pembilang</text>

            <path d="M270 145 H310"
                  stroke="#FF984B"
                  stroke-width="3"/>

            <text x="318" y="150"
                  font-size="14"
                  fill="#C87B34">Penyebut</text>

            <text x="35" y="105" font-size="40">🔢</text>
        `;
    }


    // =============================================
    // DASAR 3 - PECAHAN DENGAN GAMBAR
    // =============================================
    else if (index === 2) {

        illustration = `
            <rect x="55" y="32"
                  width="150" height="150"
                  rx="13"
                  fill="#FFE7AF"/>

            <path d="M130 32 V182 M55 107 H205"
                  stroke="#FFFFFF"
                  stroke-width="5"/>

            <rect x="55" y="32"
                  width="75" height="75"
                  fill="#FF984B"/>

            <rect x="130" y="107"
                  width="75" height="75"
                  fill="#FF984B"/>

            <text x="265" y="100"
                  font-size="45"
                  fill="#625BDB"
                  font-weight="900">2/4</text>

            <text x="265" y="130"
                  font-size="16"
                  fill="#77829D">Dua bagian</text>

            <text x="265" y="158" font-size="25">🎨</text>
        `;
    }


    // =============================================
    // MENENGAH 1 - PECAHAN SENILAI
    // Ketiga pecahan wajib memiliki ilustrasi.
    // Setiap batang dibagi sesuai penyebut dan
    // bagian berwarna sesuai pembilang.
    // =============================================
    else if (index === 3) {

        illustration = `
            <!-- Pecahan 1/2 -->
            <text x="82" y="65"
                  text-anchor="middle"
                  font-size="22"
                  fill="#625BDB"
                  font-weight="900">1/2</text>

            ${makeFractionBar(22, 82, 120, 42, 2, 1, "#625BDB")}

            <text x="82" y="148"
                  text-anchor="middle"
                  font-size="13"
                  fill="#77829D">1 dari 2 bagian</text>

            <!-- Tanda sama dengan pertama -->
            <text x="166" y="111"
                  text-anchor="middle"
                  font-size="25"
                  fill="#77829D"
                  font-weight="900">=</text>

            <!-- Pecahan 2/4 -->
            <text x="250" y="65"
                  text-anchor="middle"
                  font-size="22"
                  fill="#269AC6"
                  font-weight="900">2/4</text>

            ${makeFractionBar(190, 82, 120, 42, 4, 2, "#38BDF8")}

            <text x="250" y="148"
                  text-anchor="middle"
                  font-size="13"
                  fill="#77829D">2 dari 4 bagian</text>

            <!-- Tanda sama dengan kedua -->
            <text x="334" y="111"
                  text-anchor="middle"
                  font-size="25"
                  fill="#77829D"
                  font-weight="900">=</text>

            <!-- Pecahan 3/6: sekarang dilengkapi ilustrasi -->
            <text x="418" y="65"
                  text-anchor="middle"
                  font-size="22"
                  fill="#1E9B6F"
                  font-weight="900">3/6</text>

            ${makeFractionBar(358, 82, 120, 42, 6, 3, "#34B78B")}

            <text x="418" y="148"
                  text-anchor="middle"
                  font-size="13"
                  fill="#77829D">3 dari 6 bagian</text>

            <rect x="145" y="169" width="210" height="29"
                  rx="14" fill="#E9E7FF"/>

            <text x="250" y="189"
                  text-anchor="middle"
                  font-size="14"
                  fill="#625BDB"
                  font-weight="900">Ketiganya bernilai sama! ✨</text>
        `;
    }


    // =============================================
    // MENENGAH 2 - MEMBANDINGKAN PECAHAN
    // =============================================
    else if (index === 4) {

        illustration = `
            <text x="45" y="40"
                  font-size="21"
                  fill="#625BDB"
                  font-weight="900">3/4</text>

            ${makeFractionBar(35, 53, 125, 42, 4, 3, "#34B78B")}

            <text x="220" y="85"
                  font-size="42"
                  fill="#625BDB"
                  font-weight="900">&gt;</text>

            <text x="310" y="40"
                  font-size="21"
                  fill="#FF984B"
                  font-weight="900">1/4</text>

            ${makeFractionBar(300, 53, 125, 42, 4, 1, "#FF984B")}

            <text x="90" y="145" font-size="35">😄</text>
            <text x="345" y="145" font-size="35">🙂</text>

            <text x="245" y="181"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Mana yang lebih besar?
            </text>
        `;
    }


    // =============================================
    // LANJUTAN 1 - PENJUMLAHAN PECAHAN
    // =============================================
    else if (index === 5) {

        illustration = `
            <text x="30" y="38"
                  font-size="19"
                  fill="#625BDB"
                  font-weight="900">1/4</text>

            ${makeFractionBar(25, 55, 95, 38, 4, 1, "#625BDB")}

            <text x="128" y="82"
                  font-size="29"
                  fill="#77829D"
                  font-weight="900">+</text>

            <text x="180" y="38"
                  font-size="19"
                  fill="#FF984B"
                  font-weight="900">2/4</text>

            ${makeFractionBar(175, 55, 95, 38, 4, 2, "#FF984B")}

            <text x="280" y="82"
                  font-size="29"
                  fill="#77829D"
                  font-weight="900">=</text>

            <text x="345" y="38"
                  font-size="19"
                  fill="#34B78B"
                  font-weight="900">3/4</text>

            ${makeFractionBar(330, 55, 100, 38, 4, 3, "#34B78B")}

            <text x="230" y="155"
                  text-anchor="middle"
                  font-size="29">🎉</text>

            <text x="230" y="186"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Gabungkan bagian pecahan!
            </text>
        `;
    }


    // =============================================
    // DASAR 4 - BAGIAN DARI KESELURUHAN
    // =============================================

    // =============================================
    // DASAR 4 - BAGIAN DARI KESELURUHAN
    // ILUSTRASI 8 PERMEN, 4 DIWARNAI
    // =============================================
    else if (index === 6) {

        const candies = Array.from({ length: 8 }, (_, i) => {

            const x = 25 + (i % 4) * 77;
            const y = 55 + Math.floor(i / 4) * 75;

            const isColored = i < 4;

            const candyColor = isColored ?
                "#FF718F" :
                "#A9DDF5";

            const wrapperColor = isColored ?
                "#E84E73" :
                "#72B9E2";

            return `
                <g transform="translate(${x} ${y})">

                    <!-- Bungkus kiri -->
                    <path
                        d="M10 15 L0 4 L3 15 L0 26 Z"
                        fill="${wrapperColor}"
                        stroke="#FFFFFF"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                    />

                    <!-- Isi permen -->
                    <rect
                        x="9"
                        y="5"
                        width="43"
                        height="20"
                        rx="9"
                        fill="${candyColor}"
                        stroke="#FFFFFF"
                        stroke-width="2"
                    />

                    <!-- Bungkus kanan -->
                    <path
                        d="M51 15 L62 4 L59 15 L62 26 Z"
                        fill="${wrapperColor}"
                        stroke="#FFFFFF"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                    />

                    <!-- Kilauan permen -->
                    <path
                        d="M17 10 H40"
                        stroke="#FFFFFF"
                        stroke-width="3"
                        stroke-linecap="round"
                        opacity=".7"
                    />

                    <!-- Hiasan -->
                    <circle
                        cx="30"
                        cy="17"
                        r="3"
                        fill="#FFFFFF"
                        opacity=".8"
                    />

                </g>
            `;
        }).join("");


        illustration = `

            <!-- Judul ilustrasi -->
            <text x="25" y="31"
                  font-size="13"
                  font-weight="900"
                  fill="#625BDB">
                8 PERMEN
            </text>

            <!-- Delapan permen -->
            ${candies}

            <!-- Garis pemisah -->
            <path
                d="M340 45 V188"
                stroke="#D9D4FA"
                stroke-width="2"
                stroke-dasharray="5 5"
            />

            <!-- Pecahan -->
            <text x="385" y="105"
                  text-anchor="middle"
                  font-size="37"
                  font-weight="900"
                  fill="#625BDB">
                4/8
            </text>

            <text x="385" y="132"
                  text-anchor="middle"
                  font-size="13"
                  fill="#77829D">
                Empat dari delapan
            </text>

            <text x="385" y="165"
                  text-anchor="middle"
                  font-size="24">
                🍬
            </text>

            <!-- Keterangan warna -->
            <circle cx="360" cy="190" r="5" fill="#FF718F"/>
            <text x="370" y="194"
                  font-size="10"
                  fill="#77829D">
                4 diwarnai
            </text>
        `;
    }

    // =============================================
    // DASAR 5 - PECAHAN SATUAN
    // =============================================
    else if (index === 7) {

        illustration = `
            <text x="45" y="38"
                  font-size="17"
                  fill="#625BDB"
                  font-weight="900">1/2</text>

            ${makeFractionBar(45, 50, 100, 27, 2, 1, "#625BDB")}

            <text x="195" y="38"
                  font-size="17"
                  fill="#269AC6"
                  font-weight="900">1/3</text>

            ${makeFractionBar(195, 50, 100, 27, 3, 1, "#38BDF8")}

            <text x="345" y="38"
                  font-size="17"
                  fill="#1E9B6F"
                  font-weight="900">1/4</text>

            ${makeFractionBar(345, 50, 100, 27, 4, 1, "#34B399")}

            <text x="95" y="132" font-size="34">🍕</text>
            <text x="245" y="132" font-size="34">🍰</text>
            <text x="395" y="132" font-size="34">🍫</text>

            <text x="245" y="185"
                  text-anchor="middle"
                  fill="#77829D"
                  font-size="15">
                Pembilang selalu satu
            </text>
        `;
    }


    // =============================================
    // MENENGAH 3 - MENYEDERHANAKAN PECAHAN
    // =============================================
    else if (index === 8) {

        illustration = `
            <text x="45" y="40"
                  font-size="21"
                  fill="#625BDB"
                  font-weight="900">2/4</text>

            ${makeFractionBar(35, 55, 145, 42, 4, 2, "#625BDB")}

            <path d="M205 80 H280 M267 67 L280 80 L267 93"
                  stroke="#FBBF24"
                  stroke-width="5"
                  fill="none"
                  stroke-linecap="round"/>

            <text x="310" y="40"
                  font-size="21"
                  fill="#34B78B"
                  font-weight="900">1/2</text>

            ${makeFractionBar(300, 55, 145, 42, 2, 1, "#34B78B")}

            <text x="240" y="150"
                  text-anchor="middle"
                  font-size="30">✨</text>

            <text x="240" y="181"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Bentuk lebih sederhana!
            </text>
        `;
    }


    // =============================================
    // MENENGAH 4 - PENYEBUT BERBEDA
    // =============================================
    else if (index === 9) {

        illustration = `
            <text x="48" y="40"
                  font-size="21"
                  fill="#625BDB"
                  font-weight="900">1/2</text>

            ${makeFractionBar(40, 55, 140, 43, 2, 1, "#625BDB")}

            <text x="48" y="125"
                  font-size="21"
                  fill="#FF984B"
                  font-weight="900">1/4</text>

            ${makeFractionBar(40, 140, 140, 43, 4, 1, "#FF984B")}

            <text x="240" y="100"
                  font-size="47"
                  fill="#625BDB"
                  font-weight="900">&gt;</text>

            <text x="325" y="92" font-size="35">🌟</text>

            <text x="300" y="127"
                  font-size="15"
                  fill="#77829D">
                Setengah lebih besar
            </text>
        `;
    }


    // =============================================
    // MENENGAH 5 - MENGURUTKAN PECAHAN
    // =============================================
    else if (index === 10) {

        illustration = `
            <text x="45" y="37"
                  font-size="17"
                  font-weight="900"
                  fill="#625BDB">1/4</text>

            ${makeFractionBar(35, 50, 120, 25, 4, 1, "#FF984B")}

            <text x="45" y="107"
                  font-size="17"
                  font-weight="900"
                  fill="#269AC6">2/4</text>

            ${makeFractionBar(35, 120, 120, 25, 4, 2, "#38BDF8")}

            <text x="250" y="37"
                  font-size="17"
                  font-weight="900"
                  fill="#1E9B6F">3/4</text>

            ${makeFractionBar(240, 50, 120, 25, 4, 3, "#34B78B")}

            <text x="250" y="125" font-size="32">🥇</text>

            <text x="240" y="180"
                  font-size="15"
                  fill="#77829D">
                Urutkan dari kecil ke besar
            </text>
        `;
    }


    // =============================================
    // LANJUTAN 2 - PENGURANGAN PENYEBUT SAMA
    // =============================================
    else if (index === 11) {

        illustration = `
            <text x="45" y="38"
                  font-size="21"
                  fill="#625BDB"
                  font-weight="900">3/4</text>

            ${makeFractionBar(35, 55, 135, 40, 4, 3, "#34B78B")}

            <text x="196" y="85"
                  font-size="30"
                  fill="#77829D"
                  font-weight="900">−</text>

            <text x="235" y="38"
                  font-size="21"
                  fill="#FF984B"
                  font-weight="900">1/4</text>

            ${makeFractionBar(225, 55, 135, 40, 4, 1, "#FF984B")}

            <text x="230" y="145"
                  text-anchor="middle"
                  font-size="37"
                  fill="#625BDB"
                  font-weight="900">= 2/4</text>

            <text x="230" y="180"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Kurangkan bagian yang diambil.
            </text>
        `;
    }


    // =============================================
    // LANJUTAN 3 - PENJUMLAHAN PENYEBUT BERBEDA
    // =============================================
    else if (index === 12) {

        illustration = `
            <text x="40" y="37"
                  font-size="19"
                  fill="#625BDB"
                  font-weight="900">1/2</text>

            ${makeFractionBar(30, 53, 95, 38, 2, 1, "#625BDB")}

            <text x="135" y="82"
                  font-size="30"
                  fill="#77829D"
                  font-weight="900">+</text>

            <text x="180" y="37"
                  font-size="19"
                  fill="#FF984B"
                  font-weight="900">1/4</text>

            ${makeFractionBar(175, 53, 95, 38, 4, 1, "#FF984B")}

            <text x="280" y="82"
                  font-size="30"
                  fill="#77829D"
                  font-weight="900">=</text>

            <text x="330" y="37"
                  font-size="19"
                  fill="#34B78B"
                  font-weight="900">3/4</text>

            ${makeFractionBar(320, 53, 110, 38, 4, 3, "#34B78B")}

            <text x="230" y="147"
                  text-anchor="middle"
                  font-size="26">🔄</text>

            <text x="230" y="182"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Samakan penyebut dahulu!
            </text>
        `;
    }


    // =============================================
    // LANJUTAN 4 - PENGURANGAN PENYEBUT BERBEDA
    // =============================================
    else if (index === 13) {

        illustration = `
            <text x="35" y="37"
                  font-size="19"
                  fill="#625BDB"
                  font-weight="900">3/4</text>

            ${makeFractionBar(30, 53, 120, 38, 4, 3, "#34B78B")}

            <text x="157" y="82"
                  font-size="30"
                  fill="#77829D"
                  font-weight="900">−</text>

            <text x="190" y="37"
                  font-size="19"
                  fill="#FF984B"
                  font-weight="900">1/2</text>

            ${makeFractionBar(185, 53, 120, 38, 2, 1, "#FF984B")}

            <text x="315" y="82"
                  font-size="30"
                  fill="#77829D"
                  font-weight="900">=</text>

            <text x="345" y="37"
                  font-size="19"
                  fill="#625BDB"
                  font-weight="900">1/4</text>

            <text x="360" y="115" font-size="23">✨</text>

            <text x="230" y="155"
                  text-anchor="middle"
                  font-size="26">🧠</text>

            <text x="230" y="185"
                  text-anchor="middle"
                  font-size="15"
                  fill="#77829D">
                Gunakan penyebut yang sama.
            </text>
        `;
    }


    // =============================================
    // LANJUTAN 5 - SOAL CERITA
    // =============================================
    else if (index === 14) {

        illustration = `
            <g transform="translate(20 10)">
                ${makeCircleSlices(4, 3, "#FF984B")}
            </g>

            <rect x="245" y="24"
                  width="195"
                  height="145"
                  rx="22"
                  fill="#EAE8FF"/>

            <text x="340" y="59"
                  text-anchor="middle"
                  font-size="16"
                  fill="#625BDB"
                  font-weight="900">MISI PIZZA</text>

            <text x="340" y="94"
                  text-anchor="middle"
                  font-size="21"
                  fill="#202B55"
                  font-weight="900">1/4 + 2/4</text>

            <text x="340" y="130"
                  text-anchor="middle"
                  font-size="24"
                  fill="#34B78B"
                  font-weight="900">= 3/4</text>

            <text x="335" y="192"
                  text-anchor="middle"
                  font-size="18">🍕 🎉 🐲</text>
        `;
    }


    // Jika indeks tidak ditemukan.
    else {
        return "";
    }


    return `
        <div class="lesson-illustration">

            <div class="lesson-visual-art">

                <svg viewBox="0 0 500 220"
                     xmlns="http://www.w3.org/2000/svg"
                     role="img"
                     aria-label="${captions[index]}">

                    <rect x="1" y="1"
                          width="498"
                          height="218"
                          rx="22"
                          fill="#F1F4FF"/>

                    ${index === 3 ? "" : svgStars()}

                    ${illustration}

                </svg>

            </div>

            <div class="lesson-visual-caption">
                <span>VISUALISASI MATERI</span>
                <p>${captions[index]}</p>
            </div>

        </div>
    `;
}


// =====================================================
// 7. PILIHAN TINGKAT MATERI
// =====================================================

function renderLessons() {

    const levelScreen = $("#materialLevelScreen");
    const topicScreen = $("#materialTopicScreen");

    if (!levelScreen || !topicScreen) {
        console.warn("Bagian tingkat materi tidak ditemukan.");
        return;
    }

    activeMaterialLevel = null;

    levelScreen.hidden = false;
    topicScreen.hidden = true;

    $$(".material-level-card").forEach(button => {

        if (button.dataset.listenerAttached === "true") {
            return;
        }

        button.addEventListener("click", () => {
            showMaterialLevel(button.dataset.materialLevel);
        });

        button.dataset.listenerAttached = "true";
    });

    const backButton = $("#backToMaterialLevels");

    if (backButton && backButton.dataset.listenerAttached !== "true") {

        backButton.addEventListener("click", renderLessons);

        backButton.dataset.listenerAttached = "true";
    }
}


// =====================================================
// 8. MEMBUKA TINGKAT MATERI
// =====================================================

function showMaterialLevel(levelKey, selectedIndex = null) {

    const level = materialLevels[levelKey];

    if (!level) return;

    activeMaterialLevel = levelKey;

    const levelScreen = $("#materialLevelScreen");
    const topicScreen = $("#materialTopicScreen");
    const lessonList = $("#lessonList");

    if (!levelScreen || !topicScreen || !lessonList) return;

    levelScreen.hidden = true;
    topicScreen.hidden = false;

    $("#selectedLevelBadge").textContent = level.badge;
    $("#selectedLevelTitle").textContent = level.title;
    $("#selectedLevelDescription").textContent = level.description;
    $("#selectedLevelEmoji").textContent = level.emoji;


    // Setiap tingkat menggunakan nomor 1 sampai 5.
    lessonList.innerHTML = level.lessonIndexes.map((index, position) => {

        const lesson = lessons[index];
        const localNumber = position + 1;

        const done = state.completed.includes(index);

        return `
            <button class="lesson-item"
                    data-lesson="${index}">

                <span class="lesson-number">
                    ${localNumber}
                </span>

                <span>
                    <b>${lesson[0]}</b>

                    <small>
                        ${done
                            ? "✓ Selesai dipelajari"
                            : "Materi " + localNumber}
                    </small>
                </span>

            </button>
        `;

    }).join("");


    // Event pilihan topik.
    $$(".lesson-item").forEach(button => {

        button.addEventListener("click", () => {
            openLesson(Number(button.dataset.lesson));
        });

    });


    const firstLesson = level.lessonIndexes[0];

    const targetLesson =
        selectedIndex !== null &&
        level.lessonIndexes.includes(selectedIndex) ?
        selectedIndex :
        firstLesson;

    openLesson(targetLesson);
}


// =====================================================
// 9. MENAMPILKAN DETAIL MATERI
// =====================================================

function openLesson(index) {

    const lesson = lessons[index];
    const view = $("#lessonView");

    if (!lesson || !view) return;

    const targetLevel = getMaterialLevel(index);

    // Membuka tingkat yang sesuai jika dipanggil dari peta.
    if (targetLevel !== activeMaterialLevel) {
        showMaterialLevel(targetLevel, index);
        return;
    }

    const localNumber = getLocalLessonNumber(index);

    $$(".lesson-item").forEach(button => {

        button.classList.toggle(
            "active",
            Number(button.dataset.lesson) === index
        );

    });

    const done = state.completed.includes(index);

    view.innerHTML = `

        <p class="eyebrow">
            ${materialLevels[activeMaterialLevel].badge}
            · MATERI ${String(localNumber).padStart(2, "0")}
        </p>

        <h2>${lesson[0]}</h2>

        <p>${lesson[1]}</p>

        ${getLessonIllustration(index)}

        <div class="lesson-example">

            <strong>💡 Contoh sederhana</strong>

            <p>${lesson[2]}</p>

            <b>${lesson[3]}</b>

        </div>

        <button
            class="btn ${done ? "btn-light" : "btn-primary"} lesson-complete"
            id="completeLesson">

            ${done
                ? "✓ Sudah dipelajari"
                : "Tandai sudah dipelajari"}

        </button>
    `;


    $("#completeLesson").addEventListener("click", () => {

        if (state.completed.includes(index)) {
            toast("Materi ini sudah kamu selesaikan.");
            return;
        }

        state.completed.push(index);
        state.stars += 5;

        save();

        showMaterialLevel(activeMaterialLevel, index);

        toast("Hebat! Kamu mendapat 5 bintang ⭐");
    });

}


// =====================================================
// 10. ADVENTURE MAP - 15 PULAU
// =====================================================

const adventureOrder = [
    ...materialLevels.dasar.lessonIndexes,
    ...materialLevels.menengah.lessonIndexes,
    ...materialLevels.lanjutan.lessonIndexes
];

const islandIcons = [
    "🏝️",
    "🍕",
    "🔢",
    "🍬",
    "🍰",
    "💎",
    "⚖️",
    "✨",
    "🌈",
    "🥇",
    "🍎",
    "🧮",
    "🚀",
    "🧩",
    "🏆"
];

function renderAdventureMap() {

    const map = $("#adventureMap");

    if (!map) return;

    const completedCount = adventureOrder.filter(index =>
        state.completed.includes(index)
    ).length;

    const percentage =
        completedCount / adventureOrder.length * 100;

    if ($("#adventureProgressText")) {
        $("#adventureProgressText").textContent =
            `${completedCount} dari 15 pulau selesai`;
    }

    if ($("#adventureProgressFill")) {
        $("#adventureProgressFill").style.width =
            `${percentage}%`;
    }

    if ($("#adventureStars")) {
        $("#adventureStars").textContent = state.stars;
    }

    if ($("#adventurePlayerName")) {
        $("#adventurePlayerName").textContent = state.name;
    }

    let rank = "Penjelajah Pemula";

    if (completedCount >= 5) rank = "Petualang Muda";
    if (completedCount >= 10) rank = "Jago Pecahan";

    if (completedCount === 15) {
        rank = "Master Pecahan 🏆";
    }

    if ($("#adventureRank")) {
        $("#adventureRank").textContent = rank;
    }


    // Membuat 15 pulau berdasarkan urutan tingkat.
    map.innerHTML = adventureOrder.map((lessonIndex, position) => {

        const lesson = lessons[lessonIndex];

        const isCompleted =
            state.completed.includes(lessonIndex);

        const previousLesson =
            position > 0 ?
            adventureOrder[position - 1] :
            null;

        const isUnlocked =
            position === 0 ||
            state.completed.includes(previousLesson);

        let status = "Terkunci";
        let icon = "🔒";
        let className = "is-locked";

        if (isCompleted) {

            status = "Selesai";
            icon = "✅";
            className = "is-completed";

        } else if (isUnlocked) {

            status = "Mulai petualangan";
            icon = islandIcons[position];
            className = "is-unlocked";
        }

        const levelLabel =
            position < 5 ?
            "DASAR" :
            position < 10 ?
            "MENENGAH" :
            "LANJUTAN";

        return `
            <button
                type="button"
                class="adventure-level ${className}"
                data-adventure-level="${lessonIndex}">

                <span class="adventure-island">
                    ${icon}
                </span>

                <span class="adventure-level-number">
                    ${levelLabel} · ${position + 1}
                </span>

                <strong class="adventure-level-title">
                    ${lesson[0]}
                </strong>

                <span class="adventure-level-status">
                    ${status}
                </span>

            </button>
        `;

    }).join("");


    if (map.dataset.listenerAttached !== "true") {

        map.addEventListener("click", event => {

            const button = event.target.closest(
                "[data-adventure-level]"
            );

            if (!button) return;

            const lessonIndex =
                Number(button.dataset.adventureLevel);

            const position =
                adventureOrder.indexOf(lessonIndex);

            if (position < 0) return;

            const previousLesson =
                position > 0 ?
                adventureOrder[position - 1] :
                null;

            const isUnlocked =
                position === 0 ||
                state.completed.includes(previousLesson);

            if (!isUnlocked) {
                toast("Selesaikan pulau sebelumnya dahulu! 🔒");
                return;
            }

            showPage("materials");
            openLesson(lessonIndex);

            toast(
                `Petualangan dimulai: ${lessons[lessonIndex][0]}! 🚀`
            );
        });

        map.dataset.listenerAttached = "true";
    }
}


// =====================================================
// 11. STUDIO VISUAL PECAHAN
// =====================================================

const wholeParts = $("#wholeParts");
const coloredParts = $("#coloredParts");

if (wholeParts) {
    wholeParts.addEventListener("change", updateFraction);
}

if (coloredParts) {
    coloredParts.addEventListener("input", updateFraction);
}

function updateFraction() {

    if (!wholeParts || !coloredParts) return;

    const total = Number(wholeParts.value);

    coloredParts.max = total;

    if (Number(coloredParts.value) > total) {
        coloredParts.value = total;
    }

    const colored = Number(coloredParts.value);
    const shape = $("#fractionShape");

    if (shape) {

        shape.innerHTML = Array.from({ length: total },
            (_, index) => `
                <span class="${index < colored ? "filled" : ""}"></span>
            `
        ).join("");

        shape.style.gridTemplateColumns =
            `repeat(${Math.min(total, 5)}, 25px)`;
    }

    if ($("#fractionText")) {
        $("#fractionText").textContent =
            `${colored}/${total}`;
    }

    if ($("#fractionExplain")) {
        $("#fractionExplain").textContent =
            `${colored} dari ${total} bagian diwarnai.`;
    }
}


// =====================================================
// 12. GAME PETUALANGAN PECAHAN
// =====================================================

const gameQuestions = [

    {
        total: 4,
        shaded: 2,
        options: ["1/4", "2/4", "3/4", "4/4"],
        explanation: "Ada 2 bagian diarsir dari 4 bagian seluruhnya."
    },

    {
        total: 3,
        shaded: 1,
        options: ["1/3", "2/3", "1/2", "3/3"],
        explanation: "Ada 1 bagian diarsir dari 3 bagian seluruhnya."
    },

    {
        total: 6,
        shaded: 3,
        options: ["2/6", "3/6", "4/6", "5/6"],
        explanation: "Ada 3 bagian diarsir dari 6 bagian seluruhnya."
    },

    {
        total: 8,
        shaded: 4,
        options: ["2/8", "3/8", "4/8", "5/8"],
        explanation: "Ada 4 bagian diarsir dari 8 bagian seluruhnya."
    },

    {
        total: 8,
        shaded: 5,
        options: ["3/8", "4/8", "5/8", "6/8"],
        explanation: "Ada 5 bagian diarsir dari 8 bagian seluruhnya."
    }

];

let gameIndex = 0;
let gameAnswered = false;
let gameSessionScore = 0;
let gameCompleted = false;


// Membuat ilustrasi pizza SVG.
function createPizzaSVG(total, shaded) {

    const center = 110;
    const radius = 79;

    let slices = "";

    for (let index = 0; index < total; index++) {

        const startAngle = -90 + (index * 360 / total);
        const endAngle = -90 + ((index + 1) * 360 / total);

        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);

        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = (360 / total) > 180 ? 1 : 0;

        const fill =
            index < shaded ? "#FF984B" : "#FFE5AE";

        slices += `
            <path
                d="M ${center} ${center}
                   L ${x1.toFixed(2)} ${y1.toFixed(2)}
                   A ${radius} ${radius} 0 ${largeArc} 1
                   ${x2.toFixed(2)} ${y2.toFixed(2)}
                   Z"
                fill="${fill}"
                stroke="#FFFDF7"
                stroke-width="3.5"
                stroke-linejoin="round"
            />
        `;
    }

    return `
        <svg class="pizza-svg"
             viewBox="0 0 220 220"
             xmlns="http://www.w3.org/2000/svg"
             role="img">

            <title>Pizza ${shaded} dari ${total} bagian diarsir</title>

            <circle cx="110" cy="110" r="91" fill="#C98243"/>
            <circle cx="110" cy="110" r="85" fill="#F8C66C"/>

            ${slices}

        </svg>
    `;
}


// Menyiapkan tampilan game.
function prepareGameMarkup() {

    const gameContent = $(".game-content");

    if (!gameContent) return;

    gameContent.innerHTML = `
        <div class="game-illustration" id="pizzaIllustration"></div>

        <div class="game-question">

            <h2 id="gameQuestionTitle">
                Berapa bagian pizza yang diarsir?
            </h2>

            <p class="muted" id="gameQuestionDescription"></p>

            <div class="answer-options" id="gameOptions"></div>

            <p id="gameFeedback"
               class="feedback"
               aria-live="polite"></p>

            <button class="btn btn-primary"
                    id="nextGame"
                    hidden>
                Soal berikutnya →
            </button>

        </div>
    `;

    const badgeElement = $(".game-badge");

    if (badgeElement) {
        badgeElement.id = "gameBadge";
    }

    $("#nextGame").addEventListener("click", nextGameQuestion);

    $("#gameOptions").addEventListener("click", handleGameAnswer);
}


// Menampilkan soal game.
function renderGame() {

    const question = gameQuestions[gameIndex];

    if (!question) return;

    gameAnswered = false;
    gameCompleted = false;

    if ($("#gameBadge")) {
        $("#gameBadge").textContent =
            `TANTANGAN ${String(gameIndex + 1).padStart(2, "0")}/05`;
    }

    $("#gameQuestionTitle").textContent =
        "Berapa bagian pizza yang diarsir?";

    $("#gameQuestionDescription").textContent =
        `Pizza dibagi menjadi ${question.total} bagian sama besar. ` +
        `${question.shaded} bagian diarsir.`;

    $("#pizzaIllustration").style.display = "grid";

    $("#pizzaIllustration").innerHTML =
        createPizzaSVG(question.total, question.shaded);

    $("#gameOptions").style.display = "grid";

    $("#gameOptions").innerHTML =
        question.options.map(answer => `
            <button type="button" data-answer="${answer}">
                ${answer}
            </button>
        `).join("");

    $("#gameFeedback").textContent = "";
    $("#gameFeedback").className = "feedback";

    $("#nextGame").hidden = true;

    $("#nextGame").textContent =
        gameIndex === gameQuestions.length - 1 ?
        "Lihat hasil →" :
        "Soal berikutnya →";
}


// Periksa jawaban game.
function handleGameAnswer(event) {

    const button = event.target.closest("button[data-answer]");

    if (!button || gameAnswered || gameCompleted) return;

    gameAnswered = true;

    const question = gameQuestions[gameIndex];

    const correctAnswer =
        `${question.shaded}/${question.total}`;

    const selectedAnswer = button.dataset.answer;
    const isCorrect = selectedAnswer === correctAnswer;

    $$("#gameOptions button").forEach(option => {

        option.disabled = true;
        option.classList.remove("selected");

        if (option.dataset.answer === correctAnswer) {
            option.classList.add("game-correct");
        }
    });

    button.classList.add("selected");

    const feedback = $("#gameFeedback");

    if (isCorrect) {

        gameSessionScore++;

        state.stars += 5;
        state.gameWins++;

        save();

        feedback.textContent =
            "Benar sekali! Kamu mendapat 5 bintang ⭐";

        feedback.className = "feedback";

    } else {

        feedback.textContent =
            `Belum tepat. Jawaban yang benar adalah ${correctAnswer}. ` +
            question.explanation;

        feedback.className = "feedback error";
    }

    $("#nextGame").hidden = false;
}


// Lanjut atau ulangi permainan.
function nextGameQuestion() {

    if (gameCompleted) {

        gameIndex = 0;
        gameSessionScore = 0;

        renderGame();
        return;
    }

    if (gameIndex < gameQuestions.length - 1) {

        gameIndex++;
        renderGame();

    } else {

        showGameResult();

    }
}


// Hasil akhir game.
function showGameResult() {

    gameCompleted = true;

    $("#gameBadge").textContent = "PETUALANGAN SELESAI";

    $("#gameQuestionTitle").textContent =
        "Petualanganmu selesai!";

    $("#gameQuestionDescription").textContent =
        `Kamu menjawab ${gameSessionScore} dari 5 soal dengan benar.`;

    $("#pizzaIllustration").style.display = "none";
    $("#gameOptions").style.display = "none";

    $("#gameFeedback").textContent =
        `Kamu memperoleh ${gameSessionScore * 5} bintang dari tantangan ini! ⭐`;

    $("#gameFeedback").className = "feedback";

    $("#nextGame").hidden = false;
    $("#nextGame").textContent = "Ulangi 5 soal ↻";
}


// =====================================================
// 13. KUIS PECAHAN
// =====================================================

const questions = [

    {
        q: "Berapa hasil dari 1/2 + 1/2?",
        a: ["1/2", "2/4", "1", "2"],
        correct: "1",
        why: "Setengah ditambah setengah menjadi satu utuh."
    },

    {
        q: "Pada pecahan 3/5, angka 5 disebut apa?",
        a: ["Pembilang", "Penyebut", "Hasil", "Bilangan bulat"],
        correct: "Penyebut",
        why: "Penyebut menunjukkan jumlah seluruh bagian yang sama besar."
    },

    {
        q: "Manakah pecahan yang senilai dengan 1/2?",
        a: ["1/3", "2/4", "3/4", "2/3"],
        correct: "2/4",
        why: "1/2 dan 2/4 menunjukkan bagian yang sama besar."
    },

    {
        q: "Mana yang lebih besar?",
        a: ["1/4", "3/4", "Sama besar", "Tidak bisa dibandingkan"],
        correct: "3/4",
        why: "Dengan penyebut sama, pembilang 3 lebih besar daripada 1."
    },

    {
        q: "Sebuah kue dibagi 8 bagian. Kamu mengambil 3 bagian. Pecahannya adalah...",
        a: ["8/3", "3/8", "3/5", "5/8"],
        correct: "3/8",
        why: "Tiga bagian diambil dari delapan bagian seluruhnya."
    }

];

let qIndex = 0;
let selected = null;
let points = 0;
let answered = false;


// Memulai kuis.
function startQuiz() {

    qIndex = 0;
    selected = null;
    points = 0;
    answered = false;

    $("#quizArea").hidden = false;
    $("#quizResult").hidden = true;

    renderQuestion();
}


// Menampilkan pertanyaan.
function renderQuestion() {

    const question = questions[qIndex];

    if (!question) return;

    selected = null;
    answered = false;

    $("#questionNumber").textContent =
        `PERTANYAAN ${qIndex + 1} DARI ${questions.length}`;

    $("#quizPoints").textContent =
        `⭐ ${points} poin`;

    $("#quizProgress").style.width =
        `${(qIndex + 1) / questions.length * 100}%`;

    $("#questionText").textContent = question.q;

    $("#quizFeedback").textContent = "";
    $("#quizFeedback").className = "feedback";

    $("#quizChoices").innerHTML =
        question.a.map((answer, index) => `
            <button class="quiz-choice" data-choice="${answer}">
                ${String.fromCharCode(65 + index)}. ${answer}
            </button>
        `).join("");

    $$(".quiz-choice").forEach(button => {

        button.addEventListener("click", () => {

            if (answered) return;

            selected = button.dataset.choice;

            $$(".quiz-choice").forEach(choice => {
                choice.classList.toggle(
                    "selected",
                    choice === button
                );
            });

            $("#submitAnswer").disabled = false;
        });
    });

    $("#submitAnswer").hidden = false;
    $("#submitAnswer").disabled = true;

    $("#nextQuestion").hidden = true;
}


// Periksa jawaban.
if ($("#submitAnswer")) {

    $("#submitAnswer").addEventListener("click", () => {

        if (!selected || answered) return;

        answered = true;

        const question = questions[qIndex];
        const correct = selected === question.correct;

        if (correct) {
            points += 10;
        }

        $("#quizFeedback").textContent =
            (correct ? "Benar! Hebat! ⭐ " : "Belum tepat. ") +
            question.why;

        $("#quizFeedback").className =
            correct ? "feedback" : "feedback error";

        $$(".quiz-choice").forEach(button => {

            if (button.dataset.choice === question.correct) {
                button.style.borderColor = "#34D399";
            }

            if (
                button.dataset.choice === selected &&
                !correct
            ) {
                button.style.borderColor = "#FB7185";
            }
        });

        $("#quizPoints").textContent =
            `⭐ ${points} poin`;

        $("#submitAnswer").hidden = true;
        $("#nextQuestion").hidden = false;
    });
}


// Lanjut pertanyaan.
if ($("#nextQuestion")) {

    $("#nextQuestion").addEventListener("click", () => {

        qIndex++;

        if (qIndex < questions.length) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    });
}


// Selesaikan kuis.
function finishQuiz() {

    state.quizzes.unshift({
        date: new Date().toLocaleDateString("id-ID"),
        score: points
    });

    state.stars += points / 2;

    save();

    $("#quizArea").hidden = true;
    $("#quizResult").hidden = false;

    $("#quizResult").innerHTML = `
        <div class="trophy">🏆</div>

        <h2>Kuis selesai!</h2>

        <p class="muted">
            Kamu sudah berusaha dengan hebat.
        </p>

        <strong>${points}/50</strong>

        <p>poin terkumpul</p>

        <button class="btn btn-primary" id="retryQuiz">
            Ulangi kuis
        </button>
    `;

    $("#retryQuiz").addEventListener("click", startQuiz);
}


// =====================================================
// 14. PROGRES BELAJAR PER TINGKAT
// =====================================================

function renderProgress() {

    const lessonList = $("#progressLessonList");
    const history = $("#quizHistory");

    if (!lessonList || !history) return;

    lessonList.innerHTML = Object.entries(materialLevels).map(
        ([key, level]) => {

            const rows = level.lessonIndexes.map((index, position) => {

                const done = state.completed.includes(index);
                const localNumber = position + 1;

                return `
                    <div class="progress-line">

                        <span>
                            ${localNumber}. ${lessons[index][0]}
                        </span>

                        <span class="${done ? "done-label" : ""}">
                            ${done
                                ? "✓ Selesai"
                                : "Belum dipelajari"}
                        </span>

                    </div>
                `;
            }).join("");

            return `
                <div class="progress-level-group">
                    <h3>${level.emoji} ${level.title}</h3>
                    ${rows}
                </div>
            `;
        }
    ).join("");


    if (state.quizzes.length > 0) {

        history.innerHTML = state.quizzes.map(quiz => `

            <div class="history-item">
                <span>📝 Kuis pecahan · ${quiz.date}</span>
                <b>${quiz.score}/50 poin</b>
            </div>

        `).join("");

    } else {

        history.innerHTML = `
            <p class="muted">
                Belum ada kuis yang diselesaikan.
                Yuk coba kuis pertamamu!
            </p>
        `;
    }
}


// =====================================================
// 15. PROFIL SISWA
// =====================================================

if ($("#saveProfile")) {

    $("#saveProfile").addEventListener("click", () => {

        const nameInput = $("#studentName");
        const feedback = $("#profileFeedback");

        const name = nameInput.value.trim();

        if (!name) {

            feedback.textContent =
                "Nama tidak boleh kosong.";

            feedback.className =
                "feedback error";

            return;
        }

        state.name = name;

        save();

        feedback.textContent =
            "Profil berhasil disimpan!";

        feedback.className = "feedback";

        toast(`Halo, ${name}! 👋`);
    });
}

if ($("#studentName")) {
    $("#studentName").value = state.name;
}


// =====================================================
// 16. DASHBOARD DAN UPDATE PROGRES
// =====================================================

function updateDashboard() {

    const completedCount = state.completed.filter(index =>
        Number.isInteger(index) &&
        index >= 0 &&
        index < lessons.length
    ).length;

    if ($("#greetingName")) {
        $("#greetingName").textContent = state.name;
    }

    if ($("#starTotal")) {
        $("#starTotal").textContent = state.stars;
    }

    if ($("#progressStars")) {
        $("#progressStars").textContent = state.stars;
    }

    if ($("#materialTotal")) {
        $("#materialTotal").textContent = `${completedCount}/15`;
    }

    if ($("#progressMaterials")) {
        $("#progressMaterials").textContent = `${completedCount}/15`;
    }

    if ($("#quizTotal")) {
        $("#quizTotal").textContent = state.quizzes.length;
    }

    if ($("#progressQuizzes")) {
        $("#progressQuizzes").textContent = state.quizzes.length;
    }

    if ($("#gameScore")) {
        $("#gameScore").textContent =
            `Jawaban benar: ${state.gameWins}`;
    }

    if ($("#streakCount")) {
        $("#streakCount").textContent = completedCount || 1;
    }

    if ($("#homeStreakCount")) {
        $("#homeStreakCount").textContent = completedCount || 1;
    }

    if ($("#studentName")) {
        $("#studentName").value = state.name;
    }

    renderProgress();
    renderAdventureMap();
}


// =====================================================
// 17. INISIALISASI WEBSITE
// =====================================================

prepareGameMarkup();

renderLessons();

updateFraction();

updateDashboard();

renderGame();

startQuiz();

console.log("EduFun Magical Fraction World berhasil dimuat!");