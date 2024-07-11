import React from "react";
import { HomeStackParamList } from "../App";
import { StackScreenProps } from "@react-navigation/stack";
import { ScrollView } from "react-native";
import { BookListingForm } from "./AddScreen";

function EditBookScreen({
  route,
  navigation,
}: StackScreenProps<HomeStackParamList, "Book Details">) {
  const { book } = route.params;
  return (
    <ScrollView>
      <BookListingForm
        existingBookListing={book}
        onSuccess={(newBook) => {
          navigation.navigate("Book Details", { book: newBook });
        }}
      />
    </ScrollView>
  );
}

export default EditBookScreen;
