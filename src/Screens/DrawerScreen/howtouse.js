
import React, {Component} from 'react';
import {View} from "react-native"
import {WebView} from 'react-native-webview';

export default class Howtouse extends Component {
  render() {
    return (
     
      <WebView source={{ uri:'https://www.youtube.com/results?search_query=galcon+irrigation+controller' }} />
  
    
    );
  }
}