import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Colors } from "../constants/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function SelectPicker({ name, lists, onSelect }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={lists}
        setOpen={setOpen}
        setValue={(val) => {
          setValue(val);
          if (onSelect) onSelect(val);
        }}
        placeholder={`Select ${name}`}
        style={styles.dropdown}
        textStyle={styles.text}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="SCROLLVIEW"
        ArrowDownIconComponent={() => (
          <Ionicons name="chevron-down" size={20} color={Colors.GRAY} />
        )}
        ArrowUpIconComponent={() => (
          <Ionicons name="chevron-up" size={20} color={Colors.GRAY} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 25,
    backgroundColor: "transparent",
    height: 50,
  },
  text: {
    color: Colors.GRAY,
    fontSize: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 12,
    backgroundColor: Colors.mainColor,
  },
});
