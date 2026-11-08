# EduFun – Magical Fraction World

Versi Adventure Mode sesuai spesifikasi:

1. **Pulau Mudah – Domino Pecahan**: lima stage dengan rantai kartu pecahan angka dan ilustrasi yang cocok secara tepat.
2. **Pulau Menengah – Arsir Pizza**: lima stage; pemain memilih potongan pizza untuk menunjukkan pecahan yang diminta.
3. **Pulau Sulit – Penjumlahan Kotak**: lima stage penjumlahan pecahan dengan penyebut disamakan menggunakan KPK.

## Fitur Adventure Mode

- Terdapat 3 pulau dan 15 stage.
- Stage dibuka secara berurutan; Pulau Menengah terbuka setelah Pulau Mudah selesai dan Pulau Sulit setelah Pulau Menengah selesai.
- Bintang hanya diberikan satu kali pada penyelesaian pertama.
- Tersedia batas waktu per stage, tombol ulangi, kembali ke peta, serta reset progres petualangan.
- Reset Adventure Mode tidak menghapus progres materi dan kuis.

## Domino Pecahan

- Pulau Mudah memiliki lima stage.
- Setiap kartu memuat pecahan angka di satu sisi dan ilustrasi bagian yang diarsir di sisi lainnya.
- Rantai harus cocok secara tepat. Contoh: gambar 2 dari 4 bagian diikuti kartu dengan pecahan angka 2/4, bukan 1/2 meskipun nilainya setara.
- Ilustrasi bervariasi, antara lain pizza, semangka, bunga, sarang lebah, segitiga, dan kotak.
- Setiap stage memiliki kartu pengecoh dan mendukung pemilihan kartu dengan klik/ketuk.

## Musik dan efek suara

- Musik latar orisinal untuk Beranda/Peta Petualangan, Materi/Kuis, dan mini-game.
- Efek suara untuk interaksi, pemilihan kartu, jawaban benar/salah, kemenangan, dan waktu habis.
- Volume musik awal 80%, dapat diatur hingga 100% atau dimatikan melalui kontrol audio.
- Musik mulai setelah interaksi pertama pengguna karena pembatasan autoplay browser.
- File audio berada di `assets/audio/` dan dikelola oleh `js/audio-manager.js`.

## Struktur project

```text
EduFun-Final/
├── index.html
├── css/style.css
├── js/app.js
├── js/adventure-mode.js
├── js/real-game.js
├── js/audio-manager.js
└── assets/audio/
    ├── adventure-theme.mp3
    ├── learning-theme.mp3
    └── game-theme.mp3
```

## Menjalankan

Buka folder project di VS Code dan jalankan `index.html` menggunakan Live Server. Pastikan folder `assets/audio/` tetap berada pada path tersebut agar musik dapat dimuat.

## Teknologi

HTML, CSS, dan JavaScript Vanilla. Progres disimpan pada LocalStorage browser; tidak memerlukan backend atau database server.
