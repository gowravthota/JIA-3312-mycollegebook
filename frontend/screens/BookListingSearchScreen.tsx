import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, SafeAreaView, Image } from "react-native";

import { View, Text, TouchableOpacity } from "react-native-ui-lib";
import api from "../api";
import { getOrdinalNumber } from "../utils";
import type { BookListing } from "../Types";
import type { StackScreenProps } from "@react-navigation/stack";
import type { HomeStackParamList } from "../App";
import { useIsFocused } from "@react-navigation/core";

import {Picker} from '@react-native-picker/picker';

function BookListingItem({
  item,
  onPress,
}: {
  item: BookListing;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={() => onPress()}>
      <View style={styles.bookListingContainer}>
        <View style={styles.bookListingImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookListingImage}
          ></Image>
        </View>
        <View style={{ padding: 15 }}>
          <View style={styles.bookListingFirstLine}>
            <Text style={styles.bookListingtitleText}>{item.name}</Text>
            <Text style={styles.bookListingPrice}>${item.price}</Text>
          </View>
          <Text style={{ color: "gray" }}>
            {item.author} - {getOrdinalNumber(item.edition)} edition
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Price
function SortSelection({ selectedSort, onSortChange }) {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedSort}
        onValueChange={(itemValue) => onSortChange(itemValue) }
        style={styles.pickerStyle}>
        
        <Picker.Item style={styles.pickerItemStyle} label="Price: High to Low" value="high" />
        <Picker.Item style={styles.pickerItemStyle} label="Price: Low to High" value="low" />
      </Picker>
    </View>
  );
}

const BookListingSearchScreen = ({
  route,
  navigation,
}: StackScreenProps<HomeStackParamList, "Search Results">) => {
  const { title, edition, author } = route.params;
  const [bookResults, setBookResults] = useState(null);
  const isFocused = useIsFocused();
  const [sort, setSort] = useState("high");

  useEffect(() => {
    // On initial load or subsequent navigations, query the API for a list of books.
    async function fetchBooks() {
      const params = new URLSearchParams();
      let url = "book_listings/booklisting/";
      let filter = false;
      if (title) {
        params.append("name", title);
        filter = true;
      }
      if (edition) {
        params.append("edition", edition);
        filter = true;
      }
      if (author) {
        params.append("author", author);
        filter = true;
      }

      if (filter) {
        url = `${url}?${params.toString()}`;
      }

      const response = await api.get(url);
      console.info("Resolved book listings.", response.data);
      setBookResults(response.data);
    }
    fetchBooks();
  }, [title, edition, author, isFocused]);

  if (!bookResults) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // filter by price
  const filteredByPrice = bookResults.sort((a: { price: number; }, b: { price: number; }) => {
    if (sort === "high") {
      return b.price - a.price;
    } else if (sort === "low") {
      return a.price - b.price;
    }
  });


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sortText}>Sort</Text>
      <SortSelection selectedSort={sort} onSortChange={setSort} />

      {bookResults.length ? (
        <FlatList
          data={bookResults}
          renderItem={(item) => (
            <BookListingItem
              item={item.item}
              onPress={() => {
                navigation.navigate("Book Details", { book: item.item });
              }}
            />
          )}
          style={styles.list}
        />
      ) : (
        <Text>No results found.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "visible",
  },
  list: {
    marginVertical: 10,
    width: "100%",
    paddingHorizontal: "2%",
    overflow: "visible"
  },
  bookListingContainer: {
    borderRadius: 25,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 20,
  },
  bookListingtitleText: {
    fontSize: 18,
    fontWeight: "500",
    maxWidth: 250,
  },
  bookListingPrice: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 10,
  },
  bookListingFirstLine: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookListingImageContainer: {},
  bookListingImage: {
    objectFit: "cover",
    height: 150,
    width: "100%",
    borderRadius: 25,
  },
  pickerContainer: {
    alignSelf: "flex-start",
    marginLeft: "2%",
    marginBottom: 5,
    width: '55%',
    height: 35,
    backgroundColor: 'lightgray',
    borderRadius: 50,
  },
  pickerStyle: {
    width: '100%',
    color: 'black',
    marginTop: -10,
  },
  pickerItemStyle: {
    fontSize: 17,
    color: 'black',
  },
  sortText: { 
    alignSelf: "flex-start",
    marginLeft: "2%",
    fontSize: 25,
    fontWeight: "700",
    marginTop: 10,
  },
  // Add additional styling as needed
});

export default BookListingSearchScreen;
