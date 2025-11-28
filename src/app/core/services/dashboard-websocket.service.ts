import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardWebSocketService {
  private stompClient: Client = new Client();

  // Observables for auto-update
  stats$ = new BehaviorSubject<any>(null);
  trends$ = new BehaviorSubject<any>(null);
  distribution$ = new BehaviorSubject<any>(null);
  
  // 🔥 FIX 1: New Observable for Comparison Data
  comparison$ = new BehaviorSubject<any>(null); 

  constructor() {
    this.connect();
  }

  connect() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');

      // Subscribe to existing WebSocket topics
      this.stompClient.subscribe('/topic/stats', (msg: IMessage) => {
        this.stats$.next(JSON.parse(msg.body));
      });

      this.stompClient.subscribe('/topic/trends', (msg: IMessage) => {
        this.trends$.next(JSON.parse(msg.body));
      });

      this.stompClient.subscribe('/topic/distribution', (msg: IMessage) => {
        this.distribution$.next(JSON.parse(msg.body));
      });
      
      // 🔥 FIX 2: New Subscription to the comparison topic
      this.stompClient.subscribe('/topic/comparisons', (msg: IMessage) => {
        // The comparison data is a Map<string, string>
        this.comparison$.next(JSON.parse(msg.body)); 
      });
    };

    this.stompClient.activate();
  }
}