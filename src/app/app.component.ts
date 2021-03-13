import { SessionService } from './services/session.service';
import { Component } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth' // https://github.com/FirebaseExtended/angularfire/issues/968

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Odin';
  constructor(public session: SessionService) {
    this.session.initAuthListener();
   }
}