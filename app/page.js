"use client";

import { useEffect, useRef, useState } from "react";
import FlowerBloomCanvas from "../components/FlowerBloomCanvas";

// Natural petal variations for the falling effect
const PETAL_TYPES = [
  // Rose petal
  "M12 2 C18 2, 22 7, 21 14 C20 19, 14 22, 12 22 C10 22, 4 19, 3 14 C2 7, 6 2, 12 2 Z",
  // Sakura petal
  "M12 2 C16 2, 21 6, 20 12 C19 18, 14 21, 12.5 21.8 L12 22 L11.5 21.8 C10 21, 5 18, 4 12 C3 6, 8 2, 12 2 Z",
  // Heart petal
  "M12 5.5 C8.5 1, 2 3.5, 2 9 C2 15, 8 19, 12 22 C16 19, 22 15, 22 9 C22 3.5, 15.5 1, 12 5.5 Z"
];

const PETAL_COLORS = [
  "#f7a8bc",
  "#f28ca6",
  "#fcdfe5",
  "#e86b8c",
  "#fbd2be",
  "#fce8ed"
];

const floatingPetals = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  path: PETAL_TYPES[index % PETAL_TYPES.length],
  color: PETAL_COLORS[index % PETAL_COLORS.length],
  left: `${(index * 31 + 4) % 100}%`,
  delay: `${-((index * 1.15) % 18)}s`,
  duration: `${11 + ((index * 5) % 10)}s`,
  size: 16 + ((index * 3) % 18),
  swayDistance: 22 + ((index * 7) % 36),
  swayDuration: `${3.2 + ((index * 2) % 4)}s`,
  initialRotate: (index * 47) % 360,
}));

const burstPetals = Array.from({ length: 28 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 28;
  const distance = 120 + ((index * 29) % 140);
  return {
    id: index,
    path: PETAL_TYPES[index % PETAL_TYPES.length],
    color: PETAL_COLORS[index % PETAL_COLORS.length],
    x: `${Math.cos(angle) * distance}px`,
    y: `${Math.sin(angle) * distance}px`,
    rotate: `${(index * 50) % 360}deg`,
    delay: `${(index % 7) * 30}ms`,
    size: 15 + (index % 14),
  };
});

// Note frequency table for music synthesis
const NOTE_FREQS = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

// Full transcription of the iconic chorus of "Em Đồng Ý (I Do)" - Đức Phúc x 911
const IDO_SONG_SCORE = [
  // "I'll be"
  { note: "G4", duration: 0.35, chord: ["C3", "G3", "C4"] },
  { note: "C5", duration: 0.35 },
  // "by your side"
  { note: "E5", duration: 0.65, chord: ["E3", "G3", "C4"] },
  { note: "D5", duration: 0.35 },
  { note: "C5", duration: 0.85, chord: ["A2", "E3", "A3"] },
  // "till the day"
  { note: "E5", duration: 0.38 },
  { note: "D5", duration: 0.38 },
  { note: "C5", duration: 0.38 },
  // "I die"
  { note: "D5", duration: 1.15, chord: ["G2", "D3", "G3", "B3"] },

  // "Through the wind and rain"
  { note: "G4", duration: 0.35 },
  { note: "C5", duration: 0.35, chord: ["C3", "G3", "C4"] },
  { note: "E5", duration: 0.65 },
  { note: "D5", duration: 0.35 },
  { note: "C5", duration: 0.85, chord: ["A2", "E3", "A3"] },
  // "I will love you"
  { note: "E5", duration: 0.35 },
  { note: "D5", duration: 0.35 },
  { note: "C5", duration: 0.35, chord: ["F2", "C3", "F3"] },
  { note: "A4", duration: 0.4 },
  // "till the day I die"
  { note: "G4", duration: 0.35 },
  { note: "A4", duration: 0.35, chord: ["G2", "D3", "B3"] },
  { note: "C5", duration: 0.48 },
  { note: "D5", duration: 0.48 },
  { note: "C5", duration: 1.35, chord: ["C3", "G3", "C4", "E4"] },

  // "My life will be in your hands"
  { note: "G4", duration: 0.35 },
  { note: "E5", duration: 0.5, chord: ["C3", "G3", "E4"] },
  { note: "E5", duration: 0.35 },
  { note: "F5", duration: 0.38 },
  { note: "E5", duration: 0.48, chord: ["E3", "B3", "E4"] },
  { note: "D5", duration: 0.38 },
  { note: "C5", duration: 1.15, chord: ["A2", "E3", "A3"] },

  // "I'll be every breath you take"
  { note: "G4", duration: 0.35 },
  { note: "A4", duration: 0.35, chord: ["F2", "C3", "A3"] },
  { note: "C5", duration: 0.35 },
  { note: "C5", duration: 0.35 },
  { note: "D5", duration: 0.35 },
  { note: "E5", duration: 0.5, chord: ["G2", "D3", "B3"] },
  { note: "D5", duration: 1.05 },

  // "I'll be every step you take"
  { note: "G4", duration: 0.35 },
  { note: "A4", duration: 0.35, chord: ["F2", "C3", "A3"] },
  { note: "C5", duration: 0.35 },
  { note: "C5", duration: 0.35 },
  { note: "D5", duration: 0.35 },
  { note: "E5", duration: 0.4, chord: ["G2", "D3", "B3"] },
  { note: "D5", duration: 0.4 },
  { note: "C5", duration: 1.25, chord: ["C3", "G3", "C4"] },

  // "With you I know I am alive"
  { note: "E5", duration: 0.4, chord: ["A2", "E3", "C4"] },
  { note: "F5", duration: 0.4 },
  { note: "G5", duration: 0.5 },
  { note: "G5", duration: 0.4 },
  { note: "F5", duration: 0.4 },
  { note: "E5", duration: 0.4, chord: ["G2", "D3", "B3"] },
  { note: "D5", duration: 0.95 },

  // "Such a sweet surprise"
  { note: "E5", duration: 0.4, chord: ["F2", "C3", "A3"] },
  { note: "F5", duration: 0.4 },
  { note: "G5", duration: 0.5 },
  { note: "A5", duration: 0.5, chord: ["G2", "D3", "B3"] },
  { note: "G5", duration: 1.25 },

  // "Now I have you in my life"
  { note: "G4", duration: 0.35 },
  { note: "A4", duration: 0.35, chord: ["F2", "C3", "A3"] },
  { note: "C5", duration: 0.4 },
  { note: "D5", duration: 0.4 },
  { note: "E5", duration: 0.5, chord: ["G2", "D3", "B3"] },
  { note: "D5", duration: 0.4 },
  { note: "C5", duration: 1.1, chord: ["C3", "G3", "E4"] },

  // "And I know, I know that I do..."
  { note: "C5", duration: 0.35 },
  { note: "D5", duration: 0.35 },
  { note: "E5", duration: 0.65, chord: ["A2", "E3", "C4"] },
  { note: "G5", duration: 0.4 },
  { note: "E5", duration: 0.4 },
  { note: "D5", duration: 0.35 },
  { note: "C5", duration: 0.35 },
  { note: "D5", duration: 0.65, chord: ["G2", "D3", "G3", "B3"] },
  { note: "C5", duration: 2.2, chord: ["C3", "G3", "C4", "E4", "G4"] },
];

