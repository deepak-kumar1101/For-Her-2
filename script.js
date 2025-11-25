// script.js — updated: images wired to uploaded files, lightbox + download, responsive fit
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", () => (nav.style.display = nav.style.display === "flex" ? "none" : "flex"));

  // Photos from uploaded files (absolute local paths you provided)
  const photos = document.getElementById("photos");
  const photoFiles = [
    "images/6d6729a7-a539-4dbd-9f84-47015f2e92e3.jpg",
    "images/7db2f33e-a603-49c2-a660-26e150733401.jpg",
    "images/8c387c28-38a2-4337-b182-7a1deb33d074.jpg",
    "images/199f54f3-6eb9-4990-8074-eb826c77decf.jpg",
    "images/08463a17-c2e9-4ff4-bfed-1fc586281146.jpg",
    "images/c8f2b91e-c038-49d1-a788-ff9074bb788b.jpg",
    "images/c68ae3f5-532b-4199-9ef6-0714cb9b9800.jpg",
    "images/fe8cfe04-83ac-45f0-a25c-2c0dd2758b7a.jpg"
  ];

  // populate grid with actual images (fits and clickable)
  photoFiles.forEach((src, idx) => {
    const i = idx + 1;
    const d = document.createElement("div");
    d.className = "photo";
    d.dataset.index = i;
    d.innerHTML = `<img src="${src}" alt="Photo ${i}" loading="lazy">`;
    d.addEventListener("click", () => openLightbox(i, src));
    photos.appendChild(d);
  });

  // Lightbox (now accepts src and provides download)
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCaption = document.getElementById("lbCaption");
  // add a download anchor dynamically (if not present)
  let lbDownload = document.getElementById('lbDownload');
  if (!lbDownload) {
    lbDownload = document.createElement('a');
    lbDownload.id = 'lbDownload';
    lbDownload.className = 'lb-download';
    lbDownload.textContent = 'Download';
    lbDownload.setAttribute('download','photo.jpg');
    const lbContent = document.querySelector('.lb-content');
    if (lbContent) lbContent.appendChild(lbDownload);
  }
  const lbCloseBtn = document.getElementById("lbClose");
  if (lbCloseBtn) lbCloseBtn.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });

  function openLightbox(i, src) {
    if (!lbImg) return;
    lbImg.src = src || placeholderSVG(i);
    lbImg.alt = 'Photo ' + i;
    lbCaption.textContent = "Photo " + i + " — Our memory";
    // set download href & suggested filename
    lbDownload.href = src || '';
    lbDownload.setAttribute('download', `photo${i}.jpg`);
    // show lightbox
    lightbox.style.display = "flex";
    lightbox.setAttribute("aria-hidden", "false");
    // prevent body scroll while open
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.style.display = "none";
    lightbox.setAttribute("aria-hidden", "true");
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function placeholderSVG(i) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%23ff8fab'/><stop offset='1' stop-color='%23ffd166'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' font-size='54' text-anchor='middle' fill='white' font-family='Arial'>Photo ${i}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // Candle animation
  const candleBtn = document.getElementById("candleBtn");
  const candle = document.getElementById("candle");
  if (candleBtn && candle) candleBtn.addEventListener("click", () => {
    candle.style.opacity = 1;
    candle.style.transform = "translateY(0)";
    setTimeout(() => (candle.style.opacity = 0), 4000);
  });

  // Audio playback (expects heeriye.mp3 in same site folder OR change path)
  const playBtn = document.getElementById("playBtn");
  let audioCtx, audioElement, track, gainNode;
  let isPlaying = false;
  function setupAudio() {
    if (audioCtx) return;
    // if you copied mp3 into site folder, use 'heeriye.mp3'
    audioElement = new Audio('heeriye.mp3'); // uploaded file path
    audioElement.crossOrigin = "anonymous";
    audioElement.loop = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    track = audioCtx.createMediaElementSource(audioElement);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.0001;
    track.connect(gainNode).connect(audioCtx.destination);
  }
  if (playBtn) playBtn.addEventListener("click", () => {
    if (!audioCtx) { setupAudio(); setupAnalyzer(); }
    if (!isPlaying) {
      audioCtx.resume().then(() => {
        audioElement.play();
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 1.2);
        document.body.classList.add("playing");
        isPlaying = true;
      });
    } else {
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      setTimeout(() => { audioElement.pause(); document.body.classList.remove('playing'); isPlaying = false; }, 900);
    }
  });

  // visualizer (optional - basic)
  const visual = document.getElementById("visualizer");
  let analyser, dataArray;
  function setupAnalyzer() {
    if (!audioCtx) return;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    track.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    animateVisualizer();
  }
  function animateVisualizer() {
    if (!analyser) return;
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      let v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    let rms = Math.sqrt(sum / dataArray.length);
    let scale = 1 + Math.min(0.9, rms * 3.0);
    if (visual) visual.style.transform = "scale(" + scale + ")";
    requestAnimationFrame(animateVisualizer);
  }

  // Timeline items (same)
  const timelineItems = [
    { date: "2018-01-11", title: "Official Mohbbat", note: "Ghr k Darwaze se daat dikhake dekhna." },
    { date: "2024-11-26", title: "Apka Janmdin", note: "Gopal Sweet Pe Cake Cutting." },
    { date: "Date ni pta😅", title: "Home Visit", note: "Phli Baar Ghar Ayyi Thi Yaad H?" },
    { date: "", title: "---------", note: "ek memory tu bhi bta." },
  ];
  const tl = document.getElementById("timelineItems");
  if (tl) timelineItems.forEach((it) => {
    const div = document.createElement("div");
    div.className = "timeline-item";
    div.innerHTML = `<div style="font-weight:700">${it.title} <span style="color:var(--muted);font-size:12px">• ${it.date}</span></div><div style="margin-top:6px;color:var(--muted)">${it.note}</div>`;
    tl.appendChild(div);
  });

  // Notes (localStorage)
  const form = document.getElementById("noteForm");
  const notesList = document.getElementById("notesList");
  const clearBtn = document.getElementById("clearNotes");
  function loadNotes() {
    if (!notesList) return;
    notesList.innerHTML = "";
    const notes = JSON.parse(localStorage.getItem("notes") || "[]") || [];
    notes.forEach((n) => {
      const el = document.createElement("div");
      el.className = "note";
      el.innerHTML = `<div style="font-weight:700">${n.name} <span style="color:var(--muted);font-size:12px">• ${n.subject}</span></div><div style="margin-top:6px;color:var(--muted)">${n.msg}</div>`;
      notesList.appendChild(el);
    });
  }
  loadNotes();
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    const n = { name: document.getElementById("name").value, subject: document.getElementById("subject").value, msg: document.getElementById("message").value };
    const arr = JSON.parse(localStorage.getItem("notes") || "[]"); arr.unshift(n); localStorage.setItem("notes", JSON.stringify(arr));
    form.reset(); loadNotes();
  });
  if (clearBtn) clearBtn.addEventListener("click", function (e) { e.preventDefault(); localStorage.removeItem("notes"); loadNotes(); });

}); // DOMContentLoaded end
