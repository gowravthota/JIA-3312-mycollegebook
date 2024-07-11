import React from "react";
import { ViewProps, TextInputProps, TextStyle } from "react-native";

import { View, TextField, TextFieldProps } from "react-native-ui-lib";

/**
 * Custom Input for consistent styles.
 */
function Input({
  label,
  value,
  onChangeText,
  width,
  height,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  width?: string | number;
  height?: number;
} & TextInputProps) {
  return (
    <View style={{ width: width || "100%" } as ViewProps}>
      <TextField
        value={value}
        style={{ height } as TextStyle}
        placeholder={label}
        floatingPlaceholder
        onChangeText={onChangeText}
        containerStyle={{
          width: "100%",
          height: height || 50,
          marginBottom: 10,
          backgroundColor: "white",
          borderRadius: 10,
          paddingLeft: 10,
        }}
        {...(props as TextFieldProps)}
      />
    </View>
  );
}

export default Input;
