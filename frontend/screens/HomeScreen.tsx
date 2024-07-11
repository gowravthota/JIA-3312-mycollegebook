import React, { useState } from "react";
import Input from "../components/Input";
import { StyleSheet } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { HomeStackParamList } from "../App";

import {View, Button} from 'react-native-ui-lib';

export default function HomeScreen({ navigation }: StackScreenProps<HomeStackParamList>) {
  const [title, setTitle] = useState("");
  const [edition, setEdition] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = () => {
    navigation.navigate("Search Results", { title, edition, author });
  };

  return (
    <View style={styles.container}>
      <Input label="Title" value={title} onChangeText={setTitle} />
      <Input
        label="Edition"
        value={edition}
        onChangeText={setEdition}
        keyboardType="numeric"
      />
      <Input label="Author" value={author} onChangeText={setAuthor} />
      <Button label="Search" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
