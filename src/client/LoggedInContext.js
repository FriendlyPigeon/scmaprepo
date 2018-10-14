import React, { Component } from 'react';

const LoggedInContext = React.createContext(
  {
  }
);

export default LoggedInContext;

/* export class LoggedInProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      logInError: null,
    }
  }

  render() {
    return(
      <LoggedInContext.Provider value={{
        loggedIn: this.state.loggedIn,
        logInError: this.state.logInError,
      }}>
        {this.props.children}
      </LoggedInContext.Provider>
    )
  }
} */