import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error404',
  imports: [RouterLink],
  templateUrl: './error404.html',
  styleUrl: './error404.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export default class Error404 {

}
