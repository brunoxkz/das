import { Request, Response } from 'express';
import fetch from 'node-fetch';

// Configuração do SAAS COBRAN
const SAAS_COBRAN_URL = process.env.SAAS_COBRAN_URL || 'http://localhost:3001';
const SAAS_COBRAN_API_KEY = process.env.SAAS_COBRAN_API_KEY || 'dev-key';

interface SaasCobrancaRequest {
  userId: string;
  email: string;
  planType: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

interface SaasCobrancaResponse {
  success: boolean;
  subscriptionId?: string;
  checkoutUrl?: string;
  customerId?: string;
  error?: string;
}

export class SaasCobrancaIntegration {
  private static instance: SaasCobrancaIntegration;

  public static getInstance(): SaasCobrancaIntegration {
    if (!SaasCobrancaIntegration.instance) {
      SaasCobrancaIntegration.instance = new SaasCobrancaIntegration();
    }
    return SaasCobrancaIntegration.instance;
  }

  /**
   * Cria uma nova assinatura no SAAS COBRAN
   */
  async createSubscription(data: SaasCobrancaRequest): Promise<SaasCobrancaResponse> {
    try {
      const response = await fetch(`${SAAS_COBRAN_URL}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAAS_COBRAN_API_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as SaasCobrancaResponse;
      return result;
    } catch (error) {
      console.error('Erro ao criar assinatura no SAAS COBRAN:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza o status de uma assinatura
   */
  async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<SaasCobrancaResponse> {
    try {
      const response = await fetch(`${SAAS_COBRAN_URL}/api/subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAAS_COBRAN_API_KEY}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as SaasCobrancaResponse;
      return result;
    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<SaasCobrancaResponse> {
    try {
      const response = await fetch(`${SAAS_COBRAN_URL}/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAAS_COBRAN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as SaasCobrancaResponse;
      return result;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Obtém informações de uma assinatura
   */
  async getSubscription(subscriptionId: string): Promise<SaasCobrancaResponse> {
    try {
      const response = await fetch(`${SAAS_COBRAN_URL}/api/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SAAS_COBRAN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as SaasCobrancaResponse;
      return result;
    } catch (error) {
      console.error('Erro ao obter informações da assinatura:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}

// Rotas para integração com SAAS COBRAN
export async function handleSaasCobrancaCreateSubscription(req: Request, res: Response) {
  try {
    const { userId, email, planType, amount, currency, metadata } = req.body;

    if (!userId || !email || !planType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios não fornecidos',
      });
    }

    const saasCobranca = SaasCobrancaIntegration.getInstance();
    const result = await saasCobranca.createSubscription({
      userId,
      email,
      planType,
      amount,
      currency: currency || 'BRL',
      metadata,
    });

    res.json(result);
  } catch (error) {
    console.error('Erro na criação de assinatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

export async function handleSaasCobrancaWebhook(req: Request, res: Response) {
  try {
    const { type, data } = req.body;

    console.log('Webhook recebido do SAAS COBRAN:', { type, data });

    // Processar diferentes tipos de webhook
    switch (type) {
      case 'subscription.created':
        // Atualizar dados do usuário no Vendzz
        break;
      case 'subscription.updated':
        // Atualizar status da assinatura
        break;
      case 'subscription.cancelled':
        // Cancelar acesso do usuário
        break;
      case 'payment.succeeded':
        // Confirmar pagamento
        break;
      case 'payment.failed':
        // Lidar com falha de pagamento
        break;
      default:
        console.log('Tipo de webhook desconhecido:', type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

// Middleware para validar API key do SAAS COBRAN
export function validateSaasCobrancaApiKey(req: Request, res: Response, next: any) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== SAAS_COBRAN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'API key inválida',
    });
  }
  
  next();
}