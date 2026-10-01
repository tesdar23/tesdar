import { buildPrompt } from "./gemini-prompts.js";

const MODEL = "gemini-1.5-pro";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const cfg = await fetch("./tools-config.json").then(r => r.json());

const title = document.querySelector("#title");
const subtitle = document.querySelector("#subtitle");
title.textContent = cfg.title;
subtitle.textContent = cfg.subtitle;

const modulesGrid = document.querySelector("#modulesGrid");
const panelTitle = document.querySelector("#panelTitle");
const subwrap = document.querySelector("#subwrap");

const hint = document.querySelector("#hint");
const form = document.querySelector("#form");
const fieldsBox = document.querySelector("#fields");
const result = document.querySelector("#result");
const output = document.querySelector("#output");

const apiKeyInput = document.querySelector("#apiKeyInput");
const saveKeyBtn = document.querySelector("#saveKeyBtn");
const apiKeyHint = document.querySelector("#apiKeyHint");

function setVisible(el, show) {
  el.style.display = show ? "" : "none";
}

function createField(fieldId) {
  const label = cfg.fieldLabels?.[fieldId] || fieldId;

  const wrap = document.createElement("div");
  wrap.className = "field";

  const l = document.createElement("label");
  l.textContent = label;

  let input;
  if (fieldId === "length") {
    input = document.createElement("select");
    ["singkat", "sedang", "panjang"].forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      input.appendChild(opt);
    });
    input.value = "sedang";
  } else {
    input = document.createElement(fieldId === "transcript" || fieldId === "reference" ? "textarea" : "textarea");
    input.placeholder = `Isi ${label}...`;
    if (fieldId === "transcript" || fieldId === "reference") {
      input.style.minHeight = "160px";
    }
  }

  input.name = fieldId;
  wrap.appendChild(l);
  wrap.appendChild(input);
  return wrap;
}

function renderFieldsForTool(toolId) {
  fieldsBox.innerHTML = "";

  const fields = cfg.fieldsByToolId?.[toolId] || ["brief", "detail", "length", "style"];
  fields.forEach(fid => fieldsBox.appendChild(createField(fid)));

  setVisible(form, true);
  setVisible(hint, false);
  setVisible(result, false);
  output.textContent = "";
}

function addCard(label, onClick, tag) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="label">${label}</div>
    ${tag ? `<div class="tag">${tag}</div>` : ""}
  `;
  card.addEventListener("click", onClick);
  return card;
}

// load saved key
function loadSavedKey() {
  const saved = localStorage.getItem("GEMINI_API_KEY") || "";
  apiKeyInput.value = saved;
  apiKeyHint.textContent = saved ? "API Key tersimpan ✅" : "Isi Gemini API Key untuk generate.";
}
saveKeyBtn.addEventListener("click", () => {
  if (!apiKeyInput.value.trim()) return alert("Masukkan API key dulu.");
  localStorage.setItem("GEMINI_API_KEY", apiKeyInput.value.trim());
  loadSavedKey();
});
loadSavedKey();

// Render module cards
cfg.modules.forEach(mod => {
  const hasItems = Array.isArray(mod.items) && mod.items.length > 0;

  const card = addCard(mod.label, () => {
    panelTitle.textContent = mod.label;

    // reset
    subwrap.innerHTML = "";
    subwrap.style.display = "none";
    output.textContent = "";
    window._selectedToolId = null;

    if (hasItems) {
      setVisible(form, false);
      setVisible(result, false);
      hint.style.display = "none";

      subwrap.style.display = "";
      mod.items.forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = item.label;
        btn.addEventListener("click", () => {
          panelTitle.textContent = item.label;
          window._selectedToolId = item.id;
          renderFieldsForTool(item.id);

          // biar sub pilihan tidak hilang
          hint.style.display = "none";
        });
        subwrap.appendChild(btn);
      });
    } else {
      setVisible(form, true);
      setVisible(result, false);
      renderFieldsForTool(mod.id);
      window._selectedToolId = mod.id;
      hint.style.display = "none";
    }
  }, null);

  modulesGrid.appendChild(card);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const toolId = window._selectedToolId;
  if (!toolId) return alert("Pilih tool dulu.");

  const apiKey = (apiKeyInput.value || "").trim();
  if (!apiKey) return alert("Isi Gemini API Key dulu (panel atas).");

  const inputs = {};
  new FormData(form).forEach((v, k) => {
    const s = String(v ?? "").trim();
    if (s) inputs[k] = s;
  });
  if (!inputs.length) inputs.length = "sedang";

  const prompt = buildPrompt(toolId, inputs);

  setVisible(result, true);
  output.textContent = "Generating...";

  try {
    const url = `${API_BASE}/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || "Gagal generate Gemini");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    output.textContent = text || "(No output)";
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
