import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';

import { Segment, Divider, Dropdown, Button, Input, Message } from 'semantic-ui-react';

export default class MapNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successfulSubmit: false,
      mapName: '',
      mapDescription: '',
      allMappers: null,
      newMappers: [],
      error: null,
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleMapperDropdownChange = this.handleMapperDropdownChange.bind(this);
    this.handleMapSubmit = this.handleMapSubmit.bind(this);
  }

  componentDidMount() {
    fetch('/api/mappers/dropdown')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(mappers => {
        this.setState({
          allMappers: mappers,
        })
      })
      .catch(error => {
        this.setState({
          error: error,
        })
      })
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleMapSubmit() {
    const { mapName, mapDescription, newMappers } = this.state;

    fetch('/api/map', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: mapName,
        description: mapDescription,
        authors: newMappers,
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
      console.log(error)
      this.setState({
        error: error.error,
      })  
    })
  }

  handleMapperDropdownChange(event, data) {
    this.setState({
      newMappers: data.value,
    })
  }

  render() {
    const { successfulSubmit, mapName, error, mapDescription, allMappers, newMappers } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        {successfulSubmit && <Redirect to={'/maps'} />}
        <div>
          <h3>Map name</h3>
          <Input
            name='mapName'
            value={mapName}
            onChange={this.handleFieldChange}
          ></Input>
          <Divider />
          <h3>Authors</h3>
          {allMappers &&
          <Dropdown
            multiple
            value={newMappers} 
            onChange={this.handleMapperDropdownChange} 
            placeholder='Mapper' 
            search 
            selection 
            options={allMappers} 
          />
          }
          <h3>Description</h3>
          <Segment>
            <Input
              name='mapDescription'
              onChange={this.handleFieldChange}
              placeholder='Map description' 
              value={mapDescription} 
            />
          </Segment>
          <h3>Screenshots</h3>
          <a style={{ display: 'block' }}>
            Upload a new screenshot
          </a>
          <Button onClick={this.handleMapSubmit}>Submit</Button>
        </div>
      </Segment>
    )
  }
}