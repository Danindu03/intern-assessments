import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Vessel, VesselPayload } from '../models/vessel.model';
import { ListQuery, PagedResult } from '../models/common';
import { SEED_VESSELS } from '../data/seed-vessels';

const LATENCY = 500;

/**
 * Same pattern as CustomerService. The vessel screens that use this service
 * are the part of the app you are asked to build.
 */
@Injectable({ providedIn: 'root' })
export class VesselService {
  private readonly rows = signal<Vessel[]>([...SEED_VESSELS]);

  list(query: ListQuery): Observable<PagedResult<Vessel>> {
    const search = query.search.trim().toLowerCase();
    let filtered = this.rows();

    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.vesselName.toLowerCase().includes(search) ||
          v.imoNumber.includes(search),
      );
    }
    if (query.status !== 'all') {
      filtered = filtered.filter((v) => v.isActive === (query.status === 'active'));
    }

    const start = (query.page - 1) * query.pageSize;
    const result: PagedResult<Vessel> = {
      items: filtered.slice(start, start + query.pageSize),
      totalCount: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
    };
    return of(result).pipe(delay(LATENCY));
  }

  getById(id: number): Observable<Vessel> {
    const found = this.rows().find((v) => v.vesselId === id);
    return found
      ? of({ ...found }).pipe(delay(LATENCY))
      : throwError(() => new Error('Vessel not found.')).pipe(delay(LATENCY));
  }

  create(payload: VesselPayload): Observable<Vessel> {
    if (this.imoTaken(payload.imoNumber, null)) {
      return throwError(() => new Error('That IMO number is already registered.')).pipe(delay(LATENCY));
    }
    const created: Vessel = {
      ...payload,
      vesselId: Math.max(0, ...this.rows().map((v) => v.vesselId)) + 1,
      isActive: true,
    };
    this.rows.update((list) => [created, ...list]);
    return of(created).pipe(delay(LATENCY));
  }

  update(id: number, payload: VesselPayload): Observable<Vessel> {
    if (this.imoTaken(payload.imoNumber, id)) {
      return throwError(() => new Error('That IMO number is already registered.')).pipe(delay(LATENCY));
    }
    const current = this.rows().find((v) => v.vesselId === id);
    if (!current) {
      return throwError(() => new Error('Vessel not found.')).pipe(delay(LATENCY));
    }
    const updated: Vessel = { ...current, ...payload };
    this.rows.update((list) => list.map((v) => (v.vesselId === id ? updated : v)));
    return of(updated).pipe(delay(LATENCY));
  }

  setActive(id: number, isActive: boolean): Observable<void> {
    this.rows.update((list) => list.map((v) => (v.vesselId === id ? { ...v, isActive } : v)));
    return of(void 0).pipe(delay(LATENCY));
  }

  private imoTaken(imo: string, exceptId: number | null): boolean {
    return this.rows().some((v) => v.imoNumber === imo.trim() && v.vesselId !== exceptId);
  }
}
