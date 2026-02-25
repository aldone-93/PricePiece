import { Component, DEFAULT_CURRENCY_CODE, LOCALE_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { Header } from './shared/components/header/header';

registerLocaleData(localeIt);
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
  ],
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pricePiece');
}
