import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
  computed,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../../shared/services/products';

declare const window: any;

// ─── CONFIG ────────────────────────────────────────────────────────
const MAX_CARDS = 10;
const CARD_W = 300;
const CARD_H = 420;
const RATIO_MIN = 1.15;
const RATIO_MAX = 1.85;
const AREA_MIN_FRAC = 0.018;
const AREA_MAX_FRAC = 0.92;
const SOLIDITY_MIN = 0.6;
const MIN_SIDE_PX = 60;
const CONFIRM_FRAMES = 3;
const LOSE_FRAMES = 6;
const LERP_ALPHA = 0.35;

export const PALETTE = [
  { s: '#FFD700', g: 'rgba(255,215,0,0.10)' },
  { s: '#FF6B6B', g: 'rgba(255,107,107,0.10)' },
  { s: '#4ECDC4', g: 'rgba(78,205,196,0.10)' },
  { s: '#C3A6FF', g: 'rgba(195,166,255,0.10)' },
  { s: '#FFB347', g: 'rgba(255,179,71,0.10)' },
  { s: '#A8E6CF', g: 'rgba(168,230,207,0.10)' },
  { s: '#FF8B94', g: 'rgba(255,139,148,0.10)' },
  { s: '#87CEEB', g: 'rgba(135,206,235,0.10)' },
];

interface TrackerEntry {
  points: { x: number; y: number }[];
  rect: { x: number; y: number; width: number; height: number };
  seen: boolean;
  confirmCount: number;
  loseCount: number;
}

interface CardResult {
  name: string;
  cardCode: string;
  rarity: string;
  minEu: number | null;
  minIta: number | null;
  cardtraderUrl: string | null;
}

interface Preview {
  idx: number;
  dataUrl: string | null;
  canvas: HTMLCanvasElement | null;
}

