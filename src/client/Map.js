import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Loader, Divider, Message, List } from 'semantic-ui-react';

import MapComments from './MapComments';
import MapScreenshots from './MapScreenshots';

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapId: null,
      map: null,
      comments: null,
      error: null,
    }
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
        this.setState({
          mapId: id,
          map: map
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
      .then(() =>
        fetch(`/api/map/${id}/comments`)
          .then(response => response.json())
          .then(response => {
            if(!response.error) { return response }
            else { throw response }
          })
          .then(comments => {
            this.setState({
              comments: comments
            })
          })
          .catch(error => {
            this.setState({
              error: error.error,
            })
          })
      )
  }

  render() {
    const { error, mapId, map, comments } = this.state;
    return(
      <Segment>
 
      {error && <Message negative>{error}</Message>}
      {map && comments ?
        <div>
          <h2>{map.name}</h2>
          <Link 
            style={{ float: 'right' }} 
            to={`/map/${mapId}/edit`}
          >Edit</Link>
          <Divider />
          <h3>Authors</h3>
          <List>
          {map.authors && map.authors.map((author, id) =>
            <List.Item key={id}>
              <List.Content>
                <Link to={`/mapper/${map.mapper_ids[id]}`}>{author}</Link>
              </List.Content>
            </List.Item>
          )}
          </List>
          <h3>Description</h3>
            <Segment>
              Test description
            </Segment>
          <h3>Screenshots</h3>
          <a>
            Upload a new screenshot
          </a>
          <h3>Comments</h3>
          <MapComments mapId={mapId} comments={comments} />
        </div>
        : <Loader>Loading map information</Loader>}
      </Segment>
    )
  }
}