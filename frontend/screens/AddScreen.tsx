import React, { useState } from "react";
import Input from "../components/Input";
import api from "../api";
import {
  Platform,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { TabParamList } from "../App";

import { Button, View } from "react-native-ui-lib";
import { BookListing } from "../Types";
import { AxiosError } from "axios";
import { pickImage } from "../utils";

export default function AddScreen({
  navigation,
}: StackScreenProps<TabParamList, "Add">) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ width: "100%" }}>
          <BookListingForm
            onSuccess={() =>
              navigation.navigate("Shop", {
                screen: "Home",
              })
            }
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export function BookListingForm({
  onSuccess,
  existingBookListing,
}: {
  onSuccess?: (newBook: BookListing) => void;
  existingBookListing?: BookListing; // Used to edit an existing book listing.
}) {
  const [image, setImage] = useState(existingBookListing?.image || null);
  const [name, setTitle] = useState(existingBookListing?.name || "");
  const [edition, setEdition] = useState(
    existingBookListing?.edition.toString() || ""
  );
  const [author, setAuthor] = useState(existingBookListing?.author || "");
  const [price, setPrice] = useState(
    existingBookListing?.price.toString() || ""
  );
  const [condition, setCondition] = useState(
    existingBookListing?.condition || ""
  );
  const [professor, setProfessor] = useState(
    existingBookListing?.professor || ""
  );
  const [classNumber, setClassNumber] = useState(
    existingBookListing?.class_number || ""
  );

  const handleSubmit = async () => {
    // Form validation
    const errors = [];
    if (!name) {
      errors.push("Title is required.");
    }
    if (!price) {
      errors.push("Price is required.");
    }
    if (!image) {
      errors.push("Image is required.");
    }

    if (errors.length) {
      Alert.alert(
        "The form could not be submitted due to the following errors:\n",
        errors.join("\n")
      );
      return;
    }

    const formData = new FormData();

    // Add text fields to formData
    formData.append("name", name);
    formData.append("edition", edition.toString());
    formData.append("author", author);
    formData.append("condition", condition);
    formData.append("price", price.toString());
    formData.append("professor", professor);
    formData.append("class_number", classNumber);

    // Append the image to formData
    formData.append("image", {
      name: "photo.jpg",
      type: "image/jpeg",
      uri: image,
    } as unknown as Blob);

    if (existingBookListing) {
      api.put(`book_listings/booklisting/${existingBookListing.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => {
        console.info("Updated book listing.", formData);
        onSuccess(res.data as BookListing);
        resetForm();
      });
    } else {
      api
        .post("book_listings/booklisting/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          onSuccess(res.data as BookListing);
          resetForm();
        })
        .catch((err: AxiosError) => console.error(err));
    }
  };

  const resetForm = () => {
    setImage(null);
    setTitle("");
    setEdition("");
    setAuthor("");
    setPrice("");
    setCondition("");
    setProfessor("");
    setClassNumber("");
  }

  return (
    <View style={styles.container}>
      <Button label="Select Image" onPress={() => pickImage(setImage)} />
      <View style={styles.imageContainer}>
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </View>

      <Input label="Title" value={name} onChangeText={setTitle} />
      <Input
        label="Edition"
        value={edition}
        onChangeText={setEdition}
        keyboardType="numeric"
      />
      <Input label="Author" value={author} onChangeText={setAuthor} />
      <Input
        label="Condition"
        value={condition}
        onChangeText={setCondition}
        height={100}
        multiline
        numberOfLines={4}
      />

      <Input
        label="Class Number"
        value={classNumber}
        onChangeText={setClassNumber}
      />
      <Input label="Professor" value={professor} onChangeText={setProfessor} />

      <Input
        label="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <View style={{ marginBottom: 300 }}>
        <Button label="Submit" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    width: 300,
    backgroundColor: "lightgray",
    borderRadius: 30,
    objectFit: "cover",
    overflow: "hidden",
  },
});
