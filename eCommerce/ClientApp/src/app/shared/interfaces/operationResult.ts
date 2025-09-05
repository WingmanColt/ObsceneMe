export class OperationResult {
  success?: boolean;
  successMessage?: string;
  id?: number;
  failureMessage?: string;       // single message (optional, first failure)
  failureMessages?: string[];    // multiple failure messages
  exception?: any;
}
