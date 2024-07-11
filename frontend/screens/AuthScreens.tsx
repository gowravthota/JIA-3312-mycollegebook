import React, { useState } from "react";
import { Button, Text, View } from "react-native-ui-lib";
import { ProfileForm } from "./ProfileScreen";
import { ScrollView, TextInput, TouchableOpacity } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthStackParamList } from "../App";
import Input from "../components/Input";
import {
  VerifyCodeResponse,
  checkVerificationCode,
  sendVerificationCode,
  signIn,
} from "../api";
import { useUser } from "../UserContext";
import api, { createUser } from "../api";
import { AxiosError } from "axios";

export function SignUpScreen({
  navigation,
}: StackScreenProps<AuthStackParamList, "Sign Up">) {
  const { setUser } = useUser();

  async function submitSignUp(username, password) {
    // On Sign Up, log in with the newly created user and set context.
    try {
      const user = await signIn(username, password);
      setUser(user);
      if (!user.is_verified) {
        navigation.navigate("Verify");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ScrollView>
      <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
        <Text text30 style={{ textAlign: "center" }}>
          MyCollegeBook
        </Text>
        <Text text50 style={{ textAlign: "center" }}>
          Create an Account
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Sign In")}>
          <Text style={{ textAlign: "center", marginBottom: 10 }} color="blue">
            Already have an account? Sign In.
          </Text>
        </TouchableOpacity>
        <ProfileForm
          submitText="Create Account"
          onSuccess={(user, password) => {
            submitSignUp(user.username, password);
          }}
        />
        {/* <TouchableOpacity onPress={() => navigation.navigate("Verify")}>
          <Text style={{ textAlign: "center", marginBottom: 10, marginTop: 5 }} color="blue">
            Verify Phone Number.
          </Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

export function SignInScreen({
  navigation,
}: StackScreenProps<AuthStackParamList, "Sign In">) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const { setUser } = useUser();

  async function submitSignIn() {
    try {
      const user = await signIn(username, password);
      setUser(user);
      if (!user.is_verified) {
        navigation.navigate("Verify");
      }
    } catch (e) {
      console.error(e);
      if (e.response.data) {
        console.log(e.response.data);
      }
      setErrors([
        "Sign in failed. Please check your username and password and try again.",
      ]);
    }
  }

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingBottom: 10,
        justifyContent: "center",
        height: "60%",
      }}
    >
      <Input
        label="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <Input
        label="Password"
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button label="Sign In" onPress={submitSignIn} />
      {errors.length ? <Text>{errors.join(",")}</Text> : null}
    </View>
  );
}

export const VerifyScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSendVerificationCode = async () => {
    try {
      const { message } = await sendVerificationCode();
      alert(message);
    } catch (err) {
      const axiosError = err as AxiosError;
      const { error } = axiosError.response.data as VerifyCodeResponse;
      console.error(err);
      setError(error);
    }
  };

  const handleCheckVerificationCode = async () => {
    try {
      const { message } = await checkVerificationCode(code);
      alert(message);
      setUser({...user, is_verified: true});

    } catch (err) {
      const axiosError = err as AxiosError;
      const { code, error } = axiosError.response.data as VerifyCodeResponse;
      setError(error ? error : code);
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingBottom: 10,
        justifyContent: "center",
        height: "60%",
      }}
    >
      <Text style={{ textAlign: "center", marginBottom: 10, fontSize: 20 }}>
        Verify Your Phone Number
      </Text>
      <Button
        label="Send Verification Code"
        onPress={handleSendVerificationCode}
        style={{ marginBottom: 30 }}
      />

      <Input
        label="Enter verification code"
        autoCapitalize="none"
        value={code}
        onChangeText={setCode}
        secureTextEntry
        keyboardType="number-pad"
      />

      <Button
        label="Verify"
        onPress={handleCheckVerificationCode}
        style={{ marginTop: 2 }}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
    </View>
  );
};
