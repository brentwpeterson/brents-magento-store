import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import {
  NavigationStateService,
  NavigationState,
} from './state/navigation.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [NavigationStateService],
  template: `
    <ng-content></ng-content>
    <nav class="megamenu-navigation">
      <div class="nav-container">
        <a [routerLink]="['/']" class="store-name">
          <span class="win-dots"><i></i><i></i><i></i></span>
          <span class="prompt">brent&#64;trail</span><span class="punct">:</span><span class="path">~/store</span><span class="punct">$</span>
          <span class="brand">the-coding-running-guy</span>
        </a>
        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle navigation">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        <ul class="nav-list" [class.mobile-open]="isMobileMenuOpen">
          @if (navigationState$ | async; as state) {
            @if (state.loading) {
              <li class="nav-loading">booting menu...</li>
            } @else if (state.error) {
              <li class="nav-error">
                <span>menu: command not found</span>
                <button (click)="retry()" class="retry-btn">retry</button>
              </li>
            } @else if (state.data) {
              @for (item of state.data.children || []; track item.id) {
                <li
                  class="nav-item"
                  [class.has-dropdown]="item.children && item.children.length > 0">
                  <a [routerLink]="item.url" class="nav-link" (click)="closeMobileMenu()">{{ item.name }}</a>
                  @if (item.children && item.children.length > 0) {
                    <div class="megamenu-dropdown">
                      <div class="dropdown-content">
                        <div class="category-column">
                          <ul class="subcategory-list">
                            @for (subItem of item.children; track subItem.id) {
                              <li class="subcategory-item">
                                <a [routerLink]="subItem.url" class="subcategory-link" (click)="closeMobileMenu()">{{ subItem.name }}</a>
                              </li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  }
                </li>
              }
            }
          }
        </ul>
      </div>
    </nav>
    <div class="mobile-overlay" [class.active]="isMobileMenuOpen" (click)="closeMobileMenu()"></div>
  `,
  styles: [`
    .megamenu-navigation {
      width: 100%;
      background: var(--crg-surface, #161b22);
      border-bottom: 1px solid var(--crg-border, #30363d);
      padding: 0.75rem 0;
      line-height: 1.2;
      font-family: var(--crg-mono, monospace);
    }

    .nav-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .store-name {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      justify-self: start;
      text-decoration: none;
      white-space: nowrap;
    }

    .win-dots { display: inline-flex; gap: 5px; margin-right: 0.35rem; }
    .win-dots i {
      width: 11px; height: 11px; border-radius: 50%; display: block;
    }
    .win-dots i:nth-child(1) { background: #ff5f56; }
    .win-dots i:nth-child(2) { background: #ffbd2e; }
    .win-dots i:nth-child(3) { background: #27c93f; }

    .prompt { color: var(--crg-cyan, #39d0ff); }
    .punct  { color: var(--crg-text-dim, #8b949e); }
    .path   { color: var(--crg-text-dim, #8b949e); }
    .brand  {
      color: var(--crg-green, #00ff66);
      text-shadow: 0 0 8px rgba(0, 255, 102, 0.45);
      margin-left: 0.4rem;
    }
    .store-name:hover .brand { text-decoration: underline; }

    .nav-list {
      display: flex;
      justify-content: center;
      list-style: none;
      gap: 1.5rem;
      align-items: center;
      margin: 0;
      grid-column: 2;
      padding: 0;
    }

    .nav-item { position: relative; }

    .nav-link {
      padding: 0.4rem 0.85rem;
      text-decoration: none;
      color: var(--crg-text, #e6edf3);
      font-weight: 500;
      font-size: 0.9rem;
      border-radius: 4px;
      transition: color 0.15s ease, background-color 0.15s ease;
      display: block;
    }
    .nav-link::before { content: "./"; color: var(--crg-text-dim, #8b949e); }
    .nav-link:hover { color: var(--crg-green, #00ff66); background-color: var(--crg-surface-2, #1c2230); }

    .has-dropdown:hover .megamenu-dropdown { display: block; }

    .megamenu-dropdown {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--crg-surface, #161b22);
      border: 1px solid var(--crg-border, #30363d);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      min-width: 220px;
      z-index: 1000;
      padding: 0.5rem 0;
    }

    .dropdown-content { padding: 0; }
    .category-column { width: 100%; }
    .subcategory-list { list-style: none; padding: 0; margin: 0; }
    .subcategory-item { width: 100%; }

    .subcategory-link {
      display: block;
      padding: 0.5rem 1rem;
      color: var(--crg-text-dim, #8b949e);
      text-decoration: none;
      font-size: 0.85rem;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .subcategory-link:hover { background-color: var(--crg-surface-2, #1c2230); color: var(--crg-green, #00ff66); }

    .nav-loading { color: var(--crg-text-dim, #8b949e); font-size: 0.9rem; padding: 0.5rem 1rem; }

    .nav-error {
      color: var(--crg-text-dim, #8b949e);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .retry-btn {
      padding: 0.25rem 0.6rem;
      background: transparent;
      color: var(--crg-green, #00ff66);
      border: 1px solid var(--crg-green-dim, #0b9c45);
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.75rem;
      font-family: var(--crg-mono, monospace);
    }
    .retry-btn:hover { background: var(--crg-green, #00ff66); color: var(--crg-bg, #0d1117); }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      padding: 0.5rem;
      gap: 3px;
      justify-self: end;
    }
    .hamburger-line { width: 22px; height: 2px; background: var(--crg-green, #00ff66); transition: all 0.3s ease; }

    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .mobile-overlay.active { display: block; opacity: 1; }

    @media (max-width: 768px) {
      .nav-container { grid-template-columns: auto 1fr auto; position: relative; }
      .store-name { font-size: 0.8rem; }
      .path, .prompt, .punct { display: none; }
      .mobile-menu-toggle { display: flex; }

      .nav-list {
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: var(--crg-surface, #161b22);
        border-left: 1px solid var(--crg-border, #30363d);
        flex-direction: column;
        justify-content: flex-start;
        padding: 2rem 1.5rem;
        gap: 0;
        z-index: 1000;
        transform: translateX(100%);
        overflow-y: auto;
      }
      :host-context(body:hover) .nav-list { transition: transform 0.3s ease; }
      .nav-list.mobile-open { transform: translateX(0); }

      .nav-item { width: 100%; border-bottom: 1px solid var(--crg-border, #30363d); margin-bottom: 0.5rem; }
      .nav-item:last-child { border-bottom: none; }
      .nav-link { padding: 1rem 0; width: 100%; font-size: 1.05rem; }

      .megamenu-dropdown { position: static; display: block; border: none; box-shadow: none; padding: 0; }
      .has-dropdown .megamenu-dropdown { display: block; }
      .subcategory-link { padding: 0.5rem 0; }
    }
  `],
})
export class NavigationComponent implements OnInit {
  private navigationStateService = inject(NavigationStateService);

  navigationState$!: Observable<NavigationState>;
  isMobileMenuOpen = false;

  ngOnInit(): void {
    this.navigationState$ = this.navigationStateService.state$;
  }

  retry(): void {
    this.navigationStateService.retry();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
