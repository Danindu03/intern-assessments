import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export interface AppUser {
  userId: number;
  fullName: string;
  role: string;
  companyName: string;
}

const STORAGE_KEY = 'ia.user';

/**
 * Mock authentication. There is no backend in this project, so any of the
 * demo accounts below will sign you in. Do not copy this for real systems.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly _user = signal<AppUser | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  login(username: string, password: string): Observable<AppUser> {
    const ok = password === 'demo1234' && ['agent', 'admin'].includes(username.toLowerCase());
    if (!ok) {
      return throwError(() => new Error('Wrong username or password.')).pipe(delay(600));
    }
    const user: AppUser = {
      userId: username.toLowerCase() === 'admin' ? 1 : 2,
      fullName: username.toLowerCase() === 'admin' ? 'Admin User' : 'Operations Agent',
      role: username.toLowerCase() === 'admin' ? 'Administrator' : 'Agent',
      companyName: 'Hayleys Advantis',
    };
    return of(user).pipe(delay(600));
  }

  setUser(user: AppUser): void {
    this._user.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private restore(): AppUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }
}
