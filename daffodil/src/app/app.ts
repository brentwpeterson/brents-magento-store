import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './daff/navigation/components/navigation.component';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('ng20-app');
}
