import React, { useEffect } from "react";
import { BookListing, MeetupRequest, Rating, User } from "../Types";
import {
  Text,
  Avatar,
  Image,
  View,
  Button,
  Card,
  Dialog,
} from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import Input from "../components/Input";
import api, { createUser } from "../api";
import { pickImage } from "../utils";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../UserContext";
import { TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList, TabParamList } from "../App";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import UniversityDropdown from "../components/UniversityDropdown";

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, "Profile">,
  BottomTabNavigationProp<TabParamList>
>;

/**
 * Screen to show details about a user's profile, including active book listings
 * and information about meetup requests and scheduled meetups.
 */
export default function ProfileScreen({
  viewUser,
  navigation,
  isSeller,
}: {
  viewUser?: User;
  navigation: ProfileScreenNavigationProp;
  isSeller?: boolean;
}) {
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [ownedBookListings, setOwnedBookListings] = React.useState(
    [] as BookListing[]
  );

  const [meetupRequestDetails, setMeetupRequestDetails] = React.useState({
    user_created: [],
    for_users_books: [],
    scheduled_meetups: [],
  } as { user_created: MeetupRequest[]; for_users_books: MeetupRequest[]; scheduled_meetups: MeetupRequest[] });

  const [pastTransactions, setPastTransactions] = React.useState(
    [] as BookListing[]
  );

  let user;
  const { user: contextUser, setUser } = useUser();

  if (viewUser) {
    user = viewUser;
  } else {
    user = contextUser;
  }

  // After updating a user, update the details that are shown.
  function onSuccess(user: User) {
    setUser(user);
    setDialogVisible(false);
  }

  // Fetch secondary user data, such as owned book listings.
  useEffect(() => {
    async function fetchOwnedBookListings() {
      const response = await api.get(
        `/book_listings/booklisting/?owner=${user.id}`
      );
      setOwnedBookListings(response.data);
    }

    async function fetchMeetupRequests() {
      const response = await api.get(`/book_listings/my-meetup-requests/`);
      setMeetupRequestDetails(response.data);
    }

    async function fetchPastTransactions() {
      // change API here
      const response = await api.get(
        `/book_listings/booklisting/?buyer=${user.id}`
      );
      setPastTransactions(response.data);
    }

    if (!viewUser) {
      // Only fetch meetup requests if we're looking at the current user's profile.
      fetchMeetupRequests();
    }

    fetchOwnedBookListings();
    fetchPastTransactions();
  }, [user]);

  return (
    <ScrollView>
      <View style={{ alignItems: "center", padding: 20 }}>
        <Avatar size={150} source={{ uri: user.profile_picture }} />
        <Text text60>{user.name}</Text>
        {isSeller ? (
          <>
            <Text text70>Seller Rating:</Text>
            <RatingView rating={user.seller_rating}></RatingView>
          </>
        ) : (
          <>
            <Text text70>Buyer Rating:</Text>
            <RatingView rating={user.buyer_rating}></RatingView>
          </>
        )}
        <Text text80>
          <Ionicons name="school" />{" "}
          {user.university ? user.university.name : ""}
        </Text>
        <Text text80>
          <Ionicons name="call" /> {user.phone_number}
        </Text>
        {!viewUser && (
          <>
            <Button
              outline
              label="Edit Profile"
              onPress={() => setDialogVisible(true)}
            />
          </>
        )}
        <Card style={{ padding: 20, margin: 10, width: "100%" }}>
          <Text text60>Active Book Listings</Text>
          {ownedBookListings.map((listing) => (
            <BookListingRow
              key={listing.id}
              listing={listing}
              onPress={() => {
                navigation.navigate("Shop", {
                  screen: "Book Details",
                  params: { book: listing },
                });
              }}
            />
          ))}
        </Card>
        {!viewUser && (
          <Card style={{ padding: 20, margin: 10, width: "100%" }}>
            <Text text60>Meetup Requests</Text>
            {meetupRequestDetails.for_users_books.map((meetupRequest) => (
              <MeetupRequestRow
                key={meetupRequest.id}
                meetupRequest={meetupRequest}
                onPress={() => {
                  navigation.navigate("Meetup Request Details", {
                    meetupRequest,
                  });
                }}
              />
            ))}
          </Card>
        )}
        {!viewUser && (
          <Card style={{ padding: 20, margin: 10, width: "100%" }}>
            <Text text60>Scheduled Meetups</Text>
            {meetupRequestDetails.scheduled_meetups.map((meetup) => (
              <MeetupScheduledRow
                key={meetup.id}
                meetup={meetup}
                onPress={() => {
                  navigation.navigate("Scheduled Meetup Request Details", {
                    meetupRequest: meetup,
                  });
                }}
              />
            ))}
          </Card>
        )}
        {!viewUser && (
          <Card style={{ padding: 20, margin: 10, width: "100%" }}>
            <Text text60>Past Transactions</Text>
            {pastTransactions.map((listing) => (
              <PastTransactionRow
                key={listing.id}
                listing={listing}
                onPress={() => {
                  navigation.navigate("Shop", {
                    screen: "Book Details",
                    params: { book: listing },
                  });
                }}
              />
            ))}
          </Card>
        )}
        <Dialog
          visible={dialogVisible}
          onDialogDismissed={() => setDialogVisible(false)}
        >
          <Card style={{ padding: 20, width: "100%" }}>
            <Text text60>Edit Profile</Text>
            <ProfileForm existingUser={user} onSuccess={onSuccess} />
          </Card>
        </Dialog>
        {!viewUser && (
          <Button
            backgroundColor="red"
            label="Logout"
            onPress={() => {
              async function clearUser() {
                setUser(null);
                await AsyncStorage.removeItem("accessToken");
                await AsyncStorage.removeItem("refreshToken");
              }
              clearUser();
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

function RatingView({ rating }: { rating: Rating }) {
  if (rating === "No Ratings") {
    return <Text grey30 style={{paddingBottom:10}}>No Ratings</Text>;
  }

  // out of 10, e.g.: rating = 9 -> 4.5 stars
  const numFullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 !== 0;

  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: numFullStars }).map((_, index) => (
        <FontAwesome
          key={`full-star-${index}`}
          name="star"
          size={24}
          color="gold"
        />
      ))}
      {hasHalfStar && <FontAwesome name="star-half-o" size={24} color="gold" />}
      {Array.from({ length: 5 - numFullStars - (hasHalfStar ? 1 : 0) }).map(
        (_, index) => (
          <FontAwesome
            key={`empty-star-${index}`}
            name="star-o"
            size={24}
            color="gold"
          />
        )
      )}
      <Text grey30 style={{ paddingLeft: 5 }}>({(rating / 2).toFixed(2)})</Text>
    </View>
  );
}

function BookListingRow({
  listing,
  onPress,
}: {
  listing: BookListing;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          height: 40,
          marginVertical: 10,
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <Image
          source={{ uri: listing.image }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 5,
            marginRight: 10,
          }}
        />
        <View>
          <Text text70>{listing.name}</Text>
          <Text text80>${listing.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MeetupRequestRow({
  meetupRequest,
  onPress,
}: {
  meetupRequest: MeetupRequest;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          height: 40,
          marginVertical: 10,
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <Image
          source={{ uri: meetupRequest.user.profile_picture }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            marginRight: 10,
          }}
        />
        <View>
          <Text text70>{meetupRequest.user.name}</Text>
          <Text text80>{meetupRequest.book_listing.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MeetupScheduledRow({
  meetup,
  onPress,
}: {
  meetup: MeetupRequest;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          height: 40,
          marginVertical: 10,
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <Image
          source={{ uri: meetup.user.profile_picture }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            marginRight: 10,
          }}
        />
        <View>
          <Text text70>{meetup.user.name}</Text>
          <Text text80>{meetup.book_listing.name}</Text>
          <Text text90>{new Date(meetup.meetup_time).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PastTransactionRow({
  listing,
  onPress,
}: {
  listing: BookListing;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          height: 40,
          marginVertical: 10,
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <Image
          source={{ uri: listing.image }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 5,
            marginRight: 10,
          }}
        />
        <View>
          <Text text70>{listing.name}</Text>
          <Text text80>${listing.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Form to allow updating or creating user profiles with the API.
 */
export function ProfileForm({
  existingUser,
  onSuccess,
  submitText,
}: {
  existingUser?: User;
  onSuccess?: (user: User, password?: string) => void;
  showPassword?: boolean;
  submitText?: string;
}) {
  const [firstName, setFirstName] = React.useState(existingUser?.first_name);
  const [lastName, setLastName] = React.useState(existingUser?.last_name);
  // TODO: Don't default to georgia tech.
  const [university, setUniversity] = React.useState(existingUser?.university);

  const [phoneNumber, setPhoneNumber] = React.useState(
    existingUser?.phone_number
  );
  const [profileImage, setProfileImage] = React.useState(
    existingUser?.profile_picture || null
  );

  // These fields should only be available on sign up.
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");

  const [errors, setErrors] = React.useState<string[]>([]);

  // On submit, validate and send data to the API.
  async function submitForm() {
    console.info("Submitting form", {
      firstName,
      lastName,
      university,
      phoneNumber,
    });
    setErrors([]);

    if (
      !(firstName && lastName) ||
      !university ||
      !phoneNumber ||
      !profileImage
    ) {
      setErrors([
        "Name, university, profile image, and phone number are required.",
      ]);
      return;
    }

    const formData = new FormData();

    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    if (!existingUser) {
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
    }
    formData.append("university", university.id.toString());
    formData.append("phone_number", phoneNumber);
    formData.append("is_active", "true");
    formData.append("profile_picture", {
      name: "photo.jpg",
      type: "image/jpeg",
      uri: profileImage,
    } as unknown as Blob);

    try {
      let user;
      if (existingUser) {
        // TODO: Actually use the API and get the user from the response.
        // const response = await api.put(`/user/${existingUser.id}`, formData);
        // user = response.data;
        user = {
          // Right now, this is just constructing a user object so we can update the screen with these details
          id: existingUser.id,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
          phone_number: phoneNumber,
          profile_picture: profileImage,
          university,
        } as User;
      } else {
        user = {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          profile_picture: profileImage,
          university,
        } as User;
        const createdUser = await createUser(formData);
        user = createdUser;
      }

      onSuccess?.(user, password);
    } catch (e) {
      if (e.response?.data) {
        const { email, phone_number, username } = e.response.data;
        const errors: string[] = [];

        if (email) {
          errors.push(...email);
        }

        if (phone_number) {
          errors.push(...phone_number);
        }

        if (username) {
          errors.push(...username);
        }

        setErrors(errors);
      }
    }
  }

  return (
    <View style={{ alignItems: "center" }}>
      <Avatar size={150} source={{ uri: profileImage }} />
      <Button
        outline
        style={{ margin: 5 }}
        label="Select Image"
        onPress={() => pickImage(setProfileImage)}
      />
      <Input
        label="First Name"
        value={firstName}
        onChangeText={(value) => setFirstName(value)}
      />
      <Input
        label="Last Name"
        value={lastName}
        onChangeText={(value) => setLastName(value)}
      />
      {!existingUser ? (
        <>
          <Input
            label="Email"
            value={email}
            autoCapitalize="none"
            onChangeText={(value) => setEmail(value)}
          />
          <Input
            label="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={(value) => setUsername(value)}
          />
          <Input
            label="Password"
            autoCapitalize="none"
            value={password}
            onChangeText={(value) => setPassword(value)}
            secureTextEntry
          />
        </>
      ) : null}

      <Input
        label="Phone Number"
        value={phoneNumber}
        onChangeText={(value) => setPhoneNumber(value)}
      />

      <UniversityDropdown
        university={university}
        onValueChange={(value) => setUniversity(value)}
      />

      {errors.length ? (
        <Text style={{ marginBottom: 10 }}>{errors.join(", ")}</Text>
      ) : null}
      <Button label={submitText || "Submit"} onPress={submitForm} />
    </View>
  );
}
