import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList, TabParamList } from "../App";
import { Image, Text, Button } from "react-native-ui-lib";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Alert, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import api from "../api";
import { usePaymentSheet, StripeProvider } from "@stripe/stripe-react-native";
import { publishableKey } from "../config";
import { openMapLink } from "../utils";

type MeetupRequestScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, "Meetup Request Details">,
  BottomTabNavigationProp<TabParamList>
>;

function MeetupRequestScreen({
  route,
  navigation,
}: {
  route: RouteProp<ProfileStackParamList, "Meetup Request Details">;
  navigation: MeetupRequestScreenNavigationProp;
}) {
  const { meetupRequest } = route.params;

  // Double check that the date is actually a date:
  let meetupTime = meetupRequest.meetup_time;
  if (typeof meetupRequest.meetup_time === "string") {
    meetupTime = new Date(meetupRequest.meetup_time);
  }

  const longitude = parseFloat(meetupRequest.location_longitude);
  const latitude = parseFloat(meetupRequest.location_latitude);

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

  async function onAccept() {
    await openPaymentSheet();

    try {
      const response = api.post("book_listings/accept-meetup-request/", {
        meetupRequestId: meetupRequest.id,
      });
      console.log(response);
    } catch (e) {
      console.error(e);
    }

    // TODO: Navigate to somewhere else
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", padding: 10, gap: 10 }}
      >
        <Text>Meetup Request from:</Text>
        <Text text40>{meetupRequest.user.name}</Text>
        <Image
          source={{ uri: meetupRequest.user.profile_picture }}
          style={{ height: 150, width: 150, borderRadius: 100 }}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("View Other Profile", {
              user: meetupRequest.user,
            });
          }}
        >
          <Text blue20 text60L>View Profile</Text>
        </TouchableOpacity>
        {meetupRequest.location_latitude && meetupRequest.location_longitude ? (
          <>
            <Text text60>Requested Meetup Location</Text>
            <MapView
              initialRegion={{
                longitude,
                latitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003,
              }}
              style={{ width: "100%", height: 300, borderRadius: 30 }}
            >
              <Marker
                coordinate={{
                  latitude,
                  longitude,
                }}
                title="Meetup Location"
                description="Location of the meetup request"
              />
            </MapView>
            <TouchableOpacity
              onPress={() => {
                openMapLink(latitude, longitude);
              }}
            >
              <Text blue20 text60L>
                Open in Maps
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
        <Text text60>Requested Meetup Time</Text>
        {meetupTime ? <Text>{meetupTime.toLocaleString()}</Text> : null}
        <Text text60>Connection Fee</Text>
        <Text style={{ marginTop: 10, color: "gray", textAlign: "center" }}>
          After paying a $1 fee, the meetup request will be confirmed.
        </Text>
        <Button label="Accept" onPress={onAccept} />
        <Button
          outline
          outlineColor="red"
          label="Decline"
          // TODO: Mark meetup request as declined
        />
      </ScrollView>
    </StripeProvider>
  );
}

export default MeetupRequestScreen;
