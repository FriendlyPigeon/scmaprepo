import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { Form, Input, Message, Button, Segment } from 'semantic-ui-react';

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
    const { username, email } = this.state;

    fetch('/api/users/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
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
    const { username, email, registered, errors } = this.state;
    return(
      <Segment inverted>
        <Form onSubmit={this.handleSubmit}>
          {registered && <Redirect to='/maps' />}
          {errors &&
            errors.map((error) =>
              <Message negative key={error.msg}>{error.msg}</Message>)
          }
          <Form.Group>
            <Form.Field>
              <label style={{ color: "#E9E9E9" }}>Username</label>
              <input 
                name="username"
                label="Username"
                value={username}
                onChange={this.onFieldChange}
              >
              </input>
            </Form.Field>
            <Form.Field>
              <label style={{ color: "#E9E9E9" }}>Email</label>
              <input
                name="email"
                label="Email"
                autoComplete="off"
                value={email}
                onChange={this.onFieldChange}
              >
              </input>
            </Form.Field>
          </Form.Group>
          <Button primary type="submit">Create account</Button>
        </Form>
      </Segment>
    )
  }
}