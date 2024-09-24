import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { UserRequest } from './model/user.model';

@WebSocketGateway(81, { transports: ['websocket'] }) // Menggunakan konfigurasi default
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  countLike = 1;
  totalUser = 0;

  dataSawer = [];
  chat = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('message', `${client.id} connected`);
    this.totalUser++;
    this.server.emit('message', `Total user: ${this.totalUser}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.server.emit('message', `${client.id} disconnected`);
    this.totalUser--;
    this.server.emit('message', `Total user: ${this.totalUser}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { sender: string; message: string },
  ): void {
    console.log('Received message:', data);

    // Mengirimkan pesan ke semua client yang terhubung
    this.server.emit('message', {
      sender: data.sender,
      message: data.message,
    });
  }

  @SubscribeMessage('like')
  handleLike(): void {
    console.log(`like: ${this.countLike}`);

    this.server.emit('like', `like: ${this.countLike++}`);
  }

  @SubscribeMessage('sawer')
  handleUser(
    @MessageBody() data: { nama: string; nominal: number | string },
  ): void {
    const sawer = {
      nama: data.nama,
      nominal: data.nominal,
    };

    this.dataSawer.push(sawer);

    this.server.emit('sawer', this.dataSawer);
  }

  @SubscribeMessage('chat')
  handleUserList(@MessageBody() data: { name: string; message: string }): void {
    const chatUser = {
      name: data.name,
      message: data.message,
    };

    this.chat.push(chatUser);

    this.server.emit('chat', this.chat);
  }
}
