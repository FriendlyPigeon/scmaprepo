import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';

import { Segment, Loader, Divider, Message, List, Dropdown, Button } from 'semantic-ui-react';

export default class MapEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successfulSubmit: false,
      map: null,
      allMappers: null,
      newMappers: [],
      error: null,
    }

    this.handleMapperDropdownChange = this.handleMapperDropdownChange.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleMapSubmit = this.handleMapSubmit.bind(this);
  }

  handleMapperDropdownChange(event, data) {
    console.log(data.value, data.text);
    this.setState({
      newMappers: data.value,
    })
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    fetch(`/api/map/${id}`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(map => {
        console.log('reached map')
        this.setState({
          map: map
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
      .then(() =>
        fetch('/api/mappers/dropdown')
          .then(response => response.json())
          .then(response => {
            if(!response.error) { return response }
            else { throw response }
          })
          .then(mappers => {
            console.log('reached mappers')
            this.setState({
              allMappers: mappers,
              newMappers: this.state.map.mapper_ids,
            })
          })
          .catch(error => {
            this.setState({
              error: error,
            })
          })
      )
  }

  handleMapSubmit() {
    const { id } = this.props.match.params;
    const { newMappers } = this.state;

    fetch(`/api/map/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authors: newMappers,
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
    const { successfulSubmit, map, error, allMappers, newMappers } = this.state;
    return(
      <Segment>
        {successfulSubmit && <Redirect to={`/map/${this.props.match.params.id}`} />}
        {map && allMappers ?
          <div>
            <h2>{map.name}</h2>
            <Divider />
            <h3>Authors</h3>
            <List>
              <List.Item>
                <List.Content>
                  <Dropdown
                    multiple
                    value={newMappers} 
                    onChange={this.handleMapperDropdownChange} 
                    placeholder='Mapper' 
                    search 
                    selection 
                    options={allMappers} 
                  />
                </List.Content>
              </List.Item>
            </List>
            <h3>Description</h3>
              <Segment>
                Test description
              </Segment>
            <h3>Screenshots</h3>
            <a style={{ display: 'block' }}>
              Upload a new screenshot
            </a>
            <Button onClick={this.handleMapSubmit}>Submit</Button>
          </div>
        : <Loader>Loading map information</Loader>}
      </Segment>
    )
  }
}