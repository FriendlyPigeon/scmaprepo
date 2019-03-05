import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Message, Divider, Rating, Image } from 'semantic-ui-react';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maps: null,
      error: null,
    }
  }

  componentDidMount() {
    fetch('/api/maps/recent')
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
      <Segment inverted>
        {error && <Message negative>{error}</Message>}
        <h2>About</h2>
        <p style={{ fontSize: '18px' }}>
          Welcome to maprepo.org! A site for hosting and discussing maps
          for the sven co-op game.
        </p>

        <Divider />

        <h2>News</h2>
        <p style={{ fontSize: '18px' }}>
          Follow development of maprepo.org on the Trello located <a href='https://trello.com/b/AFaCXuMw/maprepoorg'>here</a>.
        </p>

        <Divider />

        <h2>Recent maps</h2>
        {maps ?
        maps.map((map) => {
          return <div>
            <h3>
              <Link to={`/map/${map.id}`}>{map.name}</Link>
              <Rating 
                icon='star'
                defaultRating={map.average_rating}
                maxRating={10}
                disabled
              />
              <Image src={map.thumbnail_url} size='small' />
            </h3>
          </div>
        })
        :
        <p>Loading maps</p>}
      </Segment>
    )
  }
}