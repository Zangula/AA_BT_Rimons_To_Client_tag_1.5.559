import React , {useState}from "react"
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from "react-native"
import { connect } from 'react-redux';
import { toggleDebugMode, togglePopupMode , setConnectionTimeout} from 'bt-app/Redux/actions/DebugActions';
import { log , logPopup } from 'bt-app/Utils/logger';
import BTRegistrar from 'bt-app/BTService/Registrar'
import { TextInput } from "react-native-gesture-handler";
const DebugInterface = ({ internal, logs,navigation, ...other }) => {
  const [connectionTimeout, setconnectionTimeout] = useState(internal.connectionTimeout || 5000)
  const handleToggleDebugMode = (value) => {
    other.toggleDebugMode(value)
    log({ message: `Debug Mode: ${value ? "ON" : "OFF"}` })
  }
  const handleTogglePopupMode = (value) => {
    other.togglePopupMode(value)
    log({ message: `Popup Mode: ${value ? "ON" : "OFF"}` })
    logPopup(`Popup Mode: ${value ? "ON" : "OFF"}`)
    
  }
  const handleSetTimeout = () => {
    other.setConnectionTimeout(parseInt(connectionTimeout))
    Alert.alert("Saved")
    
  }

  handleTogglePopupMode
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={{
          color: "black",
          fontSize: 14
        }}>
          Turn on / off Log window
                </Text>
        <Switch
          onValueChange={handleToggleDebugMode}
          value={internal.isDebugMode} />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={{
          color: "black",
          fontSize: 14
        }}>
          Turn on / off debug exceptions
                </Text>
        <Switch
          onValueChange={handleTogglePopupMode}
          value={internal.isPopupMode} />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={{
          color: "black",
          fontSize: 14,
          width: 150,
          textAlign: "left",
        }}>
         Connection Timeout (ms)
        </Text>
        <TextInput keyboardType="number-pad" value={String(connectionTimeout)} style={{width: 100,backgroundColor: "#fff", textAlign: "center"}} onChangeText={val => setconnectionTimeout(val) } />
        <TouchableOpacity style={[styles.button, {backgroundColor: 'green'}]} onPress={handleSetTimeout}>
          <Text style={[styles.buttonText, ]} > Save </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customButtons}>

      </View>
      <BTRegistrar />
    </View>
  );

}

const styles = StyleSheet.create({
  customButtons:{
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "blue",
    marginHorizontal: 4,
    paddingVertical: 1
  },
  buttonText: {
    color: "#fff",
    fontSize: 10
  },
  container: {
    flex: 1,
    backgroundColor: "cyan",
    paddingVertical: 20, 
  },
  toggleContainer: {
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    backgroundColor: '#f9c2ff',
    marginVertical: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 14,
  },
});



const mapStateToProps = function ({ internal, logs }) {
  return {
    internal,
    logs
  }
}

export default connect(mapStateToProps, { toggleDebugMode , togglePopupMode , setConnectionTimeout})(DebugInterface);