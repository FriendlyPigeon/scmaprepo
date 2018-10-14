import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import LoggedInContext from './LoggedInContext';

export default class Logout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    }
  }

  componentDidMount() {
  }

  render() {
    return(
      <LoggedInContext.Consumer>
        {({ handleLogout }) =>
          handleLogout()
        }
      </LoggedInContext.Consumer>
    )
  }
}