export type KnownKumohaErrorReason =
  | 'AUTHENTICATION_ERROR'
  | 'SESSION_UNINITIALISED'
  | 'THEME_NOT_FOUND'
  | 'MIKASAGAWA_API_ERROR'
  | 'INVALID_JSON'
  | 'UNKNOWN_ERROR';

// The known set gives autocomplete; the `string & {}` arm keeps arbitrary server `because` codes valid.
export type KumohaErrorReason = KnownKumohaErrorReason | (string & {});

export class KumohaError extends Error {
  readonly reason: KumohaErrorReason;

  constructor(reason: KumohaErrorReason, message?: string) {
    super(`(KumohaError) ${message ?? reason}`);
    this.name = 'KumohaError';
    this.reason = reason;
  }
}
