import { isPlatformServer } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  RESPONSE_INIT,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="terminal">
        <div class="term-head">
          <span class="win-dots"><i></i><i></i><i></i></span>
          <span class="term-title">core_dumped — zsh</span>
        </div>
        <div class="term-body">
          <p class="line"><span class="ps1">brent&#64;trail:~$</span> cd {{ '\$_REQUESTED_PATH' }}</p>
          <p class="line err">zsh: segmentation fault (core dumped)</p>
          <p class="line err big">Error 404: route not found</p>
          <p class="line muted">// you took a wrong turn off the trail. no such path on this server.</p>
          <p class="line muted">// stack trace: you → ??? → 404</p>
          <p class="line">
            <span class="ps1">brent&#64;trail:~$</span>
            <a [routerLink]="['/']" class="home-link">cd ~/ &amp;&amp; ./restart.sh</a><span class="crg-cursor"></span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      font-family: var(--crg-mono, monospace);
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .not-found-container {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .terminal {
      width: 100%;
      max-width: 640px;
      background: #0a0e14;
      border: 1px solid var(--crg-border, #30363d);
      border-radius: 12px;
      box-shadow: 0 0 0 1px rgba(255, 95, 86, 0.12), 0 24px 60px rgba(0, 0, 0, 0.6);
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
    .line { margin: 0.35rem 0; font-size: 0.95rem; color: var(--crg-text, #e6edf3); }
    .ps1 { color: var(--crg-cyan, #39d0ff); margin-right: 0.5rem; }
    .muted { color: var(--crg-text-dim, #8b949e); }
    .err { color: #ff6b6b; }
    .err.big { font-size: 1.4rem; font-weight: 800; margin: 0.75rem 0; }

    .home-link { color: var(--crg-green, #00ff66); text-decoration: none; }
    .home-link:hover { text-decoration: underline; text-shadow: 0 0 10px rgba(0, 255, 102, 0.6); }

    @media (max-width: 768px) {
      .term-body { padding: 1.25rem 1.1rem 1.5rem; }
      .err.big { font-size: 1.15rem; }
      .line { font-size: 0.85rem; }
    }
  `],
})
export class NotFoundComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private response = inject(RESPONSE_INIT, { optional: true });

  ngOnInit(): void {
    // Set HTTP status to 404 when running on server (SSR)
    if (isPlatformServer(this.platformId) && this.response) {
      this.response.status = 404;
    }
  }
}
