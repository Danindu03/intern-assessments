import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { ToastHost } from '../../shared/toast/toast';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const COLLAPSE_KEY = 'ia.sidebar.collapsed';

/**
 * App frame: collapsible sidebar, top bar and the routed page.
 * On desktop the sidebar collapses to icons; on mobile it slides over
 * the content and closes when a link is tapped.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly collapsed = signal(localStorage.getItem(COLLAPSE_KEY) === 'true');
  protected readonly mobileOpen = signal(false);

  protected readonly initials = computed(() => {
    const name = this.user()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'ri-dashboard-line', route: '/dashboard' },
    { label: 'Customers', icon: 'ri-group-line', route: '/customers' },
    { label: 'Vessels', icon: 'ri-ship-line', route: '/vessels' },
  ];

  protected toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.mobileOpen.update((open) => !open);
      return;
    }
    this.collapsed.update((value) => {
      localStorage.setItem(COLLAPSE_KEY, String(!value));
      return !value;
    });
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
