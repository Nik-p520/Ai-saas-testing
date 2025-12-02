import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  User,
  onAuthStateChanged,
  getIdToken,
  updateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private storage = getStorage(this.app);
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  // ✅ NEW: Shared Photo State (Ye photo ka URL hold karega)
  private photoUrlSubject = new BehaviorSubject<string>('');
  public photoUrl$ = this.photoUrlSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // ✅ NEW: Helper method to update photo across the app
  updatePhotoState(url: string) {
    this.photoUrlSubject.next(url);
  }
  // --- Auth Methods ---

  signup(email: string, password: string, name: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        return from(updateProfile(userCredential.user, { displayName: name }));
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  loginWithGoogle(): Observable<any> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  loginWithGithub(): Observable<any> {
    return from(signInWithPopup(this.auth, new GithubAuthProvider()));
  }

  logout() {
    return from(signOut(this.auth));
  }

  async getToken(): Promise<string | null> {
    await this.auth.authStateReady();
    if (this.auth.currentUser) {
      return await getIdToken(this.auth.currentUser);
    }
    return null;
  }

  // ✅ THIS IS THE MISSING METHOD
  async uploadProfileImage(file: File): Promise<string> {
    if (!this.auth.currentUser) throw new Error("User not logged in");
    
    // Create a unique path: users/{uid}/profile_timestamp.jpg
    const filePath = `users/${this.auth.currentUser.uid}/profile_${Date.now()}`;
    const storageRef = ref(this.storage, filePath);
    
    // 1. Upload the file
    await uploadBytes(storageRef, file);
    
    // 2. Get the public URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // 3. Update Firebase Profile so it updates immediately in the app
    await updateProfile(this.auth.currentUser, { photoURL: downloadURL });
    
    return downloadURL;
  }
}