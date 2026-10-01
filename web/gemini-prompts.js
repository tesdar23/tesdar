const TOOL_SYSTEM = `Kamu adalah "Jaja AI Content Creator Suite".
Jawab dalam bahasa Indonesia yang rapi, gunakan heading/bullet bila perlu.
Output harus langsung siap pakai untuk kreator konten (copy-paste).
Jika input kurang, buat versi asumsi yang wajar dan tulis asumsi yang kamu pakai.
Jangan mengarang info yang tidak diminta.`;

function buildPrompt(toolId, inputs) {
  const I = inputs || {};
  const brief = I.brief || "";
  const detail = I.detail || "";
  const topic = I.topic || "";
  const audience = I.audience || "";
  const style = I.style || "";
  const length = I.length || "sedang";
  const transcript = I.transcript || "";
  const reference = I.reference || "";

  const commonFooter = `\n\nKeluaran:
- Panjang: ${length}
- Gaya bahasa: ${style || "natural, kreatif, tegas"}
- Pastikan format rapi dan siap copy-paste.`;

  const templates = {
    // ===== MAIN MODULES =====
    pabrik: `Buat rencana produksi konten AI end-to-end dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Target audiens: ${audience}
${commonFooter}

Tolong hasilkan:
1) Ide konten (5 opsi)
2) Pilih 1 opsi terbaik (alasan)
3) Rencana langkah: Character/Script/Storyboard/Prompt/CTA
4) Checklist produksi (apa yang harus dibuat)`,

    character_gen: `Buat 1 karakter baru berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}
${commonFooter}

Wajib berikan:
1) Nama karakter + tagline
2) Deskripsi fisik (ringkas tapi jelas)
3) Kepribadian & nilai/goal utama
4) Cara bicara (tone + kosakata khas + kebiasaan kata)
5) Konflik internal + arc cerita (awal-tengah-akhir)
6) Hubungan karakter (jika relevan: 1-3 hubungan)
7) Contoh dialog (10 baris) dengan karakter fiktif (jangan meniru orang nyata).`,

    video_gen: `Buat konsep video berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}
${commonFooter}

Wajib berikan:
1) Hook 3 detik (3 variasi)
2) Outline 30–60 detik (sesuaikan length): per bagian (Hook-Value-CTA)
3) Shot list (shot 1..n) berisi:
   - Visual (apa yang dilihat)
   - Aksi/gerakan
   - Teks overlay (1 baris per shot)
   - Narasi/Voice Over (1–2 kalimat per shot)
4) CTA + caption pendek (caption 1 versi).
5) Catatan produksi (3–5 poin).`,

    prompt_pack: `Buat kumpulan prompt siap pakai untuk kebutuhan konten dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}
${commonFooter}

Wajib berikan:
A) Prompt Hook: 10 variasi (beda gaya & angle)
B) Prompt Script: 5 variasi (format Reels/TikTok 30–45 detik)
C) Prompt Caption + Hashtag: 5 paket (caption + 8–15 hashtag)
D) Prompt Storyboard: 5 prompt (shot-by-shot dengan deskripsi visual)
Formatkan masing-masing dengan nomor agar mudah dipakai.`,

    character_clone: `Buat "persona card" & "style guide" untuk karakter/voice fiktif berdasarkan referensi kepribadian (jangan meniru orang nyata).
Reference: ${reference}
Brief: ${brief}
Detail: ${detail}
${commonFooter}

Wajib:
1) Persona ringkas (1 paragraf)
2) Aturan gaya bicara:
   - Do (yang harus dilakukan)
   - Don't (yang harus dihindari)
3) Template kalimat khas (min 20)
4) Pola struktur kalimat (mis. pembuka-humor-bukti-CTA, dll.)
5) Contoh dialog 12 baris (antar karakter fiktif, konsisten dengan persona).`,

    image_gen: `Buat prompt gambar dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Style: ${style}
${commonFooter}

Wajib:
1) 1 prompt utama super detail (subjek, background, lighting, mood, komposisi)
2) 4 variasi prompt (beda angle/lighting/pose)
3) Negative prompt (8–15 item)
4) Catatan komposisi (rule of thirds).`,

    ugc: `Buat script UGC (User Generated Content) iklan/call-to-action berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}
${commonFooter}

Wajib:
1) Hook (3 versi)
2) Skema video: Problem -> Solusi -> Bukti -> CTA
3) Dialog natural seperti creator (gaya bicara santai)
4) Overlay text per scene (minimal 6 scene)
5) Caption + CTA akhir (1 versi).`,

    influencer_maker: `Buat paket brand influencer berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}
${commonFooter}

Wajib:
1) Profil influencer: bio + tone (cara ngomong + karakter konten)
2) 3 pilar konten (masing-masing 3 bullets)
3) Tabel 30 ide konten: (Tanggal/Urutan, Format, Topik, Angle, CTA)
4) 5 template script Reels/TikTok (format: Hook->Value->CTA)
5) Bio + CTA versi pendek (1–2 kalimat).`,

    // ===== PABRIK KONTEN SUB-MODULES =====
    music_clip_v2: `Buat konsep music clip dari brief berikut.
Brief: ${brief}
Detail: ${detail}
${commonFooter}

Wajib:
1) Tema lagu + mood (2–3 kata)
2) Lirik fiktif (jangan menyebut artis asli):
   - Hook 8 bar
   - Verse 8 bar
3) Storyboard musik video (min 8 scene):
   - Untuk tiap scene: visual + emosi + perubahan setting
4) Shot list (shot 1..n) + deskripsi visual
5) Voice/Adlib cue per bagian (Hook/Verse)
6) Prompt visual keyframe (min 5) siap pakai untuk generator gambar.`,

    drama_pendek_v2: `Buat naskah drama pendek berdasarkan brief berikut.
