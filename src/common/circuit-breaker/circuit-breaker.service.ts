import { Injectable, Logger } from "@nestjs/common";
import {
  CircuitBreakerOptions,
  CircuitBreakerState,
  CircuitBreakerStateEnum,
} from "./circuit-breaker.interface";

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger();
  private readonly circuits = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 30000,
    timeout: 60000,
  };

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = this.defaultOptions,
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const circuit = this.getOrCreateCircuit(key, config);

    if (circuit.state === "OPEN") {
      if (Date.now() < circuit.nextAttemptTime) {
        this.logger.warn(`Circuit breaker OPEN for ${key}, using fallback`);
        if (fallback) {
          return await fallback();
        }
        throw new Error("Circuit breaker OPEN");
      } else {
        circuit.state = CircuitBreakerStateEnum.HALF_OPEN;
        this.logger.warn(
          `Circuit breaker HALF_OPEN for ${key}, using fallback`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess(circuit, key);
      return result;
    } catch (err) {
      this.onFailure(circuit, key, options);
      this.logger.error(`Circuit breaker failure for ${key}:`, err.message);
      if (fallback) {
        this.logger.warn(`Using fallback for ${key}`);
        return await fallback();
      }
      throw err;
    }
  }

  private getOrCreateCircuit(
    key: string,
    options: CircuitBreakerOptions,
  ): CircuitBreakerState {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: CircuitBreakerStateEnum.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: Date.now() + options.timeout,
      });
    }

    return this.circuits.get(key)!;
  }

  private onSuccess(circuit: CircuitBreakerState, key: string): void {
    circuit.failureCount = 0;
    circuit.state = CircuitBreakerStateEnum.CLOSED;
    this.logger.debug(`Circuit breaker SUCCESS for ${key}, state: CLOSED`);
  }

  private onFailure(
    circuit: CircuitBreakerState,
    key: string,
    options: CircuitBreakerOptions,
  ): void {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();
    if (circuit.failureCount >= options.failureThreshold) {
      circuit.state = CircuitBreakerStateEnum.OPEN;
      circuit.nextAttemptTime = Date.now() + options.timeout;
      this.logger.debug(
        `Circuit breaker OPENED for ${key} after ${circuit.failureCount} failures`,
      );
    }
  }

  getCircuitState(key: string): CircuitBreakerState | undefined {
    return this.circuits.get(key);
  }

  getAllCircuits(): Map<string, CircuitBreakerState> {
    return this.circuits;
  }

  resetCircuit(key: string): void {
    this.circuits.delete(key);
  }
}
