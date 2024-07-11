import * as ImagePicker from "expo-image-picker";
import { Linking, Platform } from "react-native";

export function getOrdinalNumber(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  // For numbers like 11, 12, 13, use 'th'
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


  export async function pickImage (setImage: (uri) => void) {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: false,
      });

      setImage(result.assets[0].uri);
    } catch (e) {
      console.log(e);
    }
  }


export function openMapLink(latitude: number, longitude: number) {
  const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${latitude},${longitude}`;
  const label = 'Meetup Location';
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`
  });
    
  Linking.openURL(url);
}