import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';

import { Segment, Divider, Dropdown, Button, Input, TextArea, Form, Message } from 'semantic-ui-react';

export default class MapNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successfulSubmit: false,
      mapName: '',
      mapDescription: '',
      allMappers: null,
      allTags: null,
      newMappers: [],
      newTags: [],
      error: null,
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleMapperDropdownChange = this.handleMapperDropdownChange.bind(this);
    this.handleTagDropdownChange = this.handleTagDropdownChange.bind(this);
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

    fetch('/api/tags/dropdown')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(tags => {
        this.setState({
          allTags: tags,
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
    const { mapName, mapDescription, newMappers, newTags } = this.state;

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
        tags: newTags,
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

  handleMapperDropdownChange(event, data) {
    this.setState({
      newMappers: data.value,
    })
  }

  handleTagDropdownChange(event, data) {
    this.setState({
      newTags: data.value,
    })
  }

  render() {
    const { successfulSubmit, mapName, error, mapDescription, allMappers, allTags, newMappers, newTags } = this.state;
    return(
      <Segment inverted>
        {error && <Message negative>{error}</Message>}
        {successfulSubmit && <Redirect to={'/maps'} />}
        <div>
          <Form>
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
          <h3>Tags</h3>
            <Dropdown
              multiple
              value={newTags}
              onChange={this.handleTagDropdownChange}
              placeholder='Tag'
              search
              selection
              options={allTags}
            />
          <h3>Description</h3>
          
            <TextArea 
            autoHeight 
            rows={5}
            name='mapDescription'
            placeholder='Map description'
            value={mapDescription}
            onChange={this.handleFieldChange}
            />
          </Form>
          
          <Button primary style={{ display: 'block' }} onClick={this.handleMapSubmit}>Submit</Button>
        </div>
      </Segment>
    )
  }
}