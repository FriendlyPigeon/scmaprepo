import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';

import { Segment, Input, Divider, Message, Button } from 'semantic-ui-react';

export default class TagNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      successfulSubmit: false,
      tagName: '',
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleTagSubmit = this.handleTagSubmit.bind(this);
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }
  
  handleTagSubmit() {
    const { tagName } = this.state;

    fetch('/api/tag', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tagName,
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response => {
      this.setState({
        successfulSubmit: true,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }
  
  render() {
    const { error, successfulSubmit, tagName } = this.state;
    return(
      <Segment inverted>
        {error && <Message negative>{error}</Message>}
        {successfulSubmit && <Redirect to={'/tags'} />}
        <div>
          <h3>Tag name</h3>
          <Input
            name='tagName'
            value={tagName}
            onChange={this.handleFieldChange}
          ></Input>

          <Button primary style={{ display: 'block' }} onClick={this.handleTagSubmit}>Submit</Button>
        </div>
      </Segment>
    )
  }
}