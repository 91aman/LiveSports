/**
 * Created by amanjain on 14/04/16 at 3:12 PM.
 * Description :
 */


import React from 'react';
import ReactDOM from 'react-dom'
import LiveSports from './LiveSports.jsx'
import _ from "lodash"
import styles from "../css/main.scss"


var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();
ReactDOM.render(<LiveSports />, document.getElementById('app'));
