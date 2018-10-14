import React, { Component } from 'react';

import { Form, TextArea, Segment, Divider, Message, Button } from 'semantic-ui-react';

import MapComment from './MapComment';

export default class MapComments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapId: null,
      mapComments: null,
      newComment: '',
      error: null,
      openReply: null,
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleReplyOpen = this.handleReplyOpen.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handleCommentDelete = this.handleCommentDelete.bind(this);
  }

  componentDidMount() {
    if(this.props.comments) {
      this.setState({
        mapId: this.props.mapId,
        mapComments: this.props.comments,
      })
    }
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleReplyOpen(commentId, event) {
    event.preventDefault();

    this.setState({
      openReply: commentId,
    })
  }

  handleCommentSubmit(replyToId, newComment) {
    const { mapId } = this.state;

    fetch(`/api/map/${mapId}/comments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: newComment,
        reply_to_id: replyToId,
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(comments => {
      console.log(comments)
      this.setState({
        mapComments: comments,
        openReply: null,
        newComment: '',
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }
  
  handleCommentDelete(commentId, event) {
    event.preventDefault();

    fetch(`/api/map/${this.state.mapId}/comments`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment_id: commentId
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(comments => {
      console.log(comments)
      this.setState({
        mapComments: comments,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }

  render() {
    const { error, mapId, mapComments, openReply, newComment } = this.state;
    return (
      <div>
      {error &&
        <Message negative>{error}</Message>
      }
      <Form onSubmit={() => this.handleCommentSubmit(null, newComment)}>
        <TextArea 
          autoHeight 
          rows={5}
          name='newComment'
          value={newComment}
          onChange={this.handleFieldChange}
        />
        <Button>Submit</Button>
        <Divider></Divider>
      </Form>
      <Segment.Group>
        {mapComments && mapId &&
        mapComments.map((comment) =>
          <MapComment key={comment.comment_id} mapId={mapId} comment={comment} openReply={openReply} onReplyOpen={this.handleReplyOpen} onCommentSubmit={this.handleCommentSubmit} onCommentDelete={this.handleCommentDelete} />
        )}
      </Segment.Group>
      </div>
    )
  }
}