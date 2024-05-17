
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import { createEpicMiddleware, ofType } from "redux-observable";
import { delay, map } from "rxjs/operators";
import uuid from "uuidv4";
import faker from "faker";
import "./index.css";
import App from "./App";

/** generate whole number inclusive */
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createRandomImage = () => {
  const width = getRandomInt(100, 1920);
  const height = getRandomInt(100, 1080);
  return `https://source.unsplash.com/random/${width}x${height}`;
}


const createItems = (numberToCreate = 30) => {
  const randomNum = getRandomInt(0, 1);

  const newItems = Array.from({ length: numberToCreate }, (v, k) => {
    const newId = uuid().toString() + (Math.random() * 100).toString();
    const hasImg = getRandomInt(0, 1) === 1;
    const newImg = hasImg ? createRandomImage() : null;
    return {
      id: newId,
      title: `title-${newId}`,
      img: newImg,
      description: randomNum ? faker.lorem.sentences() : faker.lorem.sentence()
    };
  });

  return newItems;
};

const initialState = [];

const items = (state = initialState, action) => {
  switch (action.type) {
    case "MORE_LOADED":
      return [...state, ...action.payload.items];
    default:
      return state;
  }
};

//if needed, don't load more until previous fetch request completed
const isFetching = (state = false, action) => {
  switch (action.type) {
    case "LOAD_MORE":
      return true;
    case "MORE_LOADED":
      return false;
    default:
      return state;
  }
};

const rootEpic = action$ =>
  action$.pipe(
    ofType("LOAD_MORE"),
    delay(Math.floor(Math.random() * 301 + 200)), // Asynchronously wait then continue
    //use switchmap/mergemap - in real world scenario, could use observable.ajax that is cancelable
    map(action => {
      return {
        type: "MORE_LOADED",
        payload: {
          items: createItems()
        }
      };
    })
  );

//to use with Chrome redux dev tool
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const epicMiddleware = createEpicMiddleware();

const store = createStore(
  combineReducers({ items, isFetching }),
  {}, //initial state
  composeEnhancers(applyMiddleware(epicMiddleware))
);

epicMiddleware.run(rootEpic);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();