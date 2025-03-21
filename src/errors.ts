export class KumohaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KumohaError";
  }
}
