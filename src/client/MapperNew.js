import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';

import { Segment, Input, Divider, Message, Button } from 'semantic-ui-react';

export default class MapperNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      successfulSubmit: false,
      mapperName: '',
      steamUrlName: '',
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleMapperSubmit = this.handleMapperSubmit.bind(this);
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleMapperSubmit() {
    const { mapperName, steamUrlName } = this.state;

    fetch('/api/mapper', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: mapperName,
        vanityurl: steamUrlName,
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
    const { error, successfulSubmit, mapperName, steamUrlName } = this.state;
    return(
      <Segment inverted>
        {error && <Message negative>{error}</Message>}
        {successfulSubmit && <Redirect to={'/mappers'} />}
        <div>
          <h3>Mapper name</h3>
          <Input
            name='mapperName'
            value={mapperName}
            onChange={this.handleFieldChange}
          ></Input>
          <Divider />
          <Message className='black'>
            <Message.Header>Hint</Message.Header>
            <p>
              Associate a mapper to a steam profile by entering
              the last part of the steam users profile URL after /id/
            </p>
          </Message>
          <Input
            label='https://steamcommunity.com/id/'
            placeholder='Steam profile URL name'
            name='steamUrlName'
            value={steamUrlName}
            onChange={this.handleFieldChange}
          >
          </Input>

          <Button primary style={{ display: 'block' }} onClick={this.handleMapperSubmit}>Submit</Button>
        </div>
      </Segment>
    )
  }
}