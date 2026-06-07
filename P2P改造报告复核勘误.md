# P2P改造报告复核勘误

> 结论：上一版报告作为方向性调研可以保留，但不能直接作为实施规格。里面有若干版本兼容、实现边界和风险评估不准确的地方，尤其是 Socket.IO v2 配置、WebRTC/P2P可行性、房主权威模式的防作弊表述，以及客户端离线事件缓存策略。

## 1. Socket.IO 版本兼容问题

### 1.1 上一版报告的问题
报告中的服务端配置示例使用了 Socket.IO v3/v4 风格：

```ts
cors: {
  origin: '*',
  methods: ['GET', 'POST']
}
```

但本项目实际依赖是：

- 服务端：`src/server/package.json` 中 `socket.io: 2.4.1`
- 客户端：`src/ui/platforms/desktop/package.json` 中 `socket.io-client: ^2.3.0`

Socket.IO v2 不支持 v3/v4 的 `cors` 配置方式。继续照搬会导致类型错误或运行配置无效。

### 1.2 修正建议
对当前 v2 代码，服务端优先做小改：

```ts
const lobbySocket = SocketIO.listen(server, {
  origins: '*:*',
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

客户端：

```ts
this.socketIO = IOSocketClient(endpoint, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
  timeout: 20000,
});
```

注意：`reconnectionDelay` 在 socket.io-client v2 里应按数值配置，不应写成上一版报告中的函数式配置。

## 2. 当前重连回调判断不可靠

### 2.1 现状
`src/core/network/socket.client.ts` 当前逻辑是：

```ts
this.socketIO.on('reconnect', () => {
  this.reconnecting = true;
});

public onReconnected(callback: () => void) {
  this.socketIO.on('connect', () => {
    if (this.reconnecting) {
      this.reconnecting = false;
      callback();
    }
  });
}
```

这段逻辑存在事件顺序风险：Socket.IO v2 的 `reconnect` 是“重连成功”事件，`connect` 与 `reconnect` 的触发顺序不应依赖。结果可能是 `connect` 触发时 `reconnecting` 还是 `false`，导致 `PlayerReenterEvent` 没有发送。

### 2.2 修正建议
更稳妥地直接在 `reconnect` 里调用业务回调，或在 `disconnect/reconnect_attempt` 阶段设置 `reconnecting = true`。

建议最小改法：

```ts
protected init(endpoint: string) {
  this.socketIO = IOSocketClient(endpoint, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 20000,
  });

  this.socketIO.on('disconnect', () => {
    this.reconnecting = true;
  });
}

public onReconnected(callback: () => void) {
  this.socketIO.on('reconnect', () => {
    this.reconnecting = false;
    callback();
  });

  this.socketIO.on('connect', () => {
    if (this.reconnecting) {
      this.reconnecting = false;
      callback();
    }
  });
}
```

后续可以再去重，避免极端情况下重复回调。

## 3. `this.emit(...)` 示例不符合现有 `ClientSocket`

上一版报告在 `ClientSocket` 中写了：

```ts
this.emit('connection-status', 'connected');
```

但当前 `ClientSocket` 并没有继承 `EventEmitter`，也没有 `emit` 方法。这个示例不能直接使用。

修正方向：

1. 要么引入轻量状态回调：`onConnectionStatusChanged(callback)`；
2. 要么让 `ClientSocket` 显式继承/组合一个事件发射器；
3. 要么由 `room.tsx` 直接监听 socket.io 的状态事件，但这要求暴露底层 socket 或增加 wrapper 方法。

## 4. 自定义心跳方案需要降级为“监控”，不要强行替代 Socket.IO 心跳

### 4.1 上一版报告的问题
上一版心跳代码存在几个问题：

- `lastPongTime` 初始为 `0`，首次定时器执行可能直接判定超时。
- 服务端示例写了 `player.lastActiveTime = Date.now()`，当前 `Player/ServerPlayer` 结构里未确认存在该字段。
- Socket.IO 已有 ping/pong 机制，额外心跳不应频繁 `disconnect/connect`，否则可能制造更多抖动。

### 4.2 修正建议
短期只把自定义心跳用于延迟测量和 UI 提示，不用于强制断线；真正断线交给 Socket.IO 内置机制。

如需主动重连，应满足多个连续失败窗口，例如连续 3 次 heartbeat 无响应才重连。

## 5. 客户端离线事件缓存不能“无脑重放”

### 5.1 上一版报告的问题
上一版建议在 `notify` 里离线缓存所有事件，重连后重放。这对这个项目的游戏协议是危险的。

原因：

- 游戏内响应事件有严格时序，比如 `AskForCardUseEvent`、`AskForCardResponseEvent`。
- 玩家断线时，服务端可能已经让 AI 代替响应：见 `socket.server.ts` 的断线处理。
- 重连后再发送旧响应，可能导致过期操作、重复操作或状态错乱。

### 5.2 修正建议
事件缓存只能用于幂等或低风险事件，例如：

- ping/heartbeat
- 部分大厅查询
- 聊天草稿可以本地保存，但不应自动重放成服务端事实

游戏操作类事件必须使用：

- `requestId/correlationId`
- 服务端校验当前 `AwaitingResponseEvent`
- 过期响应直接拒绝
- 客户端重连后以服务端补发事件和当前等待状态为准

## 6. `HostRoom extends ServerRoom` 被低估了实现难度

### 6.1 上一版报告的问题
报告里说“创建 `HostRoom` 继承 `ServerRoom`，改动最小”。这个说法偏乐观。

实际代码里：

- `ServerRoom` 构造函数明确依赖 `ServerSocket` 类型。
- `ServerRoom` 文件导入了 `core/network/socket.server`，而 `socket.server.ts` 又依赖 `socket.io` 服务端包。
- 客户端构建会把 `src/core` 同步到 `src/ui/platforms/desktop/src/core`，如果直接把服务端依赖带入浏览器/renderer bundle，可能破坏前端构建。

### 6.2 修正建议
P2P/房主模式第一步不是写 `HostRoom`，而是先做依赖倒置：

```ts
// 将 ServerRoom 构造参数从具体 ServerSocket 改为抽象 Socket<WorkPlace.Server>
protected socket: Socket<WorkPlace.Server>
```

同时把 `ServerRoom` 中不必要的服务端具体依赖移除，确保它只依赖：

- `Socket<WorkPlace.Server>` 抽象接口
- 纯游戏逻辑
- 纯 TS 工具类

然后再实现两个适配器：

- `ServerSocketAdapter`：现有 C/S 服务端使用
- `HostPeerSocketAdapter`：客户端房主模式使用

## 7. WebRTC 方案漏掉了运行环境限制

### 7.1 上一版报告的问题
报告默认 WebRTC DataChannel 可直接用，但项目同时有 Web/Electron 桌面形态，需要区分：

- Electron 13 renderer 中通常可用 WebRTC。
- Web 页面如果跑在非 HTTPS 的远程地址，现代浏览器 WebRTC 能力可能受限。
- STUN 只帮助发现候选地址，不保证穿透成功。
- 对称 NAT、公司网络、校园网下常需要 TURN 中继。

### 7.2 修正建议
P2P不是“后端只显示房间数”这么简单。最低限度后端仍要承担：

1. 房间列表/房间元数据；
2. waiting-room 协调；
3. WebRTC signaling；
4. 可选但强烈建议的 TURN 中继；
5. 房主掉线时的迁移协调。

如果没有 TURN，P2P成功率不可控。

## 8. 房主权威模式不能称为“防作弊”

### 8.1 上一版报告的问题
报告中写“房主本地运行，但状态同步给其他玩家验证”能防作弊，这个表述不准确。

房主权威模式只能让其他玩家发现部分不一致，不能阻止房主作弊，因为：

- 房主控制牌堆、随机数、事件顺序；
- 其他玩家不知道隐藏信息，无法验证所有操作；
- 状态哈希只证明“大家看到的公开状态一致”，不证明隐藏状态公平。

### 8.2 修正建议
如果要提升公平性，应使用多方 commit-reveal：

1. 每个玩家生成随机种子 `seed_i`；
2. 先广播 `hash(seed_i)`；
3. 所有人提交后再公开 `seed_i`；
4. 组合所有种子生成牌堆洗牌种子；
5. 用确定性 shuffle 得到牌堆。

房主仍然负责执行游戏逻辑，但不能单独决定随机结果。

## 9. 拓扑图应改成星型，不是玩家互联全网状

上一版图里画了 A-B-C 互联。若采用房主权威模式，应以房主为中心：

```text
        客户端B
           │
           ▼
