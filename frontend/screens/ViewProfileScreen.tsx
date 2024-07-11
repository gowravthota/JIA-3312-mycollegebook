import { StackScreenProps } from "@react-navigation/stack";
import { HomeStackParamList, ProfileStackParamList } from "../App";
import React from "react";
import ProfileScreen, { ProfileScreenNavigationProp } from "./ProfileScreen";

// Simple screen to pass the user object from the route to the profile screen.
export default function ViewProfileScreen(
  props:
    | StackScreenProps<HomeStackParamList, "View Profile">
    | StackScreenProps<ProfileStackParamList, "View Other Profile">
) {
  const { route } = props;
  return (
    <ProfileScreen
      {...(props as unknown as { navigation: ProfileScreenNavigationProp })}
      viewUser={route.params.user}
      isSeller={route.params.isSeller}
    />
  );
}
