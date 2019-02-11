import React, { Component } from 'react';

import { Form, Comment, Divider, Message, Button } from 'semantic-ui-react';

import MapComment from './MapComment';

import DraftEditor from './DraftEditor';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

export default class MapComments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapId: null,
      mapComments: null,
      newCommentState: EditorState.createEmpty(),
      error: null,
      openReply: null,
      openEdit: null,
      openEditState: EditorState.createEmpty(),
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleReplyOpen = this.handleReplyOpen.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handleEditOpen = this.handleEditOpen.bind(this);
    this.handleCommentEdit = this.handleCommentEdit.bind(this);
    this.handleCommentEditSubmit = this.handleCommentEditSubmit.bind(this);
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

  handleCommentChange(newCommentState) {
    this.setState({
      newCommentState: newCommentState,
    })
  }

  handleCommentSubmit(replyToId, newComment) {
    const { mapId } = this.state;
    const rawComment = convertToRaw(newComment.getCurrentContent());

    fetch(`/api/map/${mapId}/comments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: rawComment,
        reply_to_id: replyToId,
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(comments => {
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

  handleEditOpen(commentId, event) {
    event.preventDefault();

    this.setState({
      openEdit: commentId,
      openEditState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.state.mapComments.filter(comment => comment.comment_id === commentId)[0].comment))),
    })
  }

  handleCommentEdit(editCommentState) {
    this.setState({
      openEditState: editCommentState,
    })
  }

  handleCommentEditSubmit(commentId, newComment) {
    const { mapId, openEditState } = this.state;
    const rawComment = convertToRaw(openEditState.getCurrentContent());

    fetch(`/api/map/${mapId}/comments`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment_id: commentId,
        comment: rawComment
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(comments => {
      this.setState({
        mapComments: comments,
        openReply: null,
        openEdit: null,
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
    const { error, mapId, mapComments, openReply, openEdit, openEditState, newCommentState } = this.state;
    return (
      <div>
      {error &&
        <Message negative>{error}</Message>
      }
      <Form onSubmit={() => this.handleCommentSubmit(null, newCommentState)}>
        <DraftEditor editorState={newCommentState} update={this.handleCommentChange} />
        <Button>Submit</Button>
        <Divider></Divider>
      </Form>
      <Comment.Group>
        {mapComments && mapId && mapComments.map((comment) =>
          <MapComment key={comment.comment_id} mapId={mapId} comment={comment} openReply={openReply} openEdit={openEdit} openEditState={openEditState} onReplyOpen={this.handleReplyOpen} onEditOpen={this.handleEditOpen} onCommentEdit={this.onCommentEdit} onCommentSubmit={this.handleCommentSubmit} onCommentEdit={this.handleCommentEdit} onCommentDelete={this.handleCommentDelete} handleCommentEdit={this.handleCommentEdit} handleCommentEditSubmit={this.handleCommentEditSubmit} />
        )}
      </Comment.Group>
      </div>
    )
  }
}