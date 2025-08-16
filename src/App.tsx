import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Theme } from '@chakra-ui/react';
import { system } from './theme';
import { HomePage } from './components/HomePage';
import { PinyinMode } from './components/PinyinMode';
import { ChineseMode } from './components/ChineseMode';
import './App.css';

function App() {
  return (
    <ChakraProvider value={system}>
      <Theme appearance="dark">
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/pinyin" element={<PinyinMode />} />
              <Route path="/game/chinese" element={<ChineseMode />} />
            </Routes>
          </div>
        </Router>
      </Theme>
    </ChakraProvider>
  );
}

export default App;
