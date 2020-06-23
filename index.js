/**
 * @format
 */
import React from 'react'
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// persist
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

// Imports: Redux Persist Persister
import { store, persistor } from './src/Redux/store';

const MyApp: () => React$Node = () => {
    return (
        <>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>

        </>
    );
};


AppRegistry.registerComponent(appName, () => MyApp);
