import {combineReducers} from 'redux';
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {createBrowserHistory} from 'history';
import {connectRouter} from 'connected-react-router';
import User from './modules/user';
import Image from './modules/image';

export const history = createBrowserHistory();

const rootReducer = combineReducers({
    user: User,
    image: Image,
    router: connectRouter(history),

});

const {logger} = require('redux-logger');

let store = configureStore({
  reducer:rootReducer,
  middleware:[...getDefaultMiddleware(), logger],
  devTools: process.env.NODE_ENV !== 'production'
})



export default store;