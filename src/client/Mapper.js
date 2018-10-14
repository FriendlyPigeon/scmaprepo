import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Loader, Divider, Message, List } from 'semantic-ui-react';

export default class Mapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapper: null,
      error: null,
    }
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

  render() {
    const { error, mapper } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        {mapper ?
          <div>
            <h2>{mapper.name}</h2>
            <Divider />
            <h2>Maps</h2>
            <List>
            {mapper.maps.map((map, id) =>
              <List.Item>
                <List.Content>
                  <Link to={`/map/${mapper.map_ids[id]}`}>{map}</Link>
                </List.Content>
              </List.Item>
            )}
            </List>
          </div>
        : <Loader>Loading mapper information</Loader>}
      </Segment>
    )
  }
}