import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Loader, Dimmer, Divider, Message } from 'semantic-ui-react';

export default class Maps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maps: null,
      error: null,
    }
  }

  componentDidMount() {
    fetch('/api/maps')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(maps => {
        this.setState({
          maps: maps
        })
      })
      .catch(error => {
        this.setState({
          error: error.error
        })
      })
  }
  
  render() {
    const { maps, error } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        <h3>
          <Link to='/add-map'>New map</Link>
        </h3>
        <Divider section />
        {maps ?
        maps.map((map) =>
          <h3 key={map.id}>
            <Link to={`/map/${map.id}`}>{map.name}</Link>
            <Divider section />
          </h3>) 
        : <Loader>Loading maps</Loader>}
      </Segment>
    )
  }
}