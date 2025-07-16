import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutSubscription from './checkout-subscription';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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