客户端C -> 房主A -> 客户端D
           ▲
           │
        客户端E
```

玩家之间不必互连。全网状连接会增加复杂度，且对当前服务端权威逻辑没有必要。

## 10. 时间评估和效果数字过于乐观

上一版报告提到“断线率降低80%+”“重连成功率95%+”，这些没有压测数据支撑，应删除。

更合理的表述：

- Socket.IO 配置和重连修复可以明显改善弱网体验，但需要线上监控验证。
- P2P 完整改造至少应按“原型、灰度、兼容C/S回退”三阶段推进。
- 对当前代码量和架构耦合度，完整P2P不是2-3周级别，更像是数周到数月的重构项目。

## 11. 更合理的实施路线

### 阶段一：先修当前 C/S 断线问题

优先级最高，风险最低：

1. 修正 Socket.IO v2 配置，允许 polling fallback。
2. 修复 `onReconnected` 事件顺序问题。
3. 增加连接状态日志与断线原因采集。
4. 优化 `PlayerBulkPacketEvent` 补发：必要时分批，但需要客户端确认机制配套。
5. 不做游戏操作离线重放。

### 阶段二：抽象游戏宿主层

目标不是马上 WebRTC，而是先让 `ServerRoom` 不依赖具体 `ServerSocket`：

1. 把 `ServerRoom` 的 socket 依赖改为 `Socket<WorkPlace.Server>`。
2. 清理 core 中对 Node/socket.io 服务端包的硬依赖。
3. 让本地 Campaign 模式成为“客户端内运行服务端逻辑”的样板。
4. 建立 host-engine 的最小测试。

### 阶段三：做房主权威 P2P 原型

1. signaling 仍用中央服务器。
2. WebRTC DataChannel 首先只承载房主与玩家之间的 game events。
3. 必须保留 C/S fallback 或 relay fallback。
4. 增加房主掉线迁移，但第一版可以只支持回到等待房间重新开局。

## 12. 最终修正结论

上一版报告的方向没有完全错：

- 当前连接配置确实是断线风险点。
- P2P应优先考虑房主权威，而不是完全分布式一致性。
- 中央服务器可以从“游戏逻辑服务器”降级为“大厅/信令/中继协调服务器”。

但上一版报告低估了：

- Socket.IO v2/v4 配置差异；
- `ServerRoom` 对服务端网络实现的耦合；
- WebRTC NAT/TURN与HTTPS限制；
- 房主权威模式下的作弊风险；
- 离线事件重放对游戏时序的破坏。

建议把上一版文档视为“方向草案”，本勘误作为下一步实施的约束条件。真正落地应先从 C/S 稳定性修复开始，而不是直接大规模P2P重构。
