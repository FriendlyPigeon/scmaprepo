import React, { Component } from 'react';

import { Form, Message, Button } from 'semantic-ui-react';

import LoggedInContext from './LoggedInContext';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: this.props.location.state && this.props.location.state.email
        || '',
      password: '',
      error: null,
    }

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { email, password } = this.state;

    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      })
    })
    .then(response => response.json())
    .then((response) => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(responseJson =>
      this.props.loggedIn = true
    )
    .catch(error => 
      this.setState({ 
        error: error.error,
      })
    )
  }

  render() {
    const { email, password, error } = this.state;
    return(
      <LoggedInContext.Consumer>
        {({ handleLogin, logInError }) =>
        <Form onSubmit={(event) => handleLogin(event, email, password)}>
          {logInError &&
          <Message negative>{logInError}</Message>
          }
          <Form.Group>
            <Form.Input 
              name="email"
              label="Email"
              value={email}
              onChange={this.onFieldChange}
            />
            <Form.Input 
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={this.onFieldChange}
            />
          </Form.Group>
          <Button type="submit">Login</Button>
        </Form>
        }
      </LoggedInContext.Consumer>
    )
  }
}