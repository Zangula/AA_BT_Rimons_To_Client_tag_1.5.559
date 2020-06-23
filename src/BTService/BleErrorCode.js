export default BleErrorCode = {
    // Implementation specific errors ------------------------------------------------------------------------------------
    /**
     * This error can be thrown when unexpected error occurred and in most cases it is related to implementation bug.
     * Original message is available in {@link #bleerrorreason|reason} property.
     */
    UnknownError: 0,
    /**
     * Current promise failed to finish due to BleManager shutdown. It means that user called
     * {@link #blemanagerdestroy|manager.destroy()} function before all operations completed.
     */
    BluetoothManagerDestroyed: 1,
    /**
     * Promise was explicitly cancelled by a user with {@link #blemanagercanceltransaction|manager.cancelTransaction()}
     * function call.
     */
    OperationCancelled: 2,
    /**
     * Operation timed out and was cancelled.
     */
    OperationTimedOut: 3,
    /**
     * Native module couldn't start operation due to internal state, which doesn't allow to do that.
     */
    OperationStartFailed: 4,
    /**
     * Invalid UUIDs or IDs were passed to API call.
     */
    InvalidIdentifiers: 5,
  
    // Bluetooth global states -------------------------------------------------------------------------------------------
    /**
     * Bluetooth is not supported for this particular device. It may happen on iOS simulator for example.
     */
    BluetoothUnsupported: 100,
    /**
     * There are no granted permissions which allow to use BLE functionality. On Android it may require
     * android.permission.ACCESS_COARSE_LOCATION permission or android.permission.ACCESS_FINE_LOCATION permission.
     */
    BluetoothUnauthorized: 101,
    /**
     * BLE is powered off on device. All previous operations and their state is invalidated.
     */
    BluetoothPoweredOff: 102,
    /**
     * BLE stack is in unspecified state.
     */
    BluetoothInUnknownState: 103,
    /**
     * BLE stack is resetting.
     */
    BluetoothResetting: 104,
    /**
     * BLE state change failed.
     */
    BluetoothStateChangeFailed: 105,
  
    // Peripheral errors. ------------------------------------------------------------------------------------------------
    /**
     * Couldn't connect to specified device.
     */
    DeviceConnectionFailed: 200,
    /**
     * Device was disconnected.
     */
    DeviceDisconnected: 201,
    /**
     * Couldn't read RSSI from device.
     */
    DeviceRSSIReadFailed: 202,
    /**
     * Device is already connected. It is not allowed to connect twice to the same device.
     */
    DeviceAlreadyConnected: 203,
    /**
     * Couldn't find device with specified ID.
     */
    DeviceNotFound: 204,
    /**
     * Operation failed because device has to be connected to perform it.
     */
    DeviceNotConnected: 205,
    /**
     * Device could not change MTU value.
     */
    DeviceMTUChangeFailed: 206,
  
    // Services ----------------------------------------------------------------------------------------------------------
    /**
     * Couldn't discover services for specified device.
     */
    ServicesDiscoveryFailed: 300,
    /**
     * Couldn't discover included services for specified service.
     */
    IncludedServicesDiscoveryFailed: 301,
    /**
     * Service with specified ID or UUID couldn't be found. User may need to call
     * {@link #blemanagerdiscoverallservicesandcharacteristicsfordevice|manager.discoverAllServicesAndCharacteristicsForDevice}
     * to cache them.
     */
    ServiceNotFound: 302,
    /**
     * Services were not discovered. User may need to call
     * {@link #blemanagerdiscoverallservicesandcharacteristicsfordevice|manager.discoverAllServicesAndCharacteristicsForDevice}
     * to cache them.
     */
    ServicesNotDiscovered: 303,
  
    // Characteristics ---------------------------------------------------------------------------------------------------
    /**
     * Couldn't discover characteristics for specified service.
     */
    CharacteristicsDiscoveryFailed: 400,
    /**
     * Couldn't write to specified characteristic. Make sure that
     * {@link #characteristiciswritablewithresponse|characteristic.isWritableWithResponse}
     * or {@link #characteristiciswritablewithoutresponse|characteristic.isWritableWithoutResponse} is set to true.
     */
    CharacteristicWriteFailed: 401,
    /**
     * Couldn't read from specified characteristic. Make sure that
     * {@link #characteristicisreadable|characteristic.isReadable} is set to true.
     */
    CharacteristicReadFailed: 402,
    /**
     * Couldn't set notification or indication for specified characteristic. Make sure that
     * {@link #characteristicisnotifiable|characteristic.isNotifiable} or
     * {@link #characteristicisindicatable|characteristic.isIndicatable} is set to true.
     */
    CharacteristicNotifyChangeFailed: 403,
    /**
     * Characteristic with specified ID or UUID couldn't be found. User may need to call
     * {@link #blemanagerdiscoverallservicesandcharacteristicsfordevice|manager.discoverAllServicesAndCharacteristicsForDevice}
     * to cache them.
     */
    CharacteristicNotFound: 404,
    /**
     * Characteristic were not discovered for specified service. User may need to call
     * {@link #blemanagerdiscoverallservicesandcharacteristicsfordevice|manager.discoverAllServicesAndCharacteristicsForDevice}
     * to cache them.
     */
    CharacteristicsNotDiscovered: 405,
    /**
     * Invalid Base64 format was passed to characteristic API function call.
     */
    CharacteristicInvalidDataFormat: 406,
  
    // Characteristics ---------------------------------------------------------------------------------------------------
    /**
     * Couldn't discover descriptor for specified characteristic.
     */
    DescriptorsDiscoveryFailed: 500,
    /**
     * Couldn't write to specified descriptor.
     */
    DescriptorWriteFailed: 501,
    /**
     * Couldn't read from specified descriptor.
     */
    DescriptorReadFailed: 502,
    /**
     * Couldn't find specified descriptor.
     */
    DescriptorNotFound: 503,
    /**
     * Descriptors are not discovered for specified characteristic.
     */
    DescriptorsNotDiscovered: 504,
    /**
     * Invalid Base64 format was passed to descriptor API function call.
     */
    DescriptorInvalidDataFormat: 505,
    /**
     * Issued a write to a descriptor, which is handled by OS.
     */
    DescriptorWriteNotAllowed: 506,
  
    // Scanning errors ---------------------------------------------------------------------------------------------------
    /**
     * Cannot start scanning operation.
     */
    ScanStartFailed: 600,
    /**
     * Location services are disabled.
     */
    LocationServicesDisabled: 601
  }