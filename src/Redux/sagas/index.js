import createSagaMiddleware from 'redux-saga';
import {bleSaga} from '../../BTService/Saga';

export const sagaMiddleware = createSagaMiddleware();

export const register =(middleware)=>{
    middleware.run(bleSaga);
}