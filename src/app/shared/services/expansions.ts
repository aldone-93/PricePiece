import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { ExpansionBooster, GetExpansions } from '../models/expansionService.model';

@Injectable({
  providedIn: 'root',
})
export class Expansions {
  private readonly httpClient = inject(HttpClient);

  getAllExpansions() {
    return this.httpClient
      .get<GetExpansions>(environment.API_URL + 'api/expansions')
      .pipe(map((response) => response.expansions as ExpansionBooster[]));
  }
}
