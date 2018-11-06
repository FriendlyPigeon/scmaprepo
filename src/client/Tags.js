import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Message, Divider, Loader } from 'semantic-ui-react';

export default class Tags extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: null,
      error: null,
    }
  }

  componentDidMount() {
    fetch('/api/tags')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(tags => {
        this.setState({
          tags: tags
        })
      })
      .catch(error => {
        this.setState({
          error: error.error
        })
      })
  }

  render() {
    const { tags, error } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        <h3>
          <Link to='/tag/new'>New tag</Link>
        </h3>
        <Divider section />
        {tags ?
        tags.map((tag) =>
          <h3 key={tag.id}>
            <Link to={`/maps?tag=${tag.name}`}>{tag.name}</Link>
            <Divider section />
          </h3>) 
        : <Loader>Loading maps</Loader>}
      </Segment>
    )
  }
}