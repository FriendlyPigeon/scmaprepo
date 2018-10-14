import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { Form, Message, Button } from 'semantic-ui-react';

export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      password2: '',
      errors: null,
      registered: false,
    }

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCreatedUser = this.handleCreatedUser.bind(this);
  }

  onFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCreatedUser() {
    this.setState({
      registered: true,
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    const { username, email, password, password2 } = this.state;

    fetch('/api/users/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        password2: password2
      })
    })
      .then(response => response.json())
      .then((response) => {
          if(!response.errors) { return response }
          else { throw response }
        })
      .then(response => 
        this.handleCreatedUser()
      )
      .catch(errors =>
        this.setState({ 
          errors: errors.errors,
        })
      )
  }

  render() {
    const { username, email, password, password2, registered, errors } = this.state;
    if(registered) {
      return <Redirect to={{
        pathname: '/login',
        state: {
          email: email
        }
      }}/>
    }
    return(
        <Form onSubmit={this.handleSubmit}>
          {errors &&
            errors.map((error) =>
              <Message negative key={error.msg}>{error.msg}</Message>)
          }
          <Form.Group>
          <Form.Input
            name="username"
            label="Username"
            value={username}
            onChange={this.onFieldChange}
          />
          <Form.Input
            name="email"
            label="Email"
            autoComplete="off"
            value={email}
            onChange={this.onFieldChange}
          />
          <Form.Input 
            name="password"
            label="Password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={this.onFieldChange}
          />
          <Form.Input 
            name="password2"
            label="Confirm password"
            type="password"
            value={password2}
            onChange={this.onFieldChange}
          />
          </Form.Group>

          <Button type="submit">Create account</Button>
        </Form>
    )
  }
}