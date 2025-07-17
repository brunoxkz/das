import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
// Stripe.js desabilitado para evitar erros CSP
// import { loadStripe } from '@stripe/stripe-js';
import CheckoutSubscription from './checkout-subscription';

// Inicializar Stripe
// Stripe.js desabilitado para evitar erros CSP
const stripePromise = Promise.resolve(null);

interface CheckoutSubscriptionWrapperProps {
  onSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

export default function CheckoutSubscriptionWrapper({ 
  onSuccess, 
  onCancel 
}: CheckoutSubscriptionWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutSubscription 
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}