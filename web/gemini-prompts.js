const TOOL_SYSTEM = `Kamu adalah "Jaja AI Content Creator Suite".
Jawab dalam bahasa Indonesia yang rapi, pakai heading/bullet.
Output harus langsung siap copy-paste.
Jika input kurang, buat asumsi yang wajar dan tulis asumsi tersebut.
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

  const commonFooter =
    `\n\nKeluaran:\n- Panjang: ${length}\n- Gaya bahasa: ${style || "natural, kreatif, tegas"}\n- Format rapi, siap copy-paste.`;

  const templates = {
    // ===== MAIN MODULES =====
    pabrik: `Buat rencana produksi konten AI end-to-end dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Target audiens: ${audience}${commonFooter}

Tolong hasilkan:
1) Ide konten (5 opsi)
2) Pilih 1 opsi terbaik (alasan)
3) Rencana langkah: Character/Script/Storyboard/Prompt/CTA
4) Checklist produksi (apa yang harus dibuat).`,

    character_gen: `Buat 1 karakter baru berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}${commonFooter}

Wajib:
1) Nama + tagline
2) Deskripsi fisik + kepribadian
3) Nilai/goal karakter
4) Cara bicara (tone/kosakata khas)
5) Konflik internal + arc cerita singkat
6) Contoh dialog 10 baris (fiktif).`,

    video_gen: `Buat konsep video berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}${commonFooter}

Wajib:
1) Hook 3 variasi
2) Outline 30–60 detik (atau sesuai length)
3) Shot list: Visual + aksi + overlay teks + Voice Over per shot
4) CTA + caption pendek (1 versi)
5) Catatan produksi (3–5 poin).`,

    prompt_pack: `Buat kumpulan prompt siap pakai untuk konten dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}${commonFooter}

Wajib:
- 10 prompt hook (variasi angle/gaya)
- 5 prompt script (Reels/TikTok 30–45 detik)
- 5 paket caption + 8–15 hashtag
- 5 prompt storyboard (shot-by-shot).`,

    character_clone: `Buat persona card & style guide untuk karakter/voice fiktif berdasarkan reference berikut (jangan meniru orang nyata).
Reference: ${reference}
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) Persona ringkas
2) Do/Don't gaya bicara
3) Template kalimat khas (min 20)
4) Pola struktur kalimat
5) Contoh dialog 12 baris antar karakter fiktif (konsisten).`,

    image_gen: `Buat prompt gambar dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Style: ${style}${commonFooter}

Wajib:
1) 1 prompt utama super detail
2) 4 variasi prompt (beda angle/lighting/pose)
3) Negative prompt 8–15 item
4) Catatan komposisi (rule of thirds).`,

    ugc: `Buat script UGC (iklan/call-to-action) berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}${commonFooter}

Wajib:
1) Hook 3 versi
2) Skema Problem -> Solusi -> Bukti -> CTA
3) Dialog natural
4) Overlay text per scene (min 6 scene)
5) Caption + CTA akhir (1 versi).`,

    influencer_maker: `Buat paket brand influencer dari brief berikut.
Brief: ${brief}
Detail: ${detail}
Audiens: ${audience}${commonFooter}

Wajib:
1) Bio + tone
2) 3 pilar konten (masing-masing 3 bullets)
3) Tabel 30 ide konten (Urutan/Format/Topik/Angle/CTA)
4) 5 template script Reels/TikTok (Hook->Value->CTA)
5) Bio + CTA pendek.`,

    // ===== PABRIK KONTEN SUBMODULES =====
    music_clip_v2: `Buat konsep music clip dari brief berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) Tema lagu + mood
2) Lirik fiktif: Hook 8 bar + Verse 8 bar
3) Storyboard musik video min 8 scene (visual + emosi)
4) Shot list
5) Prompt keyframe gambar min 5.`,

    drama_pendek_v2: `Buat naskah drama pendek berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) Logline
2) 2–4 karakter + motivasi
3) Struktur 3 babak ringkas
4) Scene per scene: Scene ID, lokasi, aksi, dialog
5) Twist
6) Ending (emosi/pembelajaran).`,

    scene_extractor: `Ekstrak scene dari transcript berikut.
Transcript:
${transcript}

Brief (opsional):
${brief}${commonFooter}

Wajib:
- Scene 1..n
- Tiap scene: tujuan emosi, lokasi, karakter, aksi, dan subtitle hook 1 kalimat
- Jika tak ada timestamp, estimasi durasi tiap scene (wajar).`,

    jaja_drama_studio: `Buat paket produksi drama dari brief berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) Ringkasan cerita (3–5 kalimat)
2) Breakdown scene (shoot plan)
3) List properti & kostum
4) Script narasi + dialog minimal 8 scene
5) Rencana posting: judul, caption+CTA, hashtag 8–15.`,

    jaja_podcast: `Buat episode podcast berdasarkan brief berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) Judul episode
2) Hook pembuka (1–2 menit versi script)
3) Outline min 6 segmen (topik + poin utama)
4) Draft skrip MC (intro/transisi/outro)
5) 5 bullet takeaways
6) CTA + deskripsi show.`,

    frame_extractor: `Buat daftar frame/visual beats dari cerita/script berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
- Minimal 12 frame
- Format: Frame # (deskripsi visual + aksi + teks overlay maks 1 kalimat).`,

    meta_ads: `Buat materi Meta Ads dari brief berikut.
Brief: ${brief}
Detail: ${detail}${commonFooter}

Wajib:
1) 10 Primary Text
2) 10 Headline
3) 10 Description
4) 3 variasi angle kreatif (tabel: Angle/Benefit/Proof/CTA)
5) Rekomendasi CTA terbaik + positioning audience.`,

  };

  const tpl = templates[toolId];
  if (!tpl) throw new Error(`Unknown toolId: ${toolId}`);

  return `${TOOL_SYSTEM}\n\n${tpl}`;
}

export { buildPrompt };
