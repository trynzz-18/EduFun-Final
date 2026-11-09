# EduFun – Sistem Musik dan Efek Suara

## Yang ditambahkan

- Musik latar orisinal untuk Beranda/Peta Petualangan (`adventure-theme.mp3`).
- Musik lebih tenang untuk Materi, Kuis, Progres, dan Profil (`learning-theme.mp3`).
- Musik lebih bersemangat untuk mini-game (`game-theme.mp3`).
- Efek suara sintetis orisinal untuk klik, memilih kartu, jawaban benar/salah, kemenangan, dan waktu habis.
- Panel kontrol suara di topbar untuk mengaktifkan musik, mengatur volume, mengaktifkan efek suara, atau mematikan semuanya.
- Pengaturan tersimpan di LocalStorage dengan kunci `edufun-audio-settings-v1`.

## Volume dan autoplay

Volume musik awal adalah 80% agar terdengar jelas. Pemutaran dimulai pada interaksi pertama pengguna (klik, ketuk, atau tombol keyboard), karena browser modern umumnya memblokir autoplay bersuara sebelum ada interaksi pengguna. Pengguna bisa mengatur volume hingga 100% atau mematikan suara kapan saja dari ikon speaker di topbar.

## File terkait

- `js/audio-manager.js`
- `assets/audio/adventure-theme.mp3`
- `assets/audio/learning-theme.mp3`
- `assets/audio/game-theme.mp3`
- `index.html` dan `css/style.css` memuat kontrol audionya.

Jalankan project dari Live Server/localhost agar jalur file audio terbaca dengan benar.
