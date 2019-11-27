export abstract class Socket {
  constructor(
    protected socketUrl: string,
    protected protocol: 'http' | 'https',
  ) {
  }
}
