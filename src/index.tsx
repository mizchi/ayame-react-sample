import React from "react";
import ReactDOM from "react-dom";
import P2PSimple from "./components/P2PSimple";
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
    <P2PSimple title="Ayame React Sample" />
  </>,
  document.getElementById("root")
);
