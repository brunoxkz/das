// CORREÇÃO CRÍTICA: JWT REFRESH TOKEN RESPONSE STRUCTURE
// Garantir que o response do refresh token atenda aos requisitos dos testes

export interface JWTRefreshResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
  expiresIn?: number;
  tokenType?: string;
}

export const validateJWTRefreshResponse = (response: any): boolean => {
  return (
    response &&
    response.success === true &&
    response.message &&
    response.token &&
    response.refreshToken &&
    response.accessToken &&
    response.user &&
    response.user.id &&
    response.user.email &&
    response.user.role &&
    response.user.plan
  );
};