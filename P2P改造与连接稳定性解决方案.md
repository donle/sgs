# 三国杀P2P改造与连接稳定性解决方案

## 一、项目架构分析总结

### 1.1 当前架构
- **技术栈**: TypeScript + Socket.IO + React/Electron
- **架构模式**: 严格的C/S架构，服务端是唯一的权威状态持有者
- **核心组件**:
  - `ServerRoom` (~2000行): 包含所有游戏逻辑
  - `ClientRoom`: 只读的展示壳，大量方法抛异常
  - `ServerSocket`/`ClientSocket`: 网络通信层
  - `GameProcessor`: 游戏流程管理

### 1.2 关键问题
1. **P2P改造挑战**: 需要将`ServerRoom`的复杂逻辑迁移到客户端
2. **连接不稳定**: Socket.IO配置和重连机制存在优化空间

---

## 二、P2P改造方案

### 2.1 架构设计策略

#### 方案A: 房主权威模式 (推荐)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   客户端A   │    │   客户端B   │    │   客户端C   │
│  (房主)     │◄──►│  (玩家)     │◄──►│  (玩家)     │
│  ServerRoom │    │  ClientRoom │    │  ClientRoom │
└─────────────┘    └─────────────┘    └─────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                ┌─────────────────┐
                │   中央服务器    │
                │  (房间列表/中继) │
                └─────────────────┘
```

**优点**:
- 改动最小，复用现有`ServerRoom`逻辑
- 房主断线可转移权威
- 防作弊：房主本地运行，但状态同步给其他玩家验证

**实现步骤**:
1. 创建`HostRoom`类，继承`ServerRoom`但运行在客户端
2. 创建`PeerSocket`类，实现P2P通信
3. 修改`ClientRoom`，增加验证逻辑
4. 中央服务器只负责房间列表和NAT穿透

#### 方案B: 状态同步模式
所有客户端都运行完整游戏逻辑，通过状态哈希验证一致性。

**优点**: 更去中心化，抗作弊更强
**缺点**: 改动巨大，需要重写整个状态同步机制

### 2.2 具体实现方案

#### 2.2.1 创建P2P房间管理器

```typescript
// src/core/room/room.host.ts
export class HostRoom extends ServerRoom {
  private peerConnections: Map<PlayerId, PeerConnection> = new Map();
  
  constructor(
    roomId: RoomId,
    gameInfo: GameInfo,
    socket: PeerSocket, // 替换ServerSocket
    // ... 其他参数
  ) {
    super(roomId, gameInfo, socket, /* ... */);
  }
  
  // 重写广播方法，使用P2P连接
  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    this.peerConnections.forEach((peer, playerId) => {
      peer.send(type.toString(), content);
    });
  }
  
  // 处理房主断线转移
  transferHost(newHostId: PlayerId) {
    // 将ServerRoom状态序列化并发送给新房主
    const state = this.serialize();
    this.peerConnections.get(newHostId)?.send('host-transfer', state);
  }
}
```

#### 2.2.2 创建P2P Socket实现

```typescript
// src/core/network/socket.peer.ts
export class PeerSocket extends Socket<WorkPlace.Server> {
  private peerConnections: Map<PlayerId, RTCPeerConnection> = new Map();
  private dataChannels: Map<PlayerId, RTCDataChannel> = new Map();
  
  constructor(private roomId: string, private signalingServer: Socket) {
    super();
  }
  
  // WebRTC数据通道通信
  async connectToPeer(playerId: PlayerId, offer?: RTCSessionDescriptionInit) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    const dataChannel = peerConnection.createDataChannel('game-data');
    dataChannel.onmessage = (event) => {
      this.handlePeerMessage(playerId, JSON.parse(event.data));
    };
    
    this.peerConnections.set(playerId, peerConnection);
    this.dataChannels.set(playerId, dataChannel);
    
    // ICE候选和信令处理...
  }
  
  // 实现Socket抽象方法
  notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>, to?: PlayerId) {
    if (to) {
      this.dataChannels.get(to)?.send(JSON.stringify({ type, content }));
    } else {
      this.broadcast(type, content);
    }
  }
  
  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    const message = JSON.stringify({ type, content });
    this.dataChannels.forEach(channel => channel.send(message));
  }
}
```

#### 2.2.3 修改中央服务器

```typescript
// src/server/services/room_service.ts 修改
export class RoomService {
  // 保留房间列表管理
  private waitingRooms: WaitingRoomInfo[] = [];
  
