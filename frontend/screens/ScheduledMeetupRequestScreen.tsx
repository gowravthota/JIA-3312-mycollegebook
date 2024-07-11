import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList, TabParamList } from "../App";
import { Image, Text, Button } from "react-native-ui-lib";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { openMapLink } from "../utils";

type ScheduledMeetupRequestScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<
    ProfileStackParamList,
    "Scheduled Meetup Request Details"
  >,
  BottomTabNavigationProp<TabParamList>
>;

function ScheduledMeetupRequestScreen({
  route,
  navigation,
}: {
  route: RouteProp<ProfileStackParamList, "Scheduled Meetup Request Details">;
  navigation: ScheduledMeetupRequestScreenNavigationProp;
}) {
  const { meetupRequest } = route.params;

  // Double check that the date is actually a date:
  let meetupTime = meetupRequest.meetup_time;
  if (typeof meetupRequest.meetup_time === "string") {
    meetupTime = new Date(meetupRequest.meetup_time);
  }

  const longitude = parseFloat(meetupRequest.location_longitude);
  const latitude = parseFloat(meetupRequest.location_latitude);

  return (
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
      <Button
        label="Complete"
        onPress={() => {
          navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

export default ScheduledMeetupRequestScreen;
