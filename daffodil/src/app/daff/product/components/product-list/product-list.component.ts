import {
  AsyncPipe,
  CurrencyPipe,
  NgOptimizedImage,
} from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import {
  ProductListStateService,
  ProductListState,
} from './state/product-list.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe, AsyncPipe, NgOptimizedImage, RouterLink],
  providers: [ProductListStateService],
  template: `
    <div class="merchandise-section">
      <div class="section-header">
        <h1><span class="sep">$</span> ls ./store --all</h1>
      </div>

      @if (state$ | async; as state) {
        @if (state.error) {
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>fatal: could not load products</h3>
            <p>{{ state.error.message || 'Something went wrong while fetching products.' }}</p>
            <p>// try switching drivers in the debug bar below, then retry</p>
            <button class="retry-button" (click)="retry()">$ retry</button>
          </div>
        } @else if (state.loading) {
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>compiling catalog...</p>
          </div>
        } @else {
          <div class="product-grid">
            @for (item of state.data; track item.id; let i = $index) {
              <a [routerLink]="item.url" [queryParams]="{key: 'test'}" class="product-card">
                <div class="product-image-container">
                  <div style="position: relative;
    aspect-ratio: 1;
    display:flex;
    width: 100%;
    align-items: center;
    justify-content: center"
    >
    <img
                    class="product-image"
                    [ngSrc]="item.thumbnail.url"
                    [alt]="item.thumbnail.label"
                    [priority]="i < 4"
                    [loading]="i < 4 ? undefined : 'lazy'"
                    fill
                  />
    </div>
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ item.name }}</h3>
                  <span class="product-category">{{ item.brand }}</span>
                  <div class="price-container">
                    <span class="current-price">{{ (item.price || 0) | currency }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      font-family: var(--crg-mono, monospace);
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .merchandise-section {
      padding: 2rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.35rem;
      color: var(--crg-text, #e6edf3);
      font-weight: 700;
      margin: 0;
    }
    h1 .sep { color: var(--crg-green, #00ff66); margin-right: 0.4rem; }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
    }

    .product-card {
      background: var(--crg-surface, #161b22);
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
      border: 1px solid var(--crg-border, #30363d);
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .product-card:hover {
      transform: translateY(-3px);
      border-color: var(--crg-green-dim, #0b9c45);
    }

    .product-image-container {
      aspect-ratio: 1;
      position: relative;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .product-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .product-info {
      padding: 0.9rem 1rem;
      background: var(--crg-surface, #161b22);
    }

    .product-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--crg-text, #e6edf3);
      margin: 0 0 0.25rem 0;
      line-height: 1.4;
    }

    .product-category {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--crg-text-dim, #8b949e);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 0.5rem;
    }

    .price-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .current-price {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--crg-amber, #ffcc00);
    }
    .current-price::before { content: "$ "; color: var(--crg-text-dim, #8b949e); }

    @media screen and (max-width: 768px) {
      .merchandise-section { padding: 1rem; }
      h1 { font-size: 1.15rem; }
      .product-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }
      .section-header { margin-bottom: 1rem; }
    }

    .error-container {
      text-align: center;
      padding: 3rem 1rem;
      background: var(--crg-surface, #161b22);
      border: 1px solid #6e2230;
      border-radius: 10px;
      margin: 2rem 0;
    }

    .error-icon { font-size: 3rem; margin-bottom: 1rem; }

    .error-container h3 {
      color: #ff6b6b;
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }

    .error-container p {
      color: var(--crg-text-dim, #8b949e);
      margin: 0 0 1.5rem 0;
    }

    .retry-button {
      background: transparent;
      color: var(--crg-green, #00ff66);
      border: 1px solid var(--crg-green-dim, #0b9c45);
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--crg-mono, monospace);
      transition: background-color 0.2s, color 0.2s;
    }
    .retry-button:hover { background: var(--crg-green, #00ff66); color: var(--crg-bg, #0d1117); }

    .loading-container { text-align: center; padding: 3rem 1rem; }

    .loading-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 1rem;
      border: 3px solid var(--crg-border, #30363d);
      border-top: 3px solid var(--crg-green, #00ff66);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-container p { color: var(--crg-text-dim, #8b949e); margin: 0; }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
})
export class ProductListComponent implements OnInit {
  state$!: Observable<ProductListState>;

  private stateService = inject(ProductListStateService);

  constructor() { }

  ngOnInit(): void {
    this.state$ = this.stateService.state$;
  }

  retry() {
    this.stateService.retry();
  }
}