  // 新增：P2P信令服务
  private signalingService: SignalingService;
  
  // 修改：房间创建逻辑
  createWaitingRoom(roomInfo: TemporaryRoomCreationInfo) {
    // 不再创建ServerRoom，只记录房间信息
    const roomId = Date.now();
    this.waitingRooms.push({
      roomId,
      roomInfo,
      hostPlayerId: roomInfo.hostPlayerId,
      isP2P: true, // 标记为P2P房间
    });
    
    return roomId;
  }
  
  // 新增：处理P2P信令
  handleSignaling(hostPlayerId: PlayerId, guestPlayerId: PlayerId, signal: any) {
    this.signalingService.relaySignal(hostPlayerId, guestPlayerId, signal);
  }
}
```

#### 2.2.4 客户端连接流程改造

```typescript
// src/ui/platforms/desktop/src/pages/room/room.tsx 修改
export class RoomPage extends React.Component {
  async joinRoom(roomId: string, asHost: boolean) {
    if (asHost) {
      // 房主模式：创建HostRoom
      this.room = new HostRoom(roomId, gameInfo, new PeerSocket(roomId, this.signalingSocket));
      await this.room.initialize();
    } else {
      // 加入模式：通过信令连接房主
      const hostPeerConnection = await this.connectToHost(roomId);
      this.socket = new ClientPeerSocket(hostPeerConnection);
      this.room = new ClientRoom(roomId, this.socket, gameInfo, players);
    }
  }
  
  private async connectToHost(roomId: string): Promise<RTCPeerConnection> {
    // 通过中央服务器获取房主信息
    const hostInfo = await this.signalingSocket.emit('get-host-info', roomId);
    
    // WebRTC连接流程
    const peerConnection = new RTCPeerConnection({ iceServers: [...] });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // 通过信令服务器交换offer/answer
    this.signalingSocket.emit('relay-signal', {
      to: hostInfo.playerId,
      signal: offer
    });
    
    return peerConnection;
  }
}
```

### 2.3 牌堆随机性保障

#### 方案1: 房主本地随机 (简单)
房主本地管理牌堆，其他玩家通过事件同步验证。

#### 方案2: 可验证随机函数 (推荐)
```typescript
// 使用承诺方案(commitment scheme)
class VerifiableRandomStack {
  private seed: string;
  private commitment: string;
  
  constructor() {
    this.seed = generateRandomSeed();
    this.commitment = hash(this.seed); // 公开承诺
  }
  
  // 游戏结束后揭示种子，所有人可验证
  revealSeed() {
    return this.seed;
  }
  
  // 抽牌时使用种子生成确定性随机
  drawCard(index: number): CardId {
    const random = deterministicRandom(this.seed, index);
    return this.cards[Math.floor(random * this.cards.length)];
  }
}
```

### 2.4 事件同步机制

```typescript
// 事件验证和冲突解决
class EventSynchronizer {
  private eventLog: GameEvent[] = [];
  private stateHashes: Map<PlayerId, string> = new Map();
  
  // 每个关键事件后验证状态一致性
  async validateStateConsistency() {
    const localHash = this.calculateStateHash();
    
    // 请求其他玩家的状态哈希
    const peerHashes = await this.requestPeerHashes();
    
    // 检查一致性
    for (const [peerId, peerHash] of peerHashes) {
      if (peerHash !== localHash) {
        console.error(`State mismatch with peer ${peerId}`);
        await this.resolveConflict(peerId);
      }
    }
  }
  
