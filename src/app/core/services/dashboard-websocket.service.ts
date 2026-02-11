import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject } from 'rxjs';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardWebSocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private isConnecting = false; // ✅ Connection Lock

  stats$ = new BehaviorSubject<any>(null);
  trends$ = new BehaviorSubject<any>(null);
  distribution$ = new BehaviorSubject<any>(null);
  comparison$ = new BehaviorSubject<any>(null);

  constructor() {
    // Turant connect karne ki jagah Auth state ka wait karein
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.connect(user.uid);
      } else {
        this.disconnect();
      }
    });
  }

  async connect(uid: string) {
    // 🛑 Agar pehle se connect ho raha hai ya connected hai, toh return
    if (this.isConnecting || (this.stompClient && this.stompClient.active)) {
      return;
    }

    this.isConnecting = true;
    console.log("🔗 Attempting WebSocket Connection for User:", uid);

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.springApi}/ws`),
      reconnectDelay: 5000, // ✅ 5 second ka gap (429 error se bachne ke liye)
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.isConnecting = false;
      console.log('✅ Connected to WebSocket!');

      this.stompClient?.subscribe(`/topic/stats/${uid}`, (msg: IMessage) => {
        this.stats$.next(JSON.parse(msg.body));
      });

      this.stompClient?.subscribe(`/topic/trends/${uid}`, (msg: IMessage) => {
        console.log("📈 Trends Data Received");
        this.trends$.next(JSON.parse(msg.body));
      });

      this.stompClient?.subscribe(`/topic/distribution/${uid}`, (msg: IMessage) => {
        this.distribution$.next(JSON.parse(msg.body));
      });
      
      this.stompClient?.subscribe(`/topic/comparisons/${uid}`, (msg: IMessage) => {
        this.comparison$.next(JSON.parse(msg.body)); 
      });
    };

    this.stompClient.onStompError = (frame) => {
      this.isConnecting = false;
      console.error('❌ STOMP Error:', frame);
    };

    this.stompClient.onWebSocketClose = () => {
      this.isConnecting = false;
      console.log('🔌 WebSocket Closed');
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnecting = false;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}