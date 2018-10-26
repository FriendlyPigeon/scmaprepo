import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';

import { Segment, Input, Loader, Divider, Message, List, Button } from 'semantic-ui-react';

export default class MapperEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapper: null,
      error: null,
      successfulSubmit: false,
    }

    this.handleMapperNameChange = this.handleMapperNameChange.bind(this);

  }

  componentDidMount() {
    const { id } = this.props.match.params;

    fetch(`/api/mapper/${id}`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(mapper => {
        this.setState({
          mapper: mapper
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
  }

  handleMapperNameChange(event) {
    let mapperWithNewName = Object.assign({}, this.state.mapper);
    mapperWithNewName.name = event.target.value;

    this.setState({
      mapper: mapperWithNewName,
    })
  }

  handleMapperSubmit() {
    fetch(`/api/mapper/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.state.mapper.name,
      })
    })
    .then(response => response.json())
    .then((response) => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response =>
      this.setState({
        successfulSubmit: true,
      })
    )
    .catch(error =>
      this.setState({
        error: error,
      })  
    )
  }

  render() {
    const { error, mapper, successfulSubmit } = this.state;
    return(
      <Segment>
        {successfulSubmit && <Redirect to={`/mapper/${this.props.match.params.id}`} />}
        {error && <Message negative>{error}</Message>}
        {mapper ?
          <div>
            <Input
              onChange={this.handleMapperNameChange} 
              placeholder='Mapper name' 
              value={mapper.name} 
            />
            <Divider />
            <h2>Maps</h2>
            <List>
            {mapper.maps && mapper.maps.map((map, id) =>
              <List.Item>
                <List.Content>
                  <Link to={`/map/${mapper.map_ids[id]}`}>{map}</Link>
                </List.Content>
              </List.Item>
            )}
            </List>
            <Button onClick={this.handleMapperSubmit}>Submit</Button>
          </div>
        : <Loader>Loading mapper information</Loader>}
      </Segment>
    )
  }
}