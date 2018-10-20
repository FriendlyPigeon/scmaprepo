import React, { Component } from 'react';

import { Button, Icon } from 'semantic-ui-react';

import LoggedInContext from './LoggedInContext';
import Navbar from './Navbar';
import Main from './Main';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      loggedInUser: null,
      logInError: null,
    }
    
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    fetch('/api/users/heartbeat', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then((response) => {
      if(!response.error) { 
        if(response.authenticated === true) {
          this.setState({
            loggedIn: true,
            loggedInUser: response.steamid,
            logInError: null,
          })
        } else {
          this.setState({
            loggedIn: false,
            loggedInUser: null,
            logInError: null,
          })
        }
      }
      else { throw response }
    })
    .catch(error => 
      this.setState({
        logInError: error.error,
      })
    )
  }

  handleLogout() {
    fetch('/api/users/logout', {
      method: 'GET',
    })
    .then((response) => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response =>
      this.setState({
        loggedIn: false,
        loggedInUser: null,
      })
    )
    .catch(error => 
      console.log(error)
    )
  }
  
  render() {
    return(
      <div>
        <LoggedInContext.Provider value={{
          loggedIn: this.state.loggedIn,
          loggedInUser: this.state.loggedInUser,
          logInError: this.state.logInError,
          handleLogout: this.handleLogout,
        }}>
          <Navbar />
          <Main />
        </LoggedInContext.Provider>
      </div>
    )
  }
}