// Music Box & Audio Engine for "Em Đồng Ý (I Do)"
class AmbientMusicBox {
  constructor() {
    this.ctx = null;
    this.timer = null;
    this.isPlaying = false;
    this.audio = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (!this.audio && typeof Audio !== "undefined") {
      try {
        this.audio = new Audio("/audio/em-dong-y.m4a");
        this.audio.loop = true;
        this.audio.preload = "none";
        this.audio.volume = 0.8;
      } catch {
        this.audio = null;
      }
    }
  }

  fadeInAudio(targetVolume = 0.8, duration = 1200) {
    if (!this.audio) return;
    try {
      this.audio.volume = 0;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            const start = performance.now();
            const step = (now) => {
              if (!this.isPlaying || !this.audio) return;
              const elapsed = now - start;
              const progress = Math.max(0, Math.min(elapsed / duration, 1));
              this.audio.volume = progress * targetVolume;
              if (progress < 1) {
                requestAnimationFrame(step);
              }
            };
            requestAnimationFrame(step);
          })
          .catch((err) => {
            console.log("Direct audio playback prevented, falling back to Web Audio synth:", err);
            this.startSynthesizer();
          });
      }
    } catch {
      this.startSynthesizer();
    }
  }

  playTone(freq, time, duration, volume, type = "melody") {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === "chord" ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    } catch {
      // safe fallback
    }
  }

  start() {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.audio) {
      this.fadeInAudio(0.8, 1000);
    } else {
      this.startSynthesizer();
    }
  }

  startSynthesizer() {
    if (!this.ctx) return;
    let stepIndex = 0;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx) return;
      const step = IDO_SONG_SCORE[stepIndex % IDO_SONG_SCORE.length];
      stepIndex++;

      const now = this.ctx.currentTime;
      const dur = step.duration;

      // 1. Play melody note
      if (step.note && NOTE_FREQS[step.note]) {
        this.playTone(NOTE_FREQS[step.note], now, dur + 0.4, 0.055, "melody");
      }

      // 2. Play chord accompaniment if present
      if (step.chord) {
        step.chord.forEach((chNote, i) => {
          if (NOTE_FREQS[chNote]) {
            this.playTone(NOTE_FREQS[chNote], now + i * 0.02, dur + 1.4, 0.035 / (i + 1), "chord");
          }
        });
      }

      this.timer = window.setTimeout(playStep, dur * 1000);
    };

    playStep();
  }

  playDoorSwoosh() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i < 2 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.05 / (i + 1), now + i * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 2.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 2.6);
      } catch {
        // audio safe fallback
      }
    });
  }

  stop() {
    this.isPlaying = false;
    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        // safe fallback
      }
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
  }
}

function CornerOrnamentSVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M 10 5 L 12 9 L 16 11 L 12 13 L 10 17 L 8 13 L 4 11 L 8 9 Z" fill="currentColor" stroke="none" />
      <path d="M 6 52 C 6 28, 28 6, 52 6" strokeWidth="1.2" opacity="0.55" />
      <path d="M 12 46 C 12 26, 26 12, 46 12" strokeWidth="1.5" />
      <path d="M 18 38 C 18 24, 24 18, 38 18" strokeWidth="1.0" opacity="0.7" />
      <path d="M 52 6 C 56 6, 59 9, 57 13 C 55 16, 51 15, 51 12" strokeWidth="1.2" />
      <path d="M 6 52 C 6 56, 9 59, 13 57 C 16 55, 15 51, 12 51" strokeWidth="1.2" />
      <path d="M 34 7 C 38 4, 43 6, 41 11 C 39 13, 35 11, 34 7 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="0.8" />
      <path d="M 7 34 C 4 38, 6 43, 11 41 C 13 39, 11 35, 7 34 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="0.8" />
      <path d="M 21 27 C 18 21, 23 17, 28 20 C 30 17, 35 19, 34 25 C 38 27, 36 33, 31 32 C 29 36, 23 35, 22 30 C 17 30, 18 25, 21 27 Z" fill="currentColor" fillOpacity="0.25" strokeWidth="1.2" />
      <circle cx="27" cy="26" r="2.4" fill="currentColor" stroke="none" />
      <path d="M 29 29 C 33 33, 38 37, 40 39" strokeWidth="1.2" />
      <circle cx="40" cy="39" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="24" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [customWish, setCustomWish] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customWishInput, setCustomWishInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [cardRevealed, setCardRevealed] = useState(false);

  const heroStageRef = useRef(null);
  const flowerBloomRef = useRef(null);
  const letterRef = useRef(null);
  const letterHeadingRef = useRef(null);
  const transitionCompletedRef = useRef(true);
  const pullStart = useRef(null);
  const swipeStart = useRef(null);
  const musicBoxRef = useRef(null);

  useEffect(() => {
    const box = new AmbientMusicBox();
    box.init();
    musicBoxRef.current = box;
    return () => {
      box.stop();
    };
  }, []);

  // Đảm bảo luôn mở đầu ở Trang 1 (Phong bì), chống trình duyệt tự khôi phục vị trí cuộn cũ (scroll restoration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);

      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      const timer = window.setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, []);

  // Check URL params for recipient & wish message personalization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get("to");
      const msgParam = params.get("msg");
      if (toParam) {
        setRecipient(toParam.trim());
        setCustomInput(toParam.trim());
      }
      if (msgParam) {
        setCustomWish(msgParam.trim());
        setCustomWishInput(msgParam.trim());
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/greeting", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Không tải được lời chúc");
        return response.json();
      })
      .then(setGreeting)
      .catch((error) => {
        if (error.name !== "AbortError") setGreeting(null);
      });

    return () => controller.abort();
  }, []);

  function showToast(text) {
    setToastMessage(text);
    window.setTimeout(() => {
      setToastMessage("");
    }, 2800);
  }

  function toggleMusic() {
    if (!musicBoxRef.current) return;
    if (musicOn) {
      musicBoxRef.current.stop();
      setMusicOn(false);
    } else {
      musicBoxRef.current.start();
      setMusicOn(true);
    }
  }

  function handleCardReveal() {
    if (transitionCompletedRef.current) return;
    transitionCompletedRef.current = true;
    setCardRevealed(true);
    if (!musicOn && musicBoxRef.current) {
      try {
        musicBoxRef.current.start();
        setMusicOn(true);
      } catch {
        // safe fallback
      }
    }
    requestAnimationFrame(() => {
      letterRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      letterHeadingRef.current?.focus({ preventScroll: true });
    });
  }

  function handleTransitionEnd() {
    heroStageRef.current?.classList.remove("is-warping");
  }

  function openLetter() {
    if (opened) return;
    setOpened(true);
    setFlipped(false); // Đảm bảo luôn mở ra mặt 1 (Trang 1) của thiệp trước tiên
    transitionCompletedRef.current = false;

    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (musicBoxRef.current) {
      try {
        musicBoxRef.current.init();
        musicBoxRef.current.playDoorSwoosh();
      } catch {
        // safe fallback
      }
    }

    if (isReduced) {
      setCardRevealed(true);
      handleCardReveal();
      handleTransitionEnd();
      return;
    }

    // Giai đoạn 1 (0ms - 400ms): Phong bì mở nắp và 2 cánh cửa hé mở chậm rãi
    // Giai đoạn 2 (400ms): Bắt đầu lực hút camera mượt mà, GPU composite-only trực tiếp qua classList
    window.setTimeout(() => {
      heroStageRef.current?.classList.add("is-warping");
    }, 400);

    // Giai đoạn 3 (950ms): Kích hoạt canvas trực tiếp qua ref (không trigger React re-render)
    window.setTimeout(() => {
      flowerBloomRef.current?.start();
    }, 950);
  }

  function startPull(event) {
    pullStart.current = event.clientY;
    setDragging(true);
  }

  function endPull(event) {
    if (pullStart.current !== null && event.clientY - pullStart.current > 24) {
      openLetter();
    }
    pullStart.current = null;
    setDragging(false);
  }

  function startSwipe(event) {
    swipeStart.current = event.clientX;
  }

  function endSwipe(event) {
    if (swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    if (delta < -45) setFlipped(true);
    if (delta > 45) setFlipped(false);
    swipeStart.current = null;
  }

  const firstCard = greeting?.cards?.[0];
  const secondCard = greeting?.cards?.[1];
  const defaultWish =
    secondCard?.body ??
    "Chúc bạn luôn dịu dàng với chính mình, vững vàng trước những điều khó khăn và đủ đầy niềm vui trong từng ngày nhỏ. Mong nụ cười luôn ở lại thật lâu, những điều bạn ấp ủ sẽ dần thành hiện thực, và quanh bạn lúc nào cũng có người trân trọng bạn.";

  function openCustomizeModal() {
    setCustomInput(recipient);
    setCustomWishInput(customWish || defaultWish);
    setIsCustomizeOpen(true);
  }

  function handleCardClick(event) {
    // Không lật thẻ nếu người dùng click vào button, link, input hoặc phần tử interactive con
    if (event.target.closest("button, a, input, textarea, label")) {
      return;
    }
    setFlipped((prev) => !prev);
  }

  function saveCustomRecipient(e) {
    if (e) e.preventDefault();
    const trimmedTo = customInput.trim();
    const trimmedWish = customWishInput.trim();
    setRecipient(trimmedTo);
    setCustomWish(trimmedWish);
    setIsCustomizeOpen(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (trimmedTo) {
        url.searchParams.set("to", trimmedTo);
      } else {
        url.searchParams.delete("to");
      }

      if (trimmedWish && trimmedWish !== defaultWish) {
        url.searchParams.set("msg", trimmedWish);
      } else {
        url.searchParams.delete("msg");
      }

      window.history.replaceState({}, "", url.toString());

      navigator.clipboard?.writeText(url.toString()).then(() => {
        showToast("Đã lưu thiệp & sao chép liên kết cá nhân hóa!");
      }).catch(() => {
        showToast("Đã cập nhật thiệp thành công!");
      });
    }
  }

  function copyWishMessage() {
    const currentWish = customWish || defaultWish;
    const textToCopy = `${recipient ? `Thân gửi ${recipient},\n` : ""}${secondCard?.headline ?? "Mong bạn luôn"} ${secondCard?.title ?? "được yêu thương"}.\n\n${currentWish}\n\n— 20·10 Ngày Phụ nữ Việt Nam —`;
    navigator.clipboard?.writeText(textToCopy).then(() => {
      showToast("Đã sao chép lời chúc vào khay nhớ tạm!");
    }).catch(() => {
      showToast("Không thể sao chép, vui lòng thử lại!");
    });
  }

  return (
    <main className={!cardRevealed ? "is-envelope-view" : "is-card-view"}>
      <a
        className="skip-link"
        href="#letter"
        onClick={(e) => {
          e.preventDefault();
          openLetter();
        }}
      >
        Đi đến lời chúc
      </a>

      <FlowerBloomCanvas
        ref={flowerBloomRef}
        onCardReveal={handleCardReveal}
        onTransitionEnd={handleTransitionEnd}
      />

      {/* Floating natural petals */}
      {cardRevealed && (
        <div className="falling-layer" aria-hidden="true">
          {floatingPetals.map((petal) => (
            <span
              className="falling-petal"
              key={petal.id}
              style={{
                "--left": petal.left,
                "--delay": petal.delay,
                "--duration": petal.duration,
                "--sway-dur": petal.swayDuration,
                "--sway-dist": `${petal.swayDistance}px`,
                "--init-rot": `${petal.initialRotate}deg`,
              }}
            >
              <svg width={petal.size} height={petal.size} viewBox="0 0 24 24" fill={petal.color}>
                <path d={petal.path} />
              </svg>
            </span>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span className="toast-icon">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Opening Section (Grand Centered Envelope Experience) */}
      <section className="opening" aria-labelledby="page-title">
        <header className="topbar">
          <a className="wordmark" href="#top" aria-label="Lá thư 20 tháng 10, đầu trang">
            <span className="wordmark-icon" aria-hidden="true">✦</span>
            <span>Lá thư <b>20·10</b></span>
          </a>
        </header>

        {/* Modal customize recipient & wish message on card 2 */}
        {isCustomizeOpen && (
          <div className="modal-backdrop" onClick={() => setIsCustomizeOpen(false)}>
            <div className="modal-dialog modal-dialog-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <span className="modal-flower-icon" aria-hidden="true">✎</span>
                  <h3>Cá nhân hóa thiệp 20·10</h3>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setIsCustomizeOpen(false)}
                  aria-label="Đóng cửa sổ"
                >
                  ✕
                </button>
              </div>
              <p className="modal-desc">
                Nhập tên người nhận và tùy chỉnh lời chúc ở Trang 2 theo cảm xúc riêng của bạn.
              </p>

              <form onSubmit={saveCustomRecipient} className="customizer-form">
                {/* Section 1: Tên người nhận */}
                <div className="form-field-block">
                  <label className="field-label" htmlFor="recipient-input">
                    <span>1. Tên người nhận trên thiệp</span>
                  </label>
                  <div className="quick-presets">
                    {["Mẹ yêu", "Em yêu", "Chị gái", "Cô giáo", "Bạn thân", "Vợ yêu"].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        className={`preset-tag${customInput === preset ? " is-selected" : ""}`}
                        onClick={() => setCustomInput(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    id="recipient-input"
                    type="text"
                    className="modal-input"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Ví dụ: Mẹ yêu, Thu Trang, Cô Mai..."
                    maxLength={50}
                  />
                </div>

                {/* Section 2: Lời chúc thiệp 2 */}
                <div className="form-field-block">
                  <div className="field-label-row">
                    <label className="field-label" htmlFor="wish-input">
                      <span>2. Lời chúc ở thiệp 2</span>
                    </label>
                    <span className="char-count">{customWishInput.length}/500</span>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="wish-presets-row">
                    <span className="wish-preset-label">Gợi ý mẫu:</span>
                    <button
                      type="button"
                      className="wish-preset-chip"
                      onClick={() =>
                        setCustomWishInput(
                          "Chúc bạn luôn dịu dàng với chính mình, vững vàng trước những điều khó khăn và đủ đầy niềm vui trong từng ngày nhỏ. Mong nụ cười luôn ở lại thật lâu, những điều bạn ấp ủ sẽ dần thành hiện thực, và quanh bạn lúc nào cũng có người trân trọng bạn."
                        )
                      }
                    >
                      Dịu dàng & Sâu lắng
                    </button>
                    <button
                      type="button"
                      className="wish-preset-chip"
                      onClick={() =>
                        setCustomWishInput(
                          "Nhân ngày 20·10, chúc bạn một ngày ngập tràn hoa tươi, nụ cười rạng rỡ và những điều ngọt ngào nhất. Hãy luôn tự tin, hạnh phúc và toả sáng theo cách riêng của mình nhé!"
                        )
                      }
                    >
                      Rạng rỡ & Yêu đời
                    </button>
                    <button
                      type="button"
                      className="wish-preset-chip"
                      onClick={() =>
                        setCustomWishInput(
                          "Kính chúc người phụ nữ tuyệt vời nhất luôn an vui, dồi dào sức khỏe và ngập tràn hạnh phúc. Cảm ơn vì tất cả yêu thương, sự che chở và những điều ấm áp vô giá đã luôn dành cho gia đình."
                        )
                      }
                    >
                      Tri ân & Kính yêu
                    </button>
                  </div>

                  <textarea
                    id="wish-input"
                    className="modal-textarea"
                    rows={4}
                    value={customWishInput}
                    onChange={(e) => setCustomWishInput(e.target.value.slice(0, 500))}
                    placeholder="Viết lời chúc gửi riêng đến người phụ nữ bạn yêu quý..."
                  />
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() => {
                      setCustomWishInput(defaultWish);
                    }}
                    title="Khôi phục lời chúc mẫu"
                  >
                    ↺ Lời chúc gốc
                  </button>

                  <div className="primary-actions">
                    <button
                      type="button"
                      className="modal-copy-btn"
                      onClick={copyWishMessage}
                      title="Sao chép lời chúc hiện tại"
                    >
                      📋 Sao chép
                    </button>
                    <button type="submit" className="save-btn">
                      Lưu & Tạo liên kết ✨
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grand Centered Hero Stage */}
        <div ref={heroStageRef} className={`hero-stage${opened ? " is-opened" : ""}`} id="top">
          <div className="hero-intro">
            <div className="eyebrow">
              <span className="line" />
              <span>NGÀY PHỤ NỮ VIỆT NAM · 20.10</span>
              <span className="line" />
            </div>

            <h1 id="page-title">
              {recipient ? (
                <>Gửi đến <span className="highlight-name">{recipient}</span>,<br /><em>ngàn điều dịu êm.</em></>
              ) : (
                <>Có một lá thư nhỏ,<br /><em>dành riêng cho bạn.</em></>
              )}
            </h1>

            <p className="intro-text">
              Gói trọn những thương mến và sự trân trọng trong từng nét chữ. Hãy chạm nhẹ vào phong bì để đón nhận tấm thiệp nhé.
            </p>
          </div>

          {/* Genuine Luxury Envelope (Thiết kế phong bì chân thực & tinh xảo) */}
          <div className={`envelope-container${opened ? " is-open" : ""}`}>
            {/* Luminous warm ambient backlight halo */}
            <div className="envelope-halo" aria-hidden="true" />
            <div className="suction-vortex-layer" aria-hidden="true" />

            <button
              className={`envelope${dragging ? " is-dragging" : ""}`}
              type="button"
              onClick={openLetter}
              onPointerDown={startPull}
              onPointerUp={endPull}
              onPointerCancel={() => { pullStart.current = null; setDragging(false); }}
              aria-label="Mở phong bì 20 tháng 10"
              aria-expanded={opened}
            >
              {/* Soft ambient depth shadows */}
              <div className="envelope-shadow-ambient" />
              <div className="envelope-shadow-direct" />

              {/* Envelope Back Panel with Damask Lining */}
              <div className="envelope-back">
                <div className="envelope-inner-liner" />
              </div>

              {/* Genshin Celestial Portal Core (Glowing realm beyond the doors) */}
              <div className="envelope-portal-core" aria-hidden="true">
                <div className="portal-light-center" />
                <div className="portal-rays" />
              </div>

              {/* The Letter inside that emerges smoothly */}
              <div className="mini-letter" aria-hidden="true">
                <div className="mini-letter-inner">
                  <div className="mini-letter-frame">
                    <span className="mini-tag">✦ 20 · 10 ✦</span>
                    <span className="mini-greeting">{recipient ? `Thân gửi ${recipient}` : "Gửi người phụ nữ tuyệt vời"}</span>
                    <b className="mini-title">Một ngày 20·10<br />ngập tràn hạnh phúc</b>
                    <span className="mini-heart">♥</span>
                  </div>
                </div>
              </div>

              {/* Side Flaps (Left & Right - 100% Solid Paper Folds) */}
              <div className="envelope-flap-left" />
              <div className="envelope-flap-right" />

              {/* Bottom Flap */}
              <div className="envelope-flap-bottom" />

              {/* Top Flap (Opens backward with 3D perspective) */}
              <div className="envelope-flap-top" />

              {/* Luxury Wax Seal (Con dấu sáp dập nổi hoa hồng) */}
              <div className="wax-seal" aria-hidden="true">
                <div className="wax-seal-inner">
                  <svg className="wax-seal-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 9 10.2 11 10.8V13H8V15H11V21H13V15H16V13H13V10.8C15 10.2 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 7.9 13.4 9 12 9C10.6 9 9.5 7.9 9.5 6.5C9.5 5.1 10.6 4 12 4Z" />
                  </svg>
                  <span className="wax-seal-text">20·10</span>
                </div>
              </div>
            </button>

            <span className="envelope-tag" aria-hidden="true">
              ✦ Chạm vào phong bì để mở thiệp ✦
            </span>
          </div>
        </div>

        <div className="opening-bottom" aria-hidden="true">
          <span>Ngày Phụ nữ Việt Nam 20·10</span>
          <span className="scroll-cue">
            <i /> Cuộn xuống để xem thiệp
          </span>
          <span>Dành tặng phái đẹp ngàn lời chúc</span>
        </div>
      </section>

      {/* Letter / Grand Greeting Card Section */}
      <section
        className={`letter-section${opened ? " is-revealed" : ""}`}
        id="letter"
        ref={letterRef}
        aria-labelledby={opened ? "letter-title" : undefined}
        aria-label={!opened ? "Phần thiệp chúc mừng" : undefined}
      >
        {!opened ? (
          <div className="locked-card-prompt">
            <div className="locked-icon-wrap" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p className="locked-text">
              Hãy mở phong bì ở phía trên<br />để đón nhận tấm thiệp gửi riêng cho bạn nhé.
            </p>
            <a href="#top" className="locked-link">
              Quay lại phong bì <span aria-hidden="true">↑</span>
            </a>
          </div>
        ) : (
          <>
            {/* Burst petals animation on open */}
            <div className="burst-container" aria-hidden="true">
              {burstPetals.map((petal) => (
                <span
                  className="burst-petal"
                  key={petal.id}
                  style={{
                    "--x": petal.x,
                    "--y": petal.y,
                    "--rotate": petal.rotate,
                    "--delay": petal.delay,
                  }}
                >
                  <svg width={petal.size} height={petal.size} viewBox="0 0 24 24" fill={petal.color}>
                    <path d={petal.path} />
                  </svg>
                </span>
              ))}
            </div>

            <div className="letter-heading">
              <div className="eyebrow">
                <span className="line" />
                <span>{greeting?.occasion ?? "NGÀY PHỤ NỮ VIỆT NAM"}</span>
                <span className="line" />
              </div>
              <h2 id="letter-title" ref={letterHeadingRef} tabIndex={-1}>
                {recipient ? (
                  <>Một tấm thiệp,<br /><em>gửi riêng đến {recipient}.</em></>
                ) : (
                  <>Một tấm thiệp,<br /><em>gửi riêng đến bạn.</em></>
                )}
              </h2>
            </div>

            {/* Grand Centered 3D Card Stage */}
            <div
              className="card-stage"
              role="group"
              onClick={handleCardClick}
              onPointerDown={startSwipe}
              onPointerUp={endSwipe}
              onPointerCancel={() => { swipeStart.current = null; }}
              aria-label="Thiệp chúc mừng 20/10. Chạm vào thiệp hoặc bấm nút bên dưới để lật mặt thiệp."
            >
              <div className={`greeting-card${flipped ? " is-flipped" : ""}`}>
                {/* =========================================================
                    Mặt trước thiệp (Front Card) - Grand Luxury Artisan
                   ========================================================= */}
                <article className="card-face card-front" aria-hidden={flipped}>
                  {/* Botanical Watermark Background */}
                  <div className="card-watermark" aria-hidden="true">
                    <svg viewBox="0 0 200 200" fill="currentColor">
                      <path d="M100 20 C120 40, 160 50, 170 80 C180 110, 160 150, 130 170 C100 190, 60 180, 40 150 C20 120, 30 70, 60 40 C75 25, 90 20, 100 20 Z" opacity="0.04" />
                      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.08" strokeDasharray="3 4" />
                    </svg>
                  </div>

                  {/* Ornate Gold Filigree Corners */}
                  <div className="corner-ornament top-left" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament top-right" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament bottom-left" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament bottom-right" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>

                  {/* Header Subtitle Tag */}
                  <div className="card-top-tag-wrap">
                    <span className="card-sparkle" aria-hidden="true">✦</span>
                    <p className="card-top-tag">
                      {recipient ? `Dành tặng ${recipient} một ngày thật rạng rỡ` : (firstCard?.label ?? "Gửi bạn một ngày thật rạng rỡ")}
                    </p>
                    <span className="card-sparkle" aria-hidden="true">✦</span>
                  </div>

                  {/* Centerpiece Typographic Display */}
                  <div className="card-title-group">
                    <span className="card-greeting-script">{firstCard?.headline ?? "Chúc mừng"}</span>
                    <div className="card-big-date-wrap">
                      <strong className="card-big-date">{firstCard?.date ?? "20 · 10"}</strong>
                    </div>
                    <div className="card-subtitle-badge-wrap">
                      <span className="card-subtitle-badge">
                        {firstCard?.title ?? "NGÀY PHỤ NỮ VIỆT NAM"}
                      </span>
                    </div>
                  </div>

                  {/* Ornate Gold Botanical Divider */}
                  <div className="card-divider" aria-hidden="true">
                    <span className="divider-line" />
                    <span className="divider-ornament">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </span>
                    <span className="divider-line" />
                  </div>
                </article>

                {/* =========================================================
                    Mặt sau thiệp (Back Card) - Heartfelt Hand-written Letter
                   ========================================================= */}
                <article className="card-face card-back" aria-hidden={!flipped}>
                  {/* Ornate Gold Filigree Corners */}
                  <div className="corner-ornament top-left" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament top-right" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament bottom-left" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>
                  <div className="corner-ornament bottom-right" aria-hidden="true">
                    <CornerOrnamentSVG />
                  </div>

                  {/* Header Row - Royal Centered Letterhead */}
                  <div className="letter-header-wrap">
                    <div className="letter-top-tag-wrap">
                      <span className="card-sparkle" aria-hidden="true">✦</span>
                      <span className="postmark-tag-label">BƯU THIẾP</span>
                      <strong className="postmark-date-highlight">20 · 10</strong>
                      <span className="postmark-tag-label">VIỆT NAM</span>
                      <span className="card-sparkle" aria-hidden="true">✦</span>
                    </div>

                    <div
                      className="letter-to-badge"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomizeModal();
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openCustomizeModal();
                        }
                      }}
                      title="Bấm để đổi tên & chỉnh sửa lời chúc"
                      aria-label="Bấm để đổi tên và chỉnh sửa lời chúc ở thiệp 2"
                    >
                      <span className="letter-to-label">Kính gửi:</span>
                      <span className="letter-to-name">
                        {recipient ? recipient : (secondCard?.label ?? "Người phụ nữ tuyệt vời")}
                      </span>
                      <button
                        type="button"
                        className="card-edit-pen-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCustomizeModal();
                        }}
                        title="Đổi tên & chỉnh sửa lời chúc ở thiệp 2"
                        aria-label="Đổi tên và chỉnh sửa lời chúc ở thiệp 2"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </div>

                    <div className="letter-header-divider" aria-hidden="true">
                      <span className="divider-line" />
                      <span className="divider-sparkle">✦</span>
                      <span className="divider-line" />
                    </div>
                  </div>

                  {/* Heartfelt Heading */}
                  <h3 className="card-back-heading">
                    {secondCard?.headline ?? "Mong bạn luôn"}<br />
                    <em>{secondCard?.title ?? "ĐƯỢC YÊU THƯƠNG & RẠNG RỠ"}</em>
                  </h3>

                  {/* Letter Message Body */}
                  <div className="card-message-box">
                    <p className="card-message">
                      {customWish || defaultWish}
                    </p>
                  </div>

                  {/* Signature Signoff */}
                  <div className="card-back-footer">
                    <div className="signoff-group">
                      <p className="card-signoff">
                        {secondCard?.signoff ?? "Thân thương gửi đến bạn"}{" "}
                        <span className="heart-accent" aria-hidden="true">♥</span>
                      </p>
                      <span className="signoff-date">Ngày 20 tháng 10</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            {/* Card Interactive Controls */}
            <div className="card-controls">
              <div className="control-buttons-row">
                <button
                  className="flip-button"
                  type="button"
                  onClick={() => setFlipped((prev) => !prev)}
                  aria-label={flipped ? "Xem lại Trang 1: Chúc mừng 20·10" : "Lật sang Trang 2: Lời chúc chi tiết"}
                >
                  <span className="flip-icon" aria-hidden="true">↻</span>
                  <span>{flipped ? "Xem lại Trang 1" : "Lật mở Trang 2"}</span>
                </button>
              </div>

              <div className="card-pagination" aria-label={`Đang xem trang ${flipped ? "2" : "1"} trên 2`}>
                <button
                  type="button"
                  className={`dot${!flipped ? " active" : ""}`}
                  onClick={() => setFlipped(false)}
                  aria-label="Trang 1: Chúc mừng 20·10"
                  title="Trang 1: Chúc mừng 20·10"
                />
                <button
                  type="button"
                  className={`dot${flipped ? " active" : ""}`}
                  onClick={() => setFlipped(true)}
                  aria-label="Trang 2: Lời chúc chi tiết"
                  title="Trang 2: Lời chúc chi tiết"
                />
              </div>

              <p className="swipe-hint">
                <span aria-hidden="true">✦</span> Chạm vào thiệp hoặc bấm nút để lật mặt <span aria-hidden="true">✦</span>
              </p>
            </div>
          </>
        )}
      </section>

      <footer className="page-footer">
        <div className="footer-content">
          <span className="footer-mark">20 · 10</span>
          <p>Chúc những điều dịu dàng và rạng rỡ nhất luôn bên cạnh người phụ nữ bạn yêu thương.</p>
          <div className="footer-credit">
            <span className="credit-text">cre:</span>
            <a
              href="https://www.facebook.com/ngt.baor"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-link"
              title="Facebook tác giả: Nguyễn Thế Bảo"
              aria-label="Facebook tác giả: Nguyễn Thế Bảo"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
          <span className="footer-flower" aria-hidden="true">✦</span>
        </div>
      </footer>

      {/* Floating Vinyl Record Player Widget (Góc dưới bên phải) */}
      <aside className={`vinyl-player-widget${musicOn ? " is-playing" : ""}`} aria-label="Trình phát nhạc đĩa than">
        {/* Floating musical notes */}
        {musicOn && (
          <div className="vinyl-floating-notes" aria-hidden="true">
            <span className="v-note v-note-1">♪</span>
            <span className="v-note v-note-2">♫</span>
            <span className="v-note v-note-3">♩</span>
          </div>
        )}

        {/* Info pill with song name and equalizer */}
        <button
          type="button"
          className="vinyl-info-pill"
          onClick={toggleMusic}
          title={musicOn ? "Tạm dừng phát nhạc" : "Bật bài hát Em Đồng Ý (I Do)"}
        >
          <div className="vinyl-text-group">
            <span className="vinyl-song-title">Em Đồng Ý (I Do)</span>
            <span className="vinyl-song-artist">Đức Phúc × 911</span>
          </div>
          <div className={`vinyl-equalizer${musicOn ? " is-active" : ""}`} aria-hidden="true">
            <span className="eq-bar eq-bar-1" />
            <span className="eq-bar eq-bar-2" />
            <span className="eq-bar eq-bar-3" />
            <span className="eq-bar eq-bar-4" />
          </div>
        </button>

        {/* Rotating Vinyl Record Disc */}
        <button
          type="button"
          className="vinyl-disk-button"
          onClick={toggleMusic}
          aria-label={musicOn ? "Tạm dừng bài hát Em Đồng Ý" : "Phát bài hát Em Đồng Ý (I Do)"}
          title={musicOn ? "Tạm dừng bài hát" : "Phát bài hát Em Đồng Ý (I Do)"}
        >
          <div className="vinyl-disk-shadow" />
          <div className="vinyl-disk-wrapper">
            {/* The authentic vinyl grooves base */}
            <img
              src="/images/vinyl-disk.png"
              alt=""
              className="vinyl-disk-img"
              width={96}
              height={96}
              loading="lazy"
            />
            {/* The custom album art center label */}
            <img
              src="/images/em-dong-y-cover.svg"
              alt="Em Đồng Ý (I Do) - Đức Phúc x 911"
              className="vinyl-center-art"
              width={34}
              height={34}
              loading="lazy"
            />
            {/* Center vinyl spindle hole pin */}
            <span className="vinyl-center-pin" />
          </div>
          <span className="vinyl-state-badge" aria-hidden="true">
            {musicOn ? "❚❚" : "▶"}
          </span>
        </button>
      </aside>
    </main>
  );
}
