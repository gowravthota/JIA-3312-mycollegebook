import React, { useState, useEffect } from "react";
import {
  Picker,
  PickerFieldTypes,
  PickerValue,
  View,
  Text,
  Colors,
} from "react-native-ui-lib";
import { University } from "../Types";
import api from "../api";

interface DropdownProps {
  onValueChange: (value: any) => void;
  university: University | null;
}

const UniversityDropdown: React.FC<DropdownProps> = ({ onValueChange, university}) => {
  const apiUrl = "/api/";
  const [univerities, setUniverities] = useState<University[]>([]);
  const [selectedValue, setSelectedValue] = useState<number>((university) ? university.id : 0);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await api.get("universities/");

      const data = response.data;
      const unis: University[] = data as University[];
      setUniverities(unis);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleValueChange = (value: PickerValue) => {
    // console.log(value);
    setSelectedValue(parseInt(value.toString()));
    onValueChange(getUniversity(value));
  };

  const getUniversity = (value: PickerValue) => {
    const currentUni = univerities.filter((uni) => uni.id === value);
    if (currentUni.length > 0) {
      return currentUni[0];
    }
    return;
  }

  const getLabel = (value: PickerValue) => {
    const uni = getUniversity(value);
    return (uni) ? uni.name : "";
  };

  return (
    <View
      style={{
        width: "100%",
        height: 70,
        position: "relative",
        backgroundColor: "white",
        paddingVertical: 2,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 4,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 1,
          height: "100%",
          alignItems:"flex-start"
        }}
      >
        <Picker
          style={{
            width: "100%",
            height:30,
            left: 10,
            top: 10,
          }}
          topBarProps={{ useSafeArea: true }}
          placeholder={"University"}
          value={selectedValue}
          onChange={handleValueChange}
          showSearch
          getLabel={getLabel}
          searchPlaceholder={"Search for University"}
        >
          {univerities.map((uni) => (
            <Picker.Item
              key={uni.id}
              value={uni.id}
              label={uni.name}
              labelStyle={{ color: "black" }}
            />
          ))}
        </Picker>
      </View>
      <Text style={{ position: "absolute", left: 10, bottom: 10 }}>
        {getLabel(selectedValue)}
      </Text>
    </View>
  );
};

export default UniversityDropdown;
