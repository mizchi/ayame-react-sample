import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  #app {
    text-align: center;
  }
  body {
    background-color: #333;
    color: #fff;
    font-family: "Roboto", "Open Sans", "Lucida Grande", sans-serif;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }
`;

ReactDOM.render(
  <>
    <GlobalStyle />
    <App />
  </>,
  document.getElementById("root")
);