  // 冲突解决：回滚到最近一致状态
  async resolveConflict(peerId: PlayerId) {
    const lastConsistentEvent = this.findLastConsistentEvent();
    await this.rollbackTo(lastConsistentEvent);
  }
}
```

---

## 三、连接稳定性解决方案

### 3.1 Socket.IO配置优化

#### 3.1.1 服务端配置优化
```typescript
// src/server/main.ts 修改
const lobbySocket = SocketIO.listen(server, {
  origins: '*:*',
  transports: ['websocket', 'polling'], // 允许降级到polling
  allowUpgrades: true, // 允许传输升级
  pingTimeout: 60000, // 增加到60秒
  pingInterval: 25000, // 减少到25秒
  upgradeTimeout: 30000, // 升级超时30秒
  maxHttpBufferSize: 1e8, // 100MB，支持大消息
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
```

#### 3.1.2 客户端配置优化
```typescript
// src/core/network/socket.client.ts 修改
protected init(endpoint: string) {
  this.socketIO = IOSocketClient(endpoint, {
    transports: ['websocket', 'polling'], // 允许降级
    upgrade: true,
    rememberUpgrade: true, // 记住上次成功的传输方式
    reconnection: true,
    reconnectionAttempts: Infinity, // 无限重试
    reconnectionDelay: 1000, // 初始重连延迟1秒
    reconnectionDelayMax: 30000, // 最大重连延迟30秒
    randomizationFactor: 0.5, // 随机化因子，避免重连风暴
    timeout: 20000, // 连接超时20秒
    autoConnect: true,
    forceNew: false,
  });
  
  // 添加连接状态监听
  this.socketIO.on('connect', () => {
    console.log('Connected to server');
    this.reconnecting = false;
    this.emit('connection-status', 'connected');
  });
  
  this.socketIO.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    this.emit('connection-status', 'disconnected');
    
    // 如果是服务器主动断开，尝试重连
    if (reason === 'io server disconnect') {
      this.socketIO.connect();
    }
  });
  
  this.socketIO.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt ${attempt}`);
    this.emit('connection-status', 'reconnecting');
  });
  
  this.socketIO.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });
  
  this.socketIO.on('reconnect_failed', () => {
    console.error('Reconnection failed');
    this.emit('connection-status', 'failed');
  });
}
```

### 3.2 心跳机制增强

#### 3.2.1 自定义心跳实现
```typescript
// src/core/network/socket.client.ts 添加
private heartbeatInterval: NodeJS.Timer | null = null;
private lastPongTime: number = 0;
private heartbeatTimeout: number = 30000; // 30秒无响应认为断线

startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    if (this.socketIO.connected) {
      const now = Date.now();
      
      // 检查上次pong时间
      if (now - this.lastPongTime > this.heartbeatTimeout) {
        console.warn('Heartbeat timeout, forcing reconnect');
        this.socketIO.disconnect();
        this.socketIO.connect();
        return;
      }
      
      // 发送心跳
      this.socketIO.emit('heartbeat', { timestamp: now });
    }
  }, 10000); // 每10秒发送一次
}

// 监听pong
this.socketIO.on('heartbeat-pong', (data) => {
  this.lastPongTime = Date.now();
  const latency = Date.now() - data.timestamp;
  this.emit('latency', latency);
});
```

#### 3.2.2 服务端心跳处理
```typescript
// src/core/network/socket.server.ts 添加
socket.on('heartbeat', (data) => {
  socket.emit('heartbeat-pong', { timestamp: data.timestamp });
  
  // 更新玩家最后活跃时间
  const playerId = this.mapSocketIdToPlayerId[socket.id];
  if (playerId && this.room) {
    const player = this.room.getPlayerById(playerId);
    if (player) {
      player.lastActiveTime = Date.now();
    }
  }
});
```

### 3.3 重连策略优化

#### 3.3.1 指数退避重连
```typescript
// src/core/network/socket.client.ts 修改
private reconnectAttempts: number = 0;
private maxReconnectAttempts: number = 10;
private baseReconnectDelay: number = 1000;

private calculateReconnectDelay(): number {
  // 指数退避 + 随机抖动
  const delay = Math.min(
    this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
    30000 // 最大30秒
  );
  const jitter = delay * 0.5 * Math.random();
  return delay + jitter;
}

// Socket.IO重连配置
this.socketIO = IOSocketClient(endpoint, {
  // ... 其他配置
  reconnectionDelay: (attempt) => {
    this.reconnectAttempts = attempt;
    return this.calculateReconnectDelay();
  },
  reconnectionDelayMax: 30000,
});
```

#### 3.3.2 连接状态恢复
```typescript
// src/core/network/socket.client.ts 添加
private connectionState: {
  lastEventTimestamp: number;
  pendingEvents: any[];
  sessionId: string;
} = {
  lastEventTimestamp: 0,
  pendingEvents: [],
  sessionId: generateSessionId(),
};

// 重连后恢复状态
public onReconnected(callback: () => void) {
  this.socketIO.on('connect', () => {
    if (this.reconnecting) {
      this.reconnecting = false;
      
      // 发送恢复请求
      this.socketIO.emit('restore-session', {
        sessionId: this.connectionState.sessionId,
        lastEventTimestamp: this.connectionState.lastEventTimestamp,
      });
      
      callback();
    }
  });
}

// 处理批量事件补发
this.socketIO.on('bulk-events', (data) => {
  console.log(`Received ${data.events.length} missed events`);
  data.events.forEach(event => {
    this.emit(event.type, event.content);
  });
});
```

### 3.4 网络容错处理

#### 3.4.1 断线期间事件缓存
```typescript
// src/core/network/socket.client.ts 添加
private eventQueue: Array<{
  type: string;
  content: any;
  timestamp: number;
  retries: number;
}> = [];

// 重写notify方法，支持离线缓存
public notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>) {
  if (this.socketIO.connected) {
    this.socketIO.emit(type.toString(), content);
  } else {
    // 缓存事件，等待重连后发送
    this.eventQueue.push({
      type: type.toString(),
      content,
      timestamp: Date.now(),
      retries: 0,
    });
    
    console.warn(`Offline: queued event ${type.toString()}`);
  }
}

// 重连后发送缓存事件
private async flushEventQueue() {
  while (this.eventQueue.length > 0) {
    const event = this.eventQueue.shift();
    if (event && event.retries < 3) {
      try {
        this.socketIO.emit(event.type, event.content);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms间隔
      } catch (error) {
        event.retries++;
        this.eventQueue.unshift(event); // 重新入队
        break;
      }
    }
  }
}
```

#### 3.4.2 服务端断线恢复增强
```typescript
// src/core/network/socket.server.ts 修改
private async onPlayerReenter(socket, identifier, event) {
  const { playerId, timestamp, sessionId } = event;
  
  // 验证会话
  if (!this.validateSession(playerId, sessionId)) {
    socket.emit('session-invalid', { playerId });
    return;
  }
  
  // 更新socket映射
  this.mapSocketIdToPlayerId[playerId] = socket.id;
  
  // 清除断线计时器
  if (this.playerReconnectTimer[playerId]) {
    clearTimeout(this.playerReconnectTimer[playerId]);
    delete this.playerReconnectTimer[playerId];
  }
  
  // 设置玩家上线
  const room = this.room as ServerRoom;
  const player = room.getPlayerById(playerId);
  player.setOnline();
  
  // 获取丢失的事件
  const missingEvents = room.Analytics.getRecordEvents(e => {
    return EventPacker.getTimestamp(e) > timestamp;
  });
  
  // 分批发送，避免消息过大
  const batchSize = 50;
  for (let i = 0; i < missingEvents.length; i += batchSize) {
    const batch = missingEvents.slice(i, i + batchSize);
    socket.emit(GameEventIdentifiers.PlayerBulkPacketEvent, {
      stackedLostMessages: batch,
      isLastBatch: i + batchSize >= missingEvents.length,
    });
    
    // 等待客户端确认
    await new Promise(resolve => {
      socket.once('batch-ack', resolve);
      setTimeout(resolve, 1000); // 1秒超时
    });
  }
  
  // 发送当前房间状态快照
  socket.emit('room-state-snapshot', {
    roomId: room.Id,
    gameState: room.serializeState(),
    players: room.Players.map(p => ({
      id: p.Id,
      name: p.Name,
      isOnline: p.isOnline(),
    })),
  });
}
```

### 3.5 连接质量监控

```typescript
// src/core/network/connection_monitor.ts
export class ConnectionMonitor {
  private latencyHistory: number[] = [];
  private packetLossHistory: number[] = [];
  private connectionQuality: 'good' | 'fair' | 'poor' = 'good';
  
  constructor(private socket: ClientSocket) {
    this.setupMonitoring();
  }
  
  private setupMonitoring() {
    // 延迟监控
    this.socket.on('latency', (latency: number) => {
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 10) {
        this.latencyHistory.shift();
      }
      this.updateQuality();
    });
    
    // 丢包监控
    let sentPackets = 0;
    let receivedPackets = 0;
    
    setInterval(() => {
      const lossRate = sentPackets > 0 ? 
        (sentPackets - receivedPackets) / sentPackets : 0;
      this.packetLossHistory.push(lossRate);
      if (this.packetLossHistory.length > 10) {
        this.packetLossHistory.shift();
      }
      
      sentPackets = 0;
      receivedPackets = 0;
      this.updateQuality();
    }, 5000);
  }
  
  private updateQuality() {
    const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / 
      this.latencyHistory.length;
    const avgLoss = this.packetLossHistory.reduce((a, b) => a + b, 0) / 
      this.packetLossHistory.length;
    
    if (avgLatency < 100 && avgLoss < 0.01) {
      this.connectionQuality = 'good';
    } else if (avgLatency < 300 && avgLoss < 0.05) {
      this.connectionQuality = 'fair';
    } else {
      this.connectionQuality = 'poor';
    }
    
    this.socket.emit('quality-change', this.connectionQuality);
  }
  
  getQuality() {
    return this.connectionQuality;
  }
  
  getStats() {
    return {
      avgLatency: this.latencyHistory.reduce((a, b) => a + b, 0) / 
        this.latencyHistory.length,
      avgPacketLoss: this.packetLossHistory.reduce((a, b) => a + b, 0) / 
        this.packetLossHistory.length,
      quality: this.connectionQuality,
    };
  }
}
```

---

## 四、实施建议

### 4.1 分阶段实施计划

#### 第一阶段：连接稳定性优化 (1-2周)
1. 修改Socket.IO配置
2. 增强心跳机制
3. 优化重连策略
4. 添加事件缓存
5. 实现连接监控

#### 第二阶段：P2P基础架构 (2-3周)
1. 创建PeerSocket和HostRoom
2. 实现WebRTC信令
3. 修改中央服务器为信令服务器
4. 实现房主转移机制

#### 第三阶段：P2P游戏逻辑 (3-4周)
1. 迁移ServerRoom核心逻辑到HostRoom
2. 实现牌堆随机性验证
3. 添加状态同步和冲突解决
4. 测试和优化

### 4.2 风险评估

#### 技术风险
1. **WebRTC兼容性**: 部分浏览器/网络环境可能不支持
   - 解决方案: 降级到WebSocket中继
   
2. **NAT穿透失败**: 对称NAT可能无法直接连接
   - 解决方案: 使用TURN服务器中继

3. **状态同步复杂性**: P2P模式下状态一致性更难保证
   - 解决方案: 房主权威模式 + 状态哈希验证

#### 用户体验风险
1. **房主断线**: 游戏可能中断
   - 解决方案: 自动房主转移 + 状态恢复

2. **连接质量差异**: P2P连接质量可能不如C/S稳定
   - 解决方案: 连接质量监控 + 自动降级

### 4.3 测试策略

1. **单元测试**: 核心游戏逻辑不变，保持现有测试
2. **集成测试**: P2P连接、状态同步、房主转移
3. **网络测试**: 不同网络环境、NAT类型、丢包率
4. **压力测试**: 多房间、高并发、长时间运行

---

## 五、总结

### 5.1 P2P改造优势
1. **降低服务器成本**: 中央服务器只做信令和房间列表
2. **提高可扩展性**: 玩家自建房间，服务器压力小
3. **减少延迟**: 玩家直连，延迟更低
4. **增强隐私**: 游戏数据不经过中央服务器

### 5.2 连接稳定性改进
1. **配置优化**: 更合理的超时和重连参数
2. **心跳增强**: 自定义心跳 + 延迟监控
3. **重连优化**: 指数退避 + 状态恢复
4. **容错处理**: 事件缓存 + 批量补发
5. **质量监控**: 实时连接质量评估

### 5.3 建议实施顺序
1. **优先级1**: 连接稳定性优化 (立即实施)
2. **优先级2**: P2P基础架构 (1个月后)
3. **优先级3**: 完整P2P游戏逻辑 (2-3个月后)

---

## 六、附录

### 6.1 关键文件路径
- 服务端入口: `src/server/main.ts`
- 服务端Socket: `src/core/network/socket.server.ts`
- 客户端Socket: `src/core/network/socket.client.ts`
- 服务端房间: `src/core/room/room.server.ts`
- 客户端房间: `src/core/room/room.client.ts`
- 房间服务: `src/server/services/room_service.ts`

### 6.2 相关技术文档
- Socket.IO文档: https://socket.io/docs/v4/
- WebRTC文档: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- NAT穿透: https://webrtc.org/getting-started/turn-server

### 6.3 工具和库推荐
- **WebRTC**: simple-peer, peerjs
- **信令服务器**: socket.io, ws
- **NAT穿透**: coturn (TURN服务器)
- **状态管理**: immer (不可变状态)
- **测试**: jest, puppeteer

---

*文档生成时间: 2026年6月7日*
*版本: 1.0*