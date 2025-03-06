import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Game from './components/Game/Game';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>Match-3 Game</h1>
        <Game />
      </div>
    </Provider>
  );
}

export default App;
