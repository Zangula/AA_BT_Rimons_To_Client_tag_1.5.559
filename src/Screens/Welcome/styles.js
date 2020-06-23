import {
    Dimensions,
    StyleSheet,
  } from "react-native"
import { dynamicSize, getFontSize } from '../../components/dynamicsize'
const { width, height } = Dimensions.get('window')
export default StyleSheet.create({
    card: {
      width: width - dynamicSize(35),
      elevation: dynamicSize(3),
      borderWidth: dynamicSize(0.5),
      backgroundColor: "white",
      borderColor: "#ddd",
      shadowColor: "#000",
      alignSelf: "center",
      marginHorizontal: dynamicSize(10),
      marginVertical: dynamicSize(20),
      shadowOpacity: dynamicSize(0.3),
    },
    cardUnparied: {
      width: width - dynamicSize(35),
      height: height / dynamicSize(6),
      elevation: dynamicSize(0.4),
      borderWidth: dynamicSize(0.5),
      backgroundColor: "white",
      borderColor: "#ddd",
      shadowColor: "#000",
      alignSelf: "center",
      marginHorizontal: dynamicSize(10),
      marginVertical: dynamicSize(20),
      shadowOpacity: dynamicSize(0.3)
    },
    container: {
      flex: 1,
      backgroundColor: '#FFF',
      width: window.width,
      height: window.height
    },
    scroll: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      margin: 10,
    },
    row: {
      margin: 10
    },
    toastStyle: {
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
      borderWidth: 1,
      borderColor: 'black'
    },
    textToast: {
      color: 'white',
      fontSize: getFontSize(12),
      fontWeight: '500'
    }
  })