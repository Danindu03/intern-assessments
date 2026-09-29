import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Customer, CustomerPayload } from '../models/customer.model';
import { ListQuery, PagedResult } from '../models/common';
import { SEED_CUSTOMERS } from '../data/seed-customers';

/** How long the fake "network" takes, so loading states are visible. */
const LATENCY = 500;

/**
 * Stands in for the real API. Data lives in memory, so changes are kept
 * until the page is refreshed. The method signatures match what a real
 * HTTP service would look like, so swapping in HttpClient later is easy.
 */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly rows = signal<Customer[]>([...SEED_CUSTOMERS]);

  list(query: ListQuery): Observable<PagedResult<Customer>> {
    const search = query.search.trim().toLowerCase();
    let filtered = this.rows();

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.customerName.toLowerCase().includes(search) ||
          c.customerCode.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search),
      );
    }
    if (query.status !== 'all') {
      filtered = filtered.filter((c) => c.isActive === (query.status === 'active'));
    }

    const start = (query.page - 1) * query.pageSize;
    const result: PagedResult<Customer> = {
      items: filtered.slice(start, start + query.pageSize),
      totalCount: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
    };
    return of(result).pipe(delay(LATENCY));
  }

  getById(id: number): Observable<Customer> {
    const found = this.rows().find((c) => c.customerId === id);
    return found
      ? of({ ...found }).pipe(delay(LATENCY))
      : throwError(() => new Error('Customer not found.')).pipe(delay(LATENCY));
  }

  create(payload: CustomerPayload): Observable<Customer> {
    if (this.codeTaken(payload.customerCode, null)) {
      return throwError(() => new Error('That customer code is already in use.')).pipe(delay(LATENCY));
    }
    const created: Customer = {
      ...payload,
      customerId: Math.max(0, ...this.rows().map((c) => c.customerId)) + 1,
      isActive: true,
    };
    this.rows.update((list) => [created, ...list]);
    return of(created).pipe(delay(LATENCY));
  }

  update(id: number, payload: CustomerPayload): Observable<Customer> {
    if (this.codeTaken(payload.customerCode, id)) {
      return throwError(() => new Error('That customer code is already in use.')).pipe(delay(LATENCY));
    }
    const current = this.rows().find((c) => c.customerId === id);
    if (!current) {
      return throwError(() => new Error('Customer not found.')).pipe(delay(LATENCY));
    }
    const updated: Customer = { ...current, ...payload };
    this.rows.update((list) => list.map((c) => (c.customerId === id ? updated : c)));
    return of(updated).pipe(delay(LATENCY));
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    this.rows.update((list) => list.map((c) => (c.customerId === id ? { ...c, isActive } : c)));
    return of(void 0).pipe(delay(LATENCY));
  }

  private codeTaken(code: string, exceptId: number | null): boolean {
    const wanted = code.trim().toLowerCase();
    return this.rows().some(
      (c) => c.customerCode.toLowerCase() === wanted && c.customerId !== exceptId,
    );
  }
}
