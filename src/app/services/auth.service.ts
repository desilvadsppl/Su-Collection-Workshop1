import { Injectable, signal, inject, NgZone } from '@angular/core';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private zone = inject(NgZone);

  user = signal<User | null>(null);
  isAdmin = signal<boolean>(false);
  isInitialized = signal<boolean>(false);

  constructor() {
    const adminEmails = [
      'lakshan.yatiwella@gmail.com',
      'deshanthv@gmail.com',
      'pubuditha.desilva@gmail.com',
      'fazna9405@gmail.com',
      'chiranthakadilshan@gmail.com'
    ];
    
    onAuthStateChanged(auth, (user) => {
      this.zone.run(() => {
        this.user.set(user);
        this.isAdmin.set(user?.email ? adminEmails.includes(user.email) : false);
        this.isInitialized.set(true);
      });
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  async logout() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
}
