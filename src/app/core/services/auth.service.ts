import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment.prod';
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
  updateProfile,
  sendEmailVerification // ✅ Added this import
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environments } from '../../../environments/environment';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app = initializeApp(environments.firebase);
  private auth = getAuth(this.app);
  private storage = getStorage(this.app);
  
  // Initial state null rakho
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  // Photo URL state
  private photoUrlSubject = new BehaviorSubject<string | null>(null);
  public photoUrl$ = this.photoUrlSubject.asObservable();

  constructor(private http: HttpClient) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User mil gaya, par abhi emit mat karo. Pehle photo check karo.
        this.initializeUserPhoto(user);
      } else {
        // User nahi hai, turant null emit karo
        this.userSubject.next(null);
        this.photoUrlSubject.next(null);
      }
    });
  }

  // ✅ SMART PHOTO LOADER
  initializeUserPhoto(user: User) {
    // 1. Agar Firebase mein photo hai, to usse temporary set kar do (Flicker kam hoga)
    if (user.photoURL) {
        this.photoUrlSubject.next(user.photoURL);
    }

    // 2. Backend check karo
    const url = `${environment.springApi}/api/user/photo?t=${new Date().getTime()}`;

    
    this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
            const objectURL = URL.createObjectURL(blob);
            this.photoUrlSubject.next(objectURL); // Backend photo prefer karo
            
            // Ab user data emit karo (Photo ke baad)
            this.userSubject.next(user);
        },
        error: () => {
            // Backend fail hua? Koi baat nahi, Firebase wali photo hi sahi
            if (!this.photoUrlSubject.value && user.photoURL) {
                this.photoUrlSubject.next(user.photoURL);
            }
            // Ab user data emit karo
            this.userSubject.next(user);
        }
    });
  }

  updatePhotoState(url: string) {
    this.photoUrlSubject.next(url);
  }

  // --- Auth Methods ---

  // ✅ UPDATED SIGNUP WITH EMAIL VERIFICATION
  signup(email: string, password: string, name: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (userCredential) => {
        const user = userCredential.user;

        // 1. Update Name
        await updateProfile(user, { displayName: name });
        
        // 2. Send Verification Email
        console.log("Step 1: Account Created. Sending verification email...");
        try {
            await sendEmailVerification(user);
            console.log("Step 2: Verification Email Sent!");
        } catch (e) {
            console.error("Step 2 Failed: Verification email error", e);
        }

        return userCredential;
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