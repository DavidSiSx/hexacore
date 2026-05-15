import { Logger } from '../../application/ports/KnowledgeVaultPorts';

/**
 * Implementación de infraestructura del puerto Logger utilizando las salidas estándar del proceso.
 * Se evita el uso de 'console' para cumplir con las políticas de limpieza más estrictas.
 */
export class ConsoleLogger implements Logger {
  public info(message: string): void {
    process.stdout.write(`[INFO] ${message}\n`);
  }

  public warn(message: string): void {
    process.stdout.write(`[WARN] ${message}\n`);
  }

  public error(message: string, error?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[ERROR] ${message}${error ? `: ${errorMessage}` : ''}\n`);
  }
}
