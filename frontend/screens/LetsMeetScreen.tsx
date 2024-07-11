import React, { useEffect, useState } from "react";
import { HomeStackParamList } from "../App";
import { StackScreenProps } from "@react-navigation/stack";
import { Button, DateTimePicker, Text } from "react-native-ui-lib";
import { Alert, ScrollView, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import api from "../api";
import { StripeProvider, usePaymentSheet } from "@stripe/stripe-react-native";
import { publishableKey } from "../config";

function LetsMeetScreen({
  route,
  navigation,
}: StackScreenProps<HomeStackParamList, "Book Details">) {
  const { book } = route.params;
  const [date, setDate] = React.useState<Date>(undefined);
  const [time, setTime] = React.useState<Date>(undefined);
  // Default Lat and Long are Tech Green: 33.775039, -84.397356
  const [markerLocation, setMarkerLocation] = React.useState({
    latitude: 33.775039,
    longitude: -84.397356,
  });
  console.log(markerLocation);

  const next3Days = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    next3Days.push(date);
  }

  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAndInitPaymentSheet();
  }, []);

  const fetchAndInitPaymentSheet = async () => {
    try {
      const paymentInfo = { amount: 100,
        bookID: book.id,
        location: markerLocation
       };
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

  async function onSubmit() {
    // TODO: Handle stripe payment FIRST
    try {
      await openPaymentSheet();
    } catch (e) {
      console.log(e);
    }

    const thisDate = new Date(date);
    thisDate.setTime(time.getTime());
    try {
      const response = await api.post("book_listings/request-meetup/", {
        bookId: book.id,
        location: markerLocation,
        meetup_time: thisDate,
      });
      console.log(response.data);
    } catch (e) {
      console.log(e);
    }

    navigation.navigate("Home");
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.meetText}>
          You are about to request to meet {book.owner.name} to purchase “
          {book.name}
          ”.
        </Text>
        <Text style={styles.feeTitle}>Location</Text>
        <Text>
          Please drag the pin to your desired meetup location on campus.
        </Text>

        <MapView
          style={{ width: "100%", height: 300, borderRadius: 30 }}
          initialRegion={{
            // TODO: Somehow base initial region off of the user's campus or location.
            latitude: 33.775039,
            longitude: -84.397356,
            latitudeDelta: 0.0075,
            longitudeDelta: 0.0075,
          }}
        >
          <Marker
            draggable
            coordinate={markerLocation}
            onDragEnd={(e) => setMarkerLocation(e.nativeEvent.coordinate)}
          />
        </MapView>

        <Text style={styles.feeTitle}>Meetup Time</Text>
        <DateTimePicker
          placeholder={"Select Date"}
          mode="date"
          minimumDate={next3Days[0]}
          maximumDate={next3Days[2]}
          onChange={(val) => setDate(val)}
        />
        <DateTimePicker
          placeholder={"Select Time"}
          mode="time"
          onChange={(val) => setTime(val)}
          value={time}
        />

        <Text style={styles.feeTitle}>Connection Fee</Text>

        <Text style={styles.feeText}>
          In order to provide you with the seller’s meetup details, we require a
          $1 fee. After paying this fee, the seller will receive your request to
          meet.
        </Text>

        <Button label="Pay" style={styles.payButton} onPress={onSubmit} />
      </ScrollView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
    gap: 10,
    width: "85%",
    alignSelf: "center",
  },
  payButton: {
    width: "90%",
    alignSelf: "center",
  },
  meetText: {
    marginTop: 10,
    color: "black",
    textAlign: "center",
    fontSize: 15,
  },
  feeTitle: {
    marginTop: 10,
    color: "black",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  feeText: {
    marginTop: 10,
    color: "black",
    textAlign: "left",
  },
});

export default LetsMeetScreen;
