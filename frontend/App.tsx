import { StatusBar } from "expo-status-bar";

import React, { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import AddScreen from "./screens/AddScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import BookListingSearchScreen from "./screens/BookListingSearchScreen";
import BookListingDetailScreen from "./screens/BookListingDetailScreen";
import { BookListing, MeetupRequest, User } from "./Types";
import EditBookScreen from "./screens/EditBookScreen";
import {
  SignInScreen,
  SignUpScreen,
  VerifyScreen,
} from "./screens/AuthScreens";
import { ActivityIndicator, StyleSheet } from "react-native";
import { signInWithToken, useConnectionErrorInterceptor } from "./api";
import { Button, Text, View } from "react-native-ui-lib";
import { UserProvider, useUser } from "./UserContext";
import ViewProfileScreen from "./screens/ViewProfileScreen";
import MeetupRequestScreen from "./screens/MeetupRequestScreen";
import ScheduledMeetupRequestScreen from "./screens/ScheduledMeetupRequestScreen";
import LetsMeetScreen from "./screens/LetsMeetScreen";
import CheckoutScreen from "./screens/CheckoutScreen";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Subscription } from "expo-modules-core";

export type TabParamList = {
  Shop: NavigatorScreenParams<HomeStackParamList>;
  Add: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};
const Tab = createBottomTabNavigator<TabParamList>();

export type ProfileStackParamList = {
  Profile: undefined;
  "Meetup Request Details": { meetupRequest: MeetupRequest };
  "Scheduled Meetup Request Details": { meetupRequest: MeetupRequest };
  "View Other Profile": { user: User, isSeller?: boolean };
  "Verify Phone Number": undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  "Search Results": {
    title: string;
    edition: string;
    author: string;
  };
  "Book Details": {
    book: BookListing;
  };
  "Edit Book": {
    book: BookListing;
  };
  "View Profile": {
    user: User;
    isSeller?: boolean;
  };
  "Lets Meet": {
    book: BookListing;
  };
  Checkout: undefined;
};
const HomeStack = createStackNavigator<HomeStackParamList>();
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{ headerTitle: "" }}
    initialRouteName="Home"
  >
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen
      name="Search Results"
      component={BookListingSearchScreen}
    />
    <HomeStack.Screen name="Book Details" component={BookListingDetailScreen} />
    <HomeStack.Screen name="Edit Book" component={EditBookScreen} />
    <HomeStack.Screen name="View Profile" component={ViewProfileScreen} />
    <HomeStack.Screen name="Lets Meet" component={LetsMeetScreen} />
    <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
  </HomeStack.Navigator>
);

const ProfileStack = createStackNavigator();
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="My Profile" component={ProfileScreen} />
    <ProfileStack.Screen
      name="Meetup Request Details"
      component={MeetupRequestScreen}
    />
    <ProfileStack.Screen
      name="Scheduled Meetup Request Details"
      component={ScheduledMeetupRequestScreen}
    />
    <ProfileStack.Screen
      name="View Other Profile"
      component={ViewProfileScreen}
    />
    <ProfileStack.Screen name="Verify Phone Number" component={VerifyScreen} />
    <ProfileStack.Screen name="Checkout" component={CheckoutScreen} />
  </ProfileStack.Navigator>
);

export type AuthStackParamList = {
  "Sign In": undefined;
  "Sign Up": undefined;
  Verify: undefined;
};
const AuthStack = createStackNavigator<AuthStackParamList>();
const AuthStackNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Sign Up" component={SignUpScreen} />
    <AuthStack.Screen name="Sign In" component={SignInScreen} />
    <AuthStack.Screen name="Verify" component={VerifyScreen} />
  </AuthStack.Navigator>
);

// Async notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

// Wrap the app with user context.
function MainApp() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const { connectionError: error, setConnectionError } =
    useConnectionErrorInterceptor();

  // Hooks for handling notifications
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<any | null>(null);
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  //

  useEffect(() => {
    async function checkLoginState() {
      const user = await signInWithToken();
      setLoading(false);
      setUser(user);
    }

    checkLoginState();
  }, []);

  if (error) {
    return (
      <View style={styles.fullScreen}>
        <Text>A Connection Error Has Occured.</Text>
        <Text>Code: [{error.code}]</Text>
        <Text>Message: {error.message}</Text>
        <Button
          onPress={() => {
            setConnectionError(null);
          }}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && user.is_verified ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Shop") {
                iconName = focused ? "ios-basket" : "ios-basket-outline";
              } else if (route.name === "Add") {
                iconName = focused
                  ? "ios-add-circle"
                  : "ios-add-circle-outline";
              } else if (route.name === "Profile") {
                iconName = focused ? "ios-person" : "ios-person-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Shop" component={HomeStackNavigator} />
          <Tab.Screen name="Add" component={AddScreen} />
          <Tab.Screen
            name="Profile"
            component={ProfileStackNavigator}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      ) : (
        <AuthStackNavigator />
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

// Can also use https://expo.dev/notifications for testing
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Notification header",
    body: "Notification body",
    data: { someData: "" }, // This might have purpose in the future
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

// Trigger can be modified for timing here (just make sure to change `trigger: { seconds: 2 }` to `trigger`), e.g.
//
// const trigger = new Date(Date.now() + 60 * 60 * 1000);
// trigger.setMinutes(0);
// trigger.setSeconds(0);
//
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Notification header",
      body: "Notification body",
      data: { data: "" },
    },
    trigger: { seconds: 2 },
  });
}

// Token return: needed to identify the specific device. Also need to extend to iOS, but Apple Dev is a paid service?
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log(token);
  } else {
    alert("Must use a physical device for push notifications");
  }

  return token.data;
}
