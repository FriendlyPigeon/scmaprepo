import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Loader, Divider, Message } from 'semantic-ui-react';

export default class Mappers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mappers: null,
      error: null,
    }
  }

  componentDidMount() {
    fetch('/api/mappers')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(mappers => {
        this.setState({
          mappers: mappers
        })
      })
      .catch(error => {
        this.setState({
          error: error.error
        })
      })
  }

  render() {
    const { mappers, error } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        <h3>
          <Link to='/mapper/new'>New mapper</Link>
        </h3>
        <Divider section />
        {mappers ?
        mappers.map((mapper) =>
          <h3 key={mapper.id}>
            <Link to={`/mapper/${mapper.id}`}>{mapper.name}</Link>
            <Divider section />
          </h3>) 
        : <Loader>Loading mappers</Loader>}
      </Segment>
    )
  }
}