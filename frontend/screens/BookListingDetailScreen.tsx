import React from "react";
import { View, Text, Image, Button } from "react-native-ui-lib";
import { HomeStackParamList } from "../App";
import { StackScreenProps } from "@react-navigation/stack";
import { getOrdinalNumber } from "../utils";
import { ScrollView, TouchableOpacity } from "react-native";
import { useUser } from "../UserContext";

function BookListingDetailScreen({
  route,
  navigation,
}: StackScreenProps<HomeStackParamList, "Book Details">) {
  const { book } = route.params;
  console.info("Opened book listing screen with book:", book);

  const { user } = useUser();
  const [dollars, cents] = book.price.toString().split(".");

  return (
    <ScrollView>
      <View backgroundColor="white" style={{ minHeight: "100%" }}>
        <Image source={{ uri: book.image }} style={{ height: 300 }} />
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              width: "100%",
              marginTop: 10,
            }}
          >
            {book.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Text style={{ fontSize: 16, color: "gray" }}>{book.author}</Text>
            <Text style={{ fontSize: 16, color: "gray" }}>
              {getOrdinalNumber(book.edition)} edition
            </Text>
          </View>
          <Text style={{ fontWeight: "bold", marginVertical: 10 }}>
            <Text style={{ fontSize: 48 }}>${dollars}</Text>
            <Text style={{ fontSize: 30 }}>.{cents}</Text>
          </Text>
          <Text style={{ color: "gray" }}>
            The seller has described the book&apos;s condition as:
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "flex-start",
              gap: 10,
            }}
          >
            <Text style={{ color: "black", fontSize: 30, fontWeight: "bold" }}>
              “
            </Text>
            <Text style={{ color: "black", textAlign: "left", width: "100%" }}>
              {book.condition}
            </Text>
          </View>
          {!!book.owner && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("View Profile", { user: book.owner, isSeller: true })
              }
            >
              <Text color="blue">Sold by: {book.owner?.name || "Unknown"}</Text>
            </TouchableOpacity>
          )}
          <Text style={{ marginTop: 10, color: "gray", textAlign: "center" }}>
            After paying a $1 fee, the seller will receive your request to meet.
          </Text>
          {book.owner?.id === user.id ? (
            <Button
              label="Edit"
              outline
              onPress={() => navigation.navigate("Edit Book", { book })}
            />
          ) : (
            <Button
              label="Let's Meet"
              onPress={() => {
                navigation.navigate("Lets Meet", { book });
              }
              }
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default BookListingDetailScreen;
