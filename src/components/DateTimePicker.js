import React, { useState, memo, useEffect } from "react";
import DateTimePicker from "react-native-modal-datetime-picker";
export default memo((props) => {
    return <DateTimePicker {...props} />
})