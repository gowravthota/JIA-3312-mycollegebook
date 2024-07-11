/**
 * @file This file is the checkout screen for the app. It uses the Stripe API to handle payments.
 *  Currently it is unused but provides a template for handling Stripe Payments.
 */
import { StripeProvider, usePaymentSheet } from "@stripe/stripe-react-native";
import React, { useState, useEffect } from "react";
import { Button, Alert } from "react-native";
import api from "../api";
const publishableKey =
  "pk_test_51O1WwKKNSbBN16XrIgS0lg5wHOVR5Vs4oB2j6sTg98TkjLEDiZ0JqTf5ngdYOJWpXLpY3afq8mH5gtNcOfDayuEe00JVD9jQMU";
const Checkout: React.FC = () => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAndInitPaymentSheet();
  }, []);

  const fetchAndInitPaymentSheet = async () => {
    try {
      const paymentInfo = { amount: 100 };
      const response = await api.post(
        "payment/create-payment-intent/",
        paymentInfo
      );

      if (response.data.clientSecret) {
        await initPaymentSheet({
          paymentIntentClientSecret: response.data.clientSecret,
          merchantDisplayName: "anything",
        });

        setLoading(false);
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error) {
      console.error("Failed to initialize payment sheet:", error);
      Alert.alert(
        "Error",
        "Failed to initialize payment sheet. Please try again later."
      );
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert("Payment Failed", error.message);
    } else {
      Alert.alert("Payment Success", "Thank you for your purchase!");
    }
  };

  return (
    <Button
      onPress={openPaymentSheet}
      title={loading ? "Loading..." : "Pay Now"}
      disabled={loading}
    />
  );
};
const CheckoutScreen: React.FC = () => {
  return (
    <StripeProvider publishableKey={publishableKey}>
      <Checkout />
    </StripeProvider>
  );
};

export default CheckoutScreen;
