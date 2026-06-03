import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { ProductListComponent } from '../../product/components/product-list/product-list.component';

// ---------------------------------------------------------------------------
// EDIT YOUR STORE BRANDING HERE
// ---------------------------------------------------------------------------
const STORE_NAME = 'the-coding-running-guy';
const HERO_TITLE_1 = 'Gear that compiles.';
const HERO_TITLE_2 = 'Miles that ship.';
const HERO_SUB = '// apparel, gear & watches for devs who chase PRs (and PRs)';
// ---------------------------------------------------------------------------

interface FeaturedProduct {
  sku: string;
  name: string;
  url: string;
  price: number | null;
  imageUrl: string;
  imageLabel: string;
}

interface CategoryTile {
  uid: string;
  path: string;
  name: string;
  count: number;
  icon: string;
}

const FEATURED_QUERY = `
  query Featured($uid: String!) {
    products(filter: { category_uid: { eq: $uid } }, pageSize: 8) {
      items {
        sku
        name
        url_rewrites { url }
        price_range { minimum_price { final_price { value } } }
        thumbnail { url label }
      }
    }
  }
`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [ProductListComponent, RouterLink, CurrencyPipe, NgOptimizedImage],
  template: `
    <!-- HERO: a terminal window -->
    <section class="hero">
      <div class="terminal">
        <div class="term-head">
          <span class="win-dots"><i></i><i></i><i></i></span>
          <span class="term-title">{{ storeName }} — zsh</span>
        </div>
        <div class="term-body">
          <p class="line"><span class="ps1">brent&#64;trail:~$</span> ./run.sh --pace=fast --distance=5k</p>
          <p class="line muted">&gt; warming up<span class="dots-anim">...</span> <span class="ok">ok</span></p>
          <p class="line muted">&gt; compiling stride<span class="dots-anim">...</span> <span class="ok">done</span> in 5k ms</p>
          <h1 class="hero-title">{{ heroTitle1 }}<br><span class="glow">{{ heroTitle2 }}</span></h1>
          <p class="hero-sub">{{ heroSub }}</p>
          <p class="line">
            <span class="ps1">brent&#64;trail:~$</span>
            <button class="run-btn" (click)="scrollToShop()">git commit -m "another mile"</button><span class="crg-cursor"></span>
          </p>
        </div>
      </div>
    </section>

    <!-- CATEGORY TILES -->
    <section class="block">
      <h2 class="section-title"><span class="sep">$</span> ls ./categories</h2>
      <div class="category-grid">
        @for (cat of categories; track cat.uid) {
          <button
            class="category-tile"
            [class.active]="cat.uid === activeCategory().uid"
            (click)="selectCategory(cat)"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.path }}/</span>
            <span class="category-count">{{ cat.count }} files</span>
          </button>
        }
      </div>
    </section>

    <!-- FEATURED ROW (driven by the selected category) -->
    <section class="block">
      <div class="section-header">
        <h2 class="section-title"><span class="sep">$</span> grep --featured {{ activeCategory().path }}/</h2>
      </div>

      @if (loading()) {
        <div class="state-msg">fetching<span class="dots-anim">...</span></div>
      } @else if (featured().length === 0) {
        <div class="state-msg">// 0 results — try another directory</div>
      } @else {
        <div class="product-grid">
          @for (p of featured(); track p.sku; let i = $index) {
            <a [routerLink]="p.url" class="product-card">
              <div class="product-image-container">
                <img
                  class="product-image"
                  [ngSrc]="p.imageUrl"
                  [alt]="p.imageLabel"
                  [priority]="i < 4"
                  [loading]="i < 4 ? undefined : 'lazy'"
                  fill
                />
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ p.name }}</h3>
                <span class="current-price">{{ (p.price || 0) | currency }}</span>
              </div>
            </a>
          }
        </div>
      }
    </section>

    <!-- FULL CATALOG -->
    <section id="shop-all" class="shop-all">
      <app-product-list></app-product-list>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--crg-text, #e6edf3);
      font-family: var(--crg-mono, monospace);
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--crg-text, #e6edf3);
      margin: 0;
    }
    .section-title .sep { color: var(--crg-green, #00ff66); margin-right: 0.4rem; }

    /* HERO TERMINAL */
    .hero { padding: 3rem 2rem 1rem; max-width: 1000px; margin: 0 auto; }
    .terminal {
      background: #0a0e14;
      border: 1px solid var(--crg-border, #30363d);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(0,255,102,0.08), 0 24px 60px rgba(0,0,0,0.6);
      overflow: hidden;
    }
    .term-head {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      background: var(--crg-surface, #161b22);
      border-bottom: 1px solid var(--crg-border, #30363d);
    }
    .win-dots { display: inline-flex; gap: 6px; }
    .win-dots i { width: 12px; height: 12px; border-radius: 50%; display: block; }
    .win-dots i:nth-child(1) { background: #ff5f56; }
    .win-dots i:nth-child(2) { background: #ffbd2e; }
    .win-dots i:nth-child(3) { background: #27c93f; }
    .term-title { color: var(--crg-text-dim, #8b949e); font-size: 0.8rem; }

    .term-body { padding: 1.75rem 2rem 2rem; }
    .line { margin: 0.25rem 0; font-size: 0.95rem; }
    .ps1 { color: var(--crg-cyan, #39d0ff); margin-right: 0.5rem; }
    .muted { color: var(--crg-text-dim, #8b949e); }
    .ok { color: var(--crg-green, #00ff66); }

    .hero-title {
      font-size: 2.9rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin: 1.5rem 0 0.75rem;
      color: var(--crg-text, #e6edf3);
    }
    .hero-title .glow { color: var(--crg-green, #00ff66); text-shadow: 0 0 18px rgba(0,255,102,0.5); }
    .hero-sub { color: var(--crg-text-dim, #8b949e); font-size: 1rem; margin: 0 0 1.5rem; }

    .run-btn {
      background: transparent;
      color: var(--crg-green, #00ff66);
      border: none;
      font-family: var(--crg-mono, monospace);
      font-size: 0.95rem;
      cursor: pointer;
      padding: 0;
    }
    .run-btn:hover { text-decoration: underline; text-shadow: 0 0 10px rgba(0,255,102,0.6); }

    @keyframes dots { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
    .dots-anim { animation: dots 1.4s ease-in-out infinite; }

    /* BLOCKS */
    .block { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 0; }
    .section-header { display: flex; align-items: center; justify-content: space-between; }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .category-tile {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.35rem;
      padding: 1.25rem 1.1rem;
      background: var(--crg-surface, #161b22);
      border: 1px solid var(--crg-border, #30363d);
      border-radius: 10px;
      cursor: pointer;
      font-family: var(--crg-mono, monospace);
      transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .category-tile:hover {
      transform: translateY(-2px);
      border-color: var(--crg-green-dim, #0b9c45);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    .category-tile.active {
      border-color: var(--crg-green, #00ff66);
      box-shadow: 0 0 0 1px var(--crg-green, #00ff66), 0 0 24px rgba(0,255,102,0.18);
    }
    .category-icon { font-size: 1.75rem; line-height: 1; }
    .category-name { font-weight: 700; color: var(--crg-green, #00ff66); font-size: 0.95rem; }
    .category-count { font-size: 0.75rem; color: var(--crg-text-dim, #8b949e); }

    /* PRODUCT GRID */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .product-card {
      background: var(--crg-surface, #161b22);
      border: 1px solid var(--crg-border, #30363d);
      border-radius: 10px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .product-card:hover { transform: translateY(-3px); border-color: var(--crg-green-dim, #0b9c45); }
    .product-image-container {
      aspect-ratio: 1;
      position: relative;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .product-image { max-width: 100%; max-height: 100%; object-fit: contain; }
    .product-info { padding: 0.9rem 1rem; }
    .product-name { font-size: 0.85rem; font-weight: 500; color: var(--crg-text, #e6edf3); margin: 0 0 0.4rem; line-height: 1.4; }
    .current-price { font-size: 0.9rem; font-weight: 700; color: var(--crg-amber, #ffcc00); }
    .current-price::before { content: "$ "; color: var(--crg-text-dim, #8b949e); }

    .state-msg { padding: 3rem 1rem; text-align: center; color: var(--crg-text-dim, #8b949e); }

    .shop-all { padding-top: 1.5rem; }

    @media (max-width: 768px) {
      .hero { padding: 2rem 1rem 0.5rem; }
      .term-body { padding: 1.25rem 1.1rem 1.5rem; }
      .hero-title { font-size: 2rem; }
      .block { padding: 1.75rem 1rem 0; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);

  readonly storeName = STORE_NAME;
  readonly heroTitle1 = HERO_TITLE_1;
  readonly heroTitle2 = HERO_TITLE_2;
  readonly heroSub = HERO_SUB;

  readonly categories: CategoryTile[] = [
    { uid: 'Mw==', path: 'gear', name: 'Gear', count: 34, icon: '🎒' },
    { uid: 'MjE=', path: 'womens-tops', name: "Women's Tops", count: 50, icon: '👚' },
    { uid: 'MTI=', path: 'mens-tops', name: "Men's Tops", count: 48, icon: '👕' },
    { uid: 'NA==', path: 'bags', name: 'Bags', count: 14, icon: '👜' },
    { uid: 'Ng==', path: 'watches', name: 'Watches', count: 9, icon: '⌚' },
    { uid: 'NQ==', path: 'fitness', name: 'Fitness', count: 11, icon: '🏋️' },
  ];

  readonly activeCategory = signal<CategoryTile>(this.categories[0]);
  readonly featured = signal<FeaturedProduct[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadFeatured(this.activeCategory());
  }

  selectCategory(cat: CategoryTile): void {
    if (cat.uid === this.activeCategory().uid) { return; }
    this.activeCategory.set(cat);
    this.loadFeatured(cat);
  }

  private loadFeatured(cat: CategoryTile): void {
    this.loading.set(true);
    this.http
      .post<any>('/graphql', { query: FEATURED_QUERY, variables: { uid: cat.uid } })
      .subscribe({
        next: (res) => {
          const items = res?.data?.products?.items ?? [];
          this.featured.set(items.map((it: any): FeaturedProduct => ({
            sku: it.sku,
            name: it.name,
            url: '/' + (it.url_rewrites?.[0]?.url ?? ''),
            price: it.price_range?.minimum_price?.final_price?.value ?? null,
            imageUrl: it.thumbnail?.url ?? '',
            imageLabel: it.thumbnail?.label ?? it.name,
          })));
          this.loading.set(false);
        },
        error: () => {
          this.featured.set([]);
          this.loading.set(false);
        },
      });
  }

  scrollToShop(): void {
    document.getElementById('shop-all')?.scrollIntoView({ behavior: 'smooth' });
  }
}
