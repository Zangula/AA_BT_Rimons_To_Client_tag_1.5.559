import React, { useState, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Clipboard
} from 'react-native';
import { connect } from 'react-redux';
import { log, clearDebugLog } from 'bt-app/Utils/logger';
import { GlobalColor } from 'bt-app/GlobalConstants'
function ItemPureFunctional({ formatLog, item, onSelect }) {
  const { id, message, data, selected } = item;
  return useMemo(() => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(id)}
        style={[
          styles.item,
          { backgroundColor: selected ? '#bbb' : '#f9c2ff' },
        ]}>
        <Text style={styles.message}>{String(message)}</Text>
        {formatLog == true && data &&
          <Text style={styles.message} > { `${JSON.stringify(data, undefined, 2)}`}</Text>
        }
      </TouchableOpacity>
    );
  }, [selected,formatLog]);
}



const DebugBox = ({ logs, internal, peripherals }) => {
  const [formatLog, setFormatLog] = useState(false)

  const onSelect = useRef(id => {

  });

  const handleCopyClipboard = async () => {
    Clipboard.setString(JSON.stringify(logs.data))
    log({ message: "Copied to clipboard" })
  }
  const handleCopyStore = async () => {
    Clipboard.setString(JSON.stringify(peripherals))
    log({ message: "Store Copied to clipboard" })
  }
  
  const handleClearDebugLog = async () => {
    clearDebugLog()
  }

  if (!internal.isDebugMode) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 8 }}> Turn this on/off from menu -> Debug Mode</Text>
      </View>
      <View style={styles.flatListContainer}>
        <FlatList
          extraData={formatLog}
          removeClippedSubviews={true}
          data={logs.data}
          renderItem={({ item }) => (
            <ItemPureFunctional item={item} formatLog={formatLog} onSelect={onSelect.current} />
          )}
          keyExtractor={item => String(item.id) }
        />
      </View>
      <View style={styles.bottomBar}>
      
        <TouchableOpacity style={[styles.button, {backgroundColor: formatLog ? 'green' : "#ccc"}]} onPress={()=> setFormatLog(!formatLog)}>
          <Text style={[styles.buttonText, ]} > Pretty Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCopyStore}>
          <Text style={styles.buttonText} > Copy Store </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCopyClipboard}>
          <Text style={styles.buttonText} > Copy Log </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearDebugLog}>
          <Text style={styles.buttonText}> Clear Log </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    borderTopColor: "#000",
    borderTopWidth: StyleSheet.hairlineWidth * 3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#ddd",
    paddingVertical: 2
  },
  flatListContainer: {
    marginTop: 8,
    marginBottom: 20,
    flex: 1,
  },
  header: {
    marginTop: 2,
  },
  item: {
    backgroundColor: '#f9c2ff',
    marginVertical: 1,
    paddingHorizontal: 8,
  },
  message: {
    fontSize: 14,
  },
  button: {
    backgroundColor: "blue",
    marginHorizontal: 4,
    paddingVertical: 1
  },
  buttonText: {
    color: "#fff",
    fontSize: 10
  }
});



const mapStateToProps = function ({ internal, logs, peripherals }) {
  return {
    internal,
    logs,
    peripherals,
  }
}

export default connect(mapStateToProps)(DebugBox);