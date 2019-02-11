import React, { Component } from 'react';

import { Segment, TextArea, Form, Button } from 'semantic-ui-react';

import DraftEditor from './DraftEditor';
import { EditorState, convertToRaw } from 'draft-js';

export default class MapCommentReply extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newCommentState: EditorState.createEmpty(),
    }

    this.handleCommentChange = this.handleCommentChange.bind(this);
  }

  handleCommentChange(newCommentState) {
    this.setState({
      newCommentState: newCommentState,
    })
  }

  render() {
    const { newCommentState } = this.state;
    return(
      <Form reply onSubmit={() => this.props.onCommentSubmit(this.props.commentId, newCommentState)}>
        <DraftEditor editorState={newCommentState} update={this.handleCommentChange} />
        <Button primary compact>Submit</Button>
      </Form>
    )
  }
}