import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { User } from '../../services/user';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection:ChangeDetectionStrategy.OnPush  
})
export default class Profile {

 public auth = inject(Auth);
  private router = inject(Router);
  public userService = inject(User);

  // Estado del Menú Móvil
  isMobileMenuOpen = signal(false);

  stats = signal({
    orders: 3,
    wishlist: 12,
    points: 450
  });

  constructor() {
    // Cerrar el menú móvil automáticamente al navegar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileMenuOpen.set(false);
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout() {
    this.auth.logOut();
  }

}
