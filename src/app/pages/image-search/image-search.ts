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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../../shared/services/products';

interface CardResult {
  name: string;
  cardCode: string;
  rarity: string;
  minEu: number | null;
  minIta: number | null;
  cardtraderUrl: string | null;
}

@Component({
  selector: 'app-image-search',
  imports: [CommonModule],
  templateUrl: './image-search.html',
  styleUrl: './image-search.scss',
})
export class ImageSearch implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('viewfinderEl') viewfinderRef!: ElementRef<HTMLDivElement>;

  private productsService = inject(Products);

  // ── Signals ─────────────────────────────────────────────────────
  camReady = signal(false);
  camError = signal(false);
  scanning = signal(false);
  result = signal<CardResult | null>(null);
  error = signal<string | null>(null);
  previewUrl = signal<string | null>(null);

  ready = computed(() => this.camReady());
  hasResult = computed(() => this.result() !== null);

  // ── Template helpers ─────────────────────────────────────────────
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

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit() {
    this.loadFonts();
  }

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    const video = this.videoRef?.nativeElement;
    const stream = video?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
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
        video.onloadedmetadata = () => this.camReady.set(true);
      })
      .catch(() => this.camError.set(true));
  }


  // ── Capture viewfinder region ─────────────────────────────────────
  private captureViewfinder(): HTMLCanvasElement {
    const video = this.videoRef.nativeElement;
    const vf = this.viewfinderRef.nativeElement;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const rect = vf.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    const displayW = videoRect.width;
    const displayH = videoRect.height;

    // Map CSS viewfinder coords → native video pixels (object-fit: cover)
    const renderScale = Math.max(displayW / vw, displayH / vh);
    const offX = (displayW - vw * renderScale) / 2;
    const offY = (displayH - vh * renderScale) / 2;

    const relLeft = rect.left - videoRect.left;
    const relTop = rect.top - videoRect.top;
    const srcX = (relLeft - offX) / renderScale;
    const srcY = (relTop - offY) / renderScale;
    const srcW = rect.width / renderScale;
    const srcH = rect.height / renderScale;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);
    canvas.getContext('2d')!.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    return canvas;
  }

  // ── Scan ──────────────────────────────────────────────────────────
  async scan() {
    if (!this.ready() || this.scanning()) return;
    this.scanning.set(true);
    this.error.set(null);
    this.result.set(null);

    const canvas = this.captureViewfinder();
    this.previewUrl.set(canvas.toDataURL('image/jpeg', 0.92));

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92),
    );
    const file = new File([blob], 'card.jpg', { type: 'image/jpeg' });

    this.productsService.searchImage(file).subscribe({
      next: (data: any) => {
        const info = Array.isArray(data.productInfo) ? data.productInfo[0] : null;
        this.result.set({
          name: info?.name || data.name || 'Sconosciuta',
          cardCode: info?.cardCode || '—',
          rarity: info?.fixed_properties?.onepiece_rarity || '—',
          minEu: info?.minEu ?? null,
          minIta: info?.minIta ?? null,
          cardtraderUrl: info?.cardtrader_url || null,
        });
        this.scanning.set(false);
      },
      error: () => {
        this.error.set('Errore durante la ricerca. Riprova.');
        this.scanning.set(false);
      },
    });
  }

  // ── Reset ─────────────────────────────────────────────────────────
  reset() {
    this.result.set(null);
    this.error.set(null);
    this.previewUrl.set(null);
  }

  reload() {
    location.reload();
  }
}
