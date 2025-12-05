import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject } from 'rxjs';
import { getAuth } from 'firebase/auth'; // Auth Import

@Injectable({
  providedIn: 'root',
})
export class DashboardWebSocketService {
  private stompClient: Client = new Client();

  stats$ = new BehaviorSubject<any>(null);
  trends$ = new BehaviorSubject<any>(null);
  distribution$ = new BehaviorSubject<any>(null);
  comparison$ = new BehaviorSubject<any>(null);

  constructor() {
    this.connect();
  }

  async connect() {
    const auth = getAuth();
    
    // 🛑 Wait for User to be Ready (Important!)
    let uid = auth.currentUser?.uid;
    
    if (!uid) {
        console.log("⚠️ No User Logged In, waiting...");
        // Agar user login nahi hai to connect mat karo, ya retry logic lagao
        return; 
    }

    console.log("🔗 Connecting WebSocket for User:", uid);

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      // Ab Headers ki zaroorat nahi hai (Kyunki URL unique hai)
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Connected! Subscribing to User Topics...');

      // 🔥 DYNAMIC SUBSCRIPTION: /topic/stats/{USER_ID}
      
      this.stompClient.subscribe(`/topic/stats/${uid}`, (msg: IMessage) => {
        this.stats$.next(JSON.parse(msg.body));
      });

      this.stompClient.subscribe(`/topic/trends/${uid}`, (msg: IMessage) => {
        console.log("📈 Trends Data Received");
        this.trends$.next(JSON.parse(msg.body));
      });

      this.stompClient.subscribe(`/topic/distribution/${uid}`, (msg: IMessage) => {
        this.distribution$.next(JSON.parse(msg.body));
      });
      
      this.stompClient.subscribe(`/topic/comparisons/${uid}`, (msg: IMessage) => {
        this.comparison$.next(JSON.parse(msg.body)); 
      });
    };

    this.stompClient.activate();
  }
}