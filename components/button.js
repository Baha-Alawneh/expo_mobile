import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const MainButton = ( { backgroundColor, color, width, text, onPress } ) => {
  return (
    <TouchableOpacity style={[styles.mainBtn, { backgroundColor, width }]} onPress={onPress} activeOpacity={0.8}>
        <Text style={[styles.mainBtnText, { color }]}>{text}</Text>
    </TouchableOpacity>
  )
}

export default MainButton

const styles = StyleSheet.create({
    mainBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 30,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    },
    mainBtnText: {
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center'
    }
})