/**
 * Interface para as chaves de API do gateway
 */
export interface GatewayApiKeys {
  publicKey: string;
  secretKey: string;
}

/**
 * Interface para a configuração de uso do gateway
 */
export interface GatewayUsageConfig {
  forDeposit: boolean;
  forWithdraw: boolean;
}

/**
 * Interface para os métodos de pagamento suportados pelo gateway
 */
export interface GatewayPaymentMethods {
  allowPix: boolean;
  allowCard: boolean;
}

/**
 * Interface para o gateway de pagamento
 */
export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
  apiKeys: GatewayApiKeys;
  usageConfig: GatewayUsageConfig;
  paymentMethods: GatewayPaymentMethods;
}

/**
 * Enum para os tipos de transação
 */
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

/**
 * Enum para os status de transação
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Interface para transações de pagamento
 */
export interface PaymentTransaction {
  id: string;
  userId: string;
  gatewayId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  gatewayReference?: string;
  createdAt: Date;
  updatedAt: Date;
} 