@Component({
  selector: 'app-image-search',
  imports: [CommonModule],
  templateUrl: './image-search.html',
  styleUrl: './image-search.scss',
})
export class ImageSearch implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayEl') overlayRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('procEl') procRef!: ElementRef<HTMLCanvasElement>;

  private productsService = inject(Products);
  private ngZone = inject(NgZone);

  // ── Signals ─────────────────────────────────────────────────────
  cvReady = signal(false);
  camReady = signal(false);
  cardCount = signal(0);
  results = signal<Record<number, CardResult>>({});
  scanning = signal(false);
  camError = signal(false);
  debug = signal(false);
  debugInfo = signal<any>({});
  previews = signal<Preview[] | null>(null);
  excluded = signal<Set<number>>(new Set());
  sendingIdx = signal<number | null>(null);

  ready = computed(() => this.cvReady() && this.camReady());
  hasResults = computed(() => Object.keys(this.results()).length > 0);
  confirmCount = computed(() => {
    const p = this.previews();
    const e = this.excluded();
    return p ? p.length - e.size : 0;
  });
  loadPct = computed(() => (this.cvReady() ? 50 : 0) + (this.camReady() ? 50 : 0));
  btnDisabled = computed(() => !this.ready() || this.scanning() || !!this.previews());
  resultsEntries = computed(() =>
    Object.entries(this.results()).map(([k, v]) => ({ idx: parseInt(k), ...v })),
  );

  readonly PALETTE = PALETTE;

  // ── Internal state ───────────────────────────────────────────────
  private animId: number | null = null;
  private cards: TrackerEntry[] = [];
  private trackers: TrackerEntry[] = [];
  private scanLineY = 0;
  private frameN = 0;

  // ── Template helpers ─────────────────────────────────────────────
  getPalette(idx: number) {
    return PALETTE[idx % PALETTE.length];
  }

  getRarityColor(rarity: string): string {
    const map: Record<string, string> = {
      'Secret Rare': '#FFD700',
      'Leader Rare': '#FFD700',
      'Super Rare': '#C3A6FF',
      Rare: '#4ECDC4',
      Uncommon: '#87CEEB',
      Common: 'rgba(255,255,255,0.45)',
    };
    return map[rarity] || 'rgba(255,255,255,0.45)';
  }

  isExcluded(idx: number) {
    return this.excluded().has(idx);
  }

  toggleExclude(idx: number) {
    this.excluded.update((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit() {
    this.loadOpenCV();
    this.loadFonts();
  }

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const video = this.videoRef?.nativeElement;
    const stream = video?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  }

  // ── OpenCV ───────────────────────────────────────────────────────
  private loadOpenCV() {
    if (window.cv?.getBuildInformation) {
      this.cvReady.set(true);
      return;
    }
    const existing = document.querySelector('script[src*="opencv.js"]');
    if (existing) {
      const t = setInterval(() => {
        if (window.cv?.getBuildInformation) {
          clearInterval(t);
          this.ngZone.run(() => this.cvReady.set(true));
        }
      }, 300);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    s.async = true;
    s.onload = () => {
      const t = setInterval(() => {
        if (window.cv?.getBuildInformation) {
          clearInterval(t);
          this.ngZone.run(() => this.cvReady.set(true));
        }
      }, 300);
    };
    document.head.appendChild(s);
  }

  // ── Fonts ────────────────────────────────────────────────────────
  private loadFonts() {
    if (document.querySelector('link[href*="Share+Tech+Mono"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@600;700&display=swap';
    document.head.appendChild(link);
  }

  // ── Camera ───────────────────────────────────────────────────────
  private startCamera() {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        const video = this.videoRef.nativeElement;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          this.ngZone.run(() => this.camReady.set(true));
          this.startLoop();
        };
      })
      .catch(() => this.ngZone.run(() => this.camError.set(true)));
  }

  // ── Detection loop ───────────────────────────────────────────────
  private startLoop() {
    const loop = () => {
      this.processFrame();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private processFrame() {
    const video = this.videoRef?.nativeElement;
    const overlay = this.overlayRef?.nativeElement;
    const proc = this.procRef?.nativeElement;
    if (!video || !overlay || !proc || !window.cv?.Mat) return;
    const vw = video.videoWidth,
      vh = video.videoHeight;
    if (!vw || !vh) return;

    if (overlay.width !== vw) {
      overlay.width = vw;
      overlay.height = vh;
    }
    if (proc.width !== vw) {
      proc.width = vw;
      proc.height = vh;
    }

    const cv = window.cv;
    const mats: any[] = [];
    const free = (m: any) => {
      try {
        m?.delete();
      } catch {}
    };

    try {
      proc.getContext('2d')!.drawImage(video, 0, 0, vw, vh);

      const src = cv.imread(proc);
      mats.push(src);
      const gray = new cv.Mat();
      mats.push(gray);
      const blur = new cv.Mat();
      mats.push(blur);
      const edges = new cv.Mat();
      mats.push(edges);
      const contours = new cv.MatVector();
      mats.push(contours);
      const hier = new cv.Mat();
      mats.push(hier);

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blur, new cv.Size(9, 9), 0);
      cv.Canny(blur, edges, 40, 120);

      const k3 = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.dilate(edges, edges, k3);
      k3.delete();

      cv.findContours(edges, contours, hier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const minA = vw * vh * AREA_MIN_FRAC;
      const maxA = vw * vh * AREA_MAX_FRAC;
      const total = contours.size();
      let pArea = 0,
        pSolid = 0,
        pRatio = 0,
        p4pts = 0;
      const cards: any[] = [];

      for (let i = 0; i < total; i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        if (area < minA || area > maxA) {
          cnt.delete();
          continue;
        }
        pArea++;

        const r = cv.boundingRect(cnt);
        const rectArea = r.width * r.height;
        const solidity = rectArea > 0 ? area / rectArea : 0;
        if (solidity < SOLIDITY_MIN) {
          cnt.delete();
          continue;
        }
        pSolid++;

        if (r.width < MIN_SIDE_PX || r.height < MIN_SIDE_PX) {
          cnt.delete();
          continue;
        }

        const hwRatio = Math.max(r.width, r.height) / Math.min(r.width, r.height);
        if (hwRatio < RATIO_MIN || hwRatio > RATIO_MAX) {
          cnt.delete();
          continue;
        }
        pRatio++;

        let pts4: { x: number; y: number }[] | null = null;
        for (const eps of [0.01, 0.02, 0.03, 0.04, 0.06, 0.08, 0.1]) {
          const peri = cv.arcLength(cnt, true);
          const approx = new cv.Mat();
          cv.approxPolyDP(cnt, approx, eps * peri, true);
          if (approx.rows === 4) {
            pts4 = [];
            for (let j = 0; j < 4; j++)
              pts4.push({ x: approx.data32S[j * 2], y: approx.data32S[j * 2 + 1] });
            approx.delete();
            break;
          }
          approx.delete();
        }

        if (!pts4) {
          cnt.delete();
          continue;
        }
        p4pts++;

        cards.push({ rect: r, points: this.sortCorners(pts4), area, solidity });
        cnt.delete();
      }

      cards.sort((a, b) => b.area - a.area);
      const rawTop = cards.slice(0, MAX_CARDS);

      // ── Temporal tracking ────────────────────────────────────────
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const lerpPt = (pa: any, pb: any, t: number) => ({
        x: lerp(pa.x, pb.x, t),
        y: lerp(pa.y, pb.y, t),
      });
      const centroid = (pts: any[]) => ({
        x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
        y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
      });
      const dist2 = (a: any, b: any) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

      this.trackers.forEach((t) => {
        t.seen = false;
      });

      for (const raw of rawTop) {
        const cRaw = centroid(raw.points);
        let best: TrackerEntry | null = null,
          bestD = Infinity;
        for (const t of this.trackers) {
          const d = dist2(cRaw, centroid(t.points));
          if (d < bestD) {
            bestD = d;
            best = t;
          }
        }
        const maxMatchDist = (raw.rect.width + raw.rect.height) ** 2 * 0.5;
        if (best && bestD < maxMatchDist) {
          best.points = best.points.map((p, i) => lerpPt(p, raw.points[i], LERP_ALPHA));
          best.rect = {
            x: lerp(best.rect.x, raw.rect.x, LERP_ALPHA),
            y: lerp(best.rect.y, raw.rect.y, LERP_ALPHA),
            width: lerp(best.rect.width, raw.rect.width, LERP_ALPHA),
            height: lerp(best.rect.height, raw.rect.height, LERP_ALPHA),
          };
          best.seen = true;
          best.confirmCount = Math.min(best.confirmCount + 1, CONFIRM_FRAMES);
          best.loseCount = 0;
        } else {
          this.trackers.push({
            points: raw.points,
            rect: raw.rect,
            seen: true,
            confirmCount: 1,
            loseCount: 0,
          });
        }
      }

      for (let i = this.trackers.length - 1; i >= 0; i--) {
        if (!this.trackers[i].seen) {
          this.trackers[i].loseCount++;
          if (this.trackers[i].loseCount > LOSE_FRAMES) this.trackers.splice(i, 1);
        }
      }

      this.cards = this.trackers.filter((t) => t.confirmCount >= CONFIRM_FRAMES);
      this.frameN++;

      if (this.frameN % 15 === 0) {
        const count = this.cards.length;
        this.ngZone.run(() => {
          this.cardCount.set(count);
          if (this.debug()) {
            this.debugInfo.set({
              total,
              pArea,
              pSolid,
              pRatio,
              p4pts,
              found: count,
              vw,
              vh,
              minA: Math.round(minA),
              maxA: Math.round(maxA),
            });
          }
        });
      }

      // ── AR overlay ───────────────────────────────────────────────
      const ctx = overlay.getContext('2d')!;
      ctx.clearRect(0, 0, vw, vh);

      this.scanLineY = (this.scanLineY + 1.5) % vh;
      const sg = ctx.createLinearGradient(0, this.scanLineY - 50, 0, this.scanLineY + 50);
      sg.addColorStop(0, 'rgba(255,215,0,0)');
      sg.addColorStop(0.5, 'rgba(255,215,0,0.025)');
      sg.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, this.scanLineY - 50, vw, 100);

      const currentResults = this.results();
      this.cards.forEach((card, idx) =>
        this.drawCardAR(ctx, card, PALETTE[idx % PALETTE.length], currentResults[idx], idx, vw, vh),
      );
    } catch (e) {
      console.warn('CV error:', e);
    } finally {
      mats.forEach(free);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────
  private sortCorners(pts: { x: number; y: number }[]) {
    const cx = pts.reduce((s, p) => s + p.x, 0) / 4;
    const cy = pts.reduce((s, p) => s + p.y, 0) / 4;
    return [...pts].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  private drawCardAR(
    ctx: CanvasRenderingContext2D,
    card: any,
    pal: any,
    result: any,
    idx: number,
    vw: number,
    vh: number,
  ) {
    const { rect, points } = card;
    ctx.save();

    ctx.fillStyle = pal.g;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p: any) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = pal.s;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = pal.s;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p: any) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    points.forEach(({ x, y }: any) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = pal.s;
      ctx.fill();
    });

    const bx = rect.x + rect.width - 14,
      by = rect.y + 14;
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = pal.s;
    ctx.fill();
    ctx.fillStyle = '#0A0F1E';
    ctx.font = "bold 13px 'Share Tech Mono',monospace";
    ctx.textAlign = 'center';
    ctx.fillText(String(idx + 1), bx, by + 5);
    ctx.textAlign = 'left';

    if (result) {
      const hasIta = result.minIta != null;
      const ph = hasIta ? 130 : 116;
      const pw = Math.max(rect.width, 230);
      const px = Math.max(4, Math.min(rect.x, vw - pw - 4));
      const py = rect.y > ph + 12 ? rect.y - ph - 10 : rect.y + rect.height + 10;
      const sy = Math.max(4, Math.min(py, vh - ph - 4));

      ctx.shadowColor = pal.s;
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(6,10,22,0.95)';
      this.roundRect(ctx, px, sy, pw, ph, 10);
      ctx.fill();
      ctx.strokeStyle = pal.s;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, px, sy, pw, ph, 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = pal.s;
      this.roundRect(ctx, px + 8, sy + 10, 4, ph - 20, 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = "bold 15px 'Rajdhani',sans-serif";
      const name = result.name || '—';
      const maxNameW = pw - 28;
      let displayName = name;
      while (ctx.measureText(displayName).width > maxNameW && displayName.length > 4)
        displayName = displayName.slice(0, -1);
      if (displayName !== name) displayName = displayName.slice(0, -1) + '…';
      ctx.fillText(displayName, px + 20, sy + 26);

      ctx.fillStyle = pal.s;
      ctx.font = "bold 11px 'Share Tech Mono',monospace";
      ctx.fillText(result.cardCode || '—', px + 20, sy + 44);

      const rarityColors: Record<string, string> = {
        'Secret Rare': '#FFD700',
        'Leader Rare': '#FFD700',
        'Super Rare': '#C3A6FF',
        Rare: '#4ECDC4',
        Uncommon: '#87CEEB',
        Common: 'rgba(200,200,200,0.7)',
      };
      const rc = rarityColors[result.rarity] || 'rgba(200,200,200,0.7)';
      const codeW = ctx.measureText(result.cardCode || '—').width;
      ctx.fillStyle = rc;
      ctx.font = "10px 'Share Tech Mono',monospace";
      ctx.fillText(`· ${result.rarity || '—'}`, px + 20 + codeW + 6, sy + 44);

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 16, sy + 54);
      ctx.lineTo(px + pw - 16, sy + 54);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = "9px 'Share Tech Mono',monospace";
      ctx.fillText('EU MIN', px + 20, sy + 70);

      ctx.fillStyle = '#4ECDC4';
      ctx.font = "bold 22px 'Rajdhani',sans-serif";
      const euText = result.minEu != null ? `€ ${Number(result.minEu).toFixed(2)}` : '€ —';
      ctx.fillText(euText, px + 20, sy + 92);

      if (hasIta) {
        const euW = ctx.measureText(euText).width;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = "9px 'Share Tech Mono',monospace";
        ctx.fillText('ITA', px + 20 + euW + 14, sy + 70);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = "bold 15px 'Rajdhani',sans-serif";
        ctx.fillText(`€ ${Number(result.minIta).toFixed(2)}`, px + 20 + euW + 14, sy + 92);
      }

      if (result.cardtraderUrl) {
        ctx.fillStyle = `${pal.s}99`;
        ctx.font = "9px 'Share Tech Mono',monospace";
        ctx.fillText('↗ cardtrader.com', px + 20, sy + ph - 10);
      }
    }
    ctx.restore();
  }

  // ── Warp ─────────────────────────────────────────────────────────
  private warpCard(points: { x: number; y: number }[]): HTMLCanvasElement {
    const cv = window.cv;
    const video = this.videoRef.nativeElement;
    const proc = this.procRef.nativeElement;
    const vw = video.videoWidth,
      vh = video.videoHeight;
    proc.width = vw;
    proc.height = vh;
    proc.getContext('2d')!.drawImage(video, 0, 0, vw, vh);

    const src = cv.imread(proc);
    const srcArr = points.flatMap((p: any) => [p.x, p.y]);
    const dstArr = [0, 0, CARD_W, 0, CARD_W, CARD_H, 0, CARD_H];
    const srcM = cv.matFromArray(4, 1, cv.CV_32FC2, srcArr);
    const dstM = cv.matFromArray(4, 1, cv.CV_32FC2, dstArr);
    const M = cv.getPerspectiveTransform(srcM, dstM);
    const warped = new cv.Mat();
    cv.warpPerspective(src, warped, M, new cv.Size(CARD_W, CARD_H));

    const tmp = document.createElement('canvas');
    tmp.width = CARD_W;
    tmp.height = CARD_H;
    cv.imshow(tmp, warped);

    [src, srcM, dstM, M, warped].forEach((m) => {
      try {
        m.delete();
      } catch {}
    });
    return tmp;
  }

  // ── Preview (Step 1) ─────────────────────────────────────────────
  handlePreview() {
    if (this.scanning()) return;

    if (!this.cards.length) {
      const video = this.videoRef.nativeElement;
      const tmp = document.createElement('canvas');
      tmp.width = video.videoWidth;
      tmp.height = video.videoHeight;
      tmp.getContext('2d')!.drawImage(video, 0, 0);
      this.excluded.set(new Set());
      this.previews.set([{ idx: 0, dataUrl: tmp.toDataURL('image/jpeg', 0.92), canvas: tmp }]);
      return;
    }

    const newPreviews: Preview[] = this.cards.map((card, idx) => {
      try {
        const tmp = this.warpCard(card.points);
        return { idx, dataUrl: tmp.toDataURL('image/jpeg', 0.92), canvas: tmp };
      } catch (e) {
        console.warn(`Preview carta ${idx}:`, e);
        return { idx, dataUrl: null, canvas: null };
      }
    });

    this.excluded.set(new Set());
    this.previews.set(newPreviews);
  }

  // ── Confirm & Send (Step 2) ───────────────────────────────────────
  async handleConfirmSend() {
    const prevs = this.previews();
    if (!prevs) return;
    this.scanning.set(true);
    const newResults: Record<number, CardResult> = {};

    for (const { idx, canvas } of prevs) {
      if (this.excluded().has(idx) || !canvas) continue;
      this.sendingIdx.set(idx);

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92),
      );
      const file = new File([blob], `card_${idx + 1}.jpg`, { type: 'image/jpeg' });

      await new Promise<void>((resolve) => {
        this.productsService.searchImage(file).subscribe({
          next: (data: any) => {
            const info = Array.isArray(data.productInfo) ? data.productInfo[0] : null;
            newResults[idx] = {
              name: info?.name || data.name || 'Sconosciuta',
              cardCode: info?.cardCode || '—',
              rarity: info?.fixed_properties?.onepiece_rarity || '—',
              minEu: info?.minEu ?? null,
              minIta: info?.minIta ?? null,
              cardtraderUrl: info?.cardtrader_url || null,
            };
            resolve();
          },
          error: () => {
            newResults[idx] = {
              name: 'Errore ricerca',
              cardCode: '—',
              rarity: '—',
              minEu: null,
              minIta: null,
              cardtraderUrl: null,
            };
            resolve();
          },
        });
      });
    }

    this.results.set({ ...newResults });
    this.scanning.set(false);
    this.sendingIdx.set(null);
    this.previews.set(null);
  }

  // ── Reset ────────────────────────────────────────────────────────
  handleReset() {
    this.results.set({});
    this.trackers = [];
    this.cards = [];
    this.previews.set(null);
    this.excluded.set(new Set());
  }

  closePreviews() {
    this.previews.set(null);
  }
  toggleDebug() {
    this.debug.update((v) => !v);
  }
  reload() {
    window.location.reload();
  }
}
