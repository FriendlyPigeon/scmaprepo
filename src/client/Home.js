import React, { Component } from 'react';

import { Segment, Divider } from 'semantic-ui-react';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  render() {
    return(
      <Segment inverted>
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
      </Segment>
    )
  }
}