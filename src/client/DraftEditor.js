import React, { Component } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';

import { Button } from 'semantic-ui-react';

export default class DraftEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }

    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this._toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }

  handleEditorChange(editorState) {
    this.props.update(editorState);
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if(newState) {
      this.handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  _toggleBlockType(blockType) {
    this.handleEditorChange(RichUtils.toggleBlockType(this.props.editorState, blockType))
  }

  _toggleInlineStyle(inlineStyle) {
    this.handleEditorChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
  }

  render() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    const currentStyle = editorState
      .getCurrentInlineStyle();
    return(
      <div>
        <div>
          <Button.Group>
            <Button type="button" primary={blockType !== 'header-one'} compact onClick={() => this._toggleBlockType('header-one')}>H1</Button>
            <Button type="button" primary={blockType !== 'header-two'} compact onClick={() => this._toggleBlockType('header-two')}>H2</Button>
            <Button type="button" primary={blockType !== 'header-three'} compact onClick={() => this._toggleBlockType('header-three')}>H3</Button>
            <Button type="button" primary={blockType !== 'header-four'} compact onClick={() => this._toggleBlockType('header-four')}>H4</Button>
            <Button type="button" primary={blockType !== 'header-five'} compact onClick={() => this._toggleBlockType('header-five')}>H5</Button>
            <Button type="button" primary={blockType !== 'header-six'} compact onClick={() => this._toggleBlockType('header-six')}>H6</Button>
            <Button type="button" primary={blockType !== 'blockquote'} compact onClick={() => this._toggleBlockType('blockquote')}>Blockquote</Button>
            <Button type="button" primary={blockType !== 'unordered-list-item'} compact onClick={() => this._toggleBlockType('unordered-list-item')}>UL</Button>
            <Button type="button" primary={blockType !== 'ordered-list-item'} compact onClick={() => this._toggleBlockType('ordered-list-item')}>OL</Button>
            <Button type="button" primary={blockType !== 'code-block'} compact onClick={() => this._toggleBlockType('code-block')}>Code</Button>
          </Button.Group>
        </div>
        <div>
          <Button.Group>
            <Button type="button" primary={!currentStyle.has('BOLD')} compact onClick={() => this._toggleInlineStyle('BOLD')}>Bold</Button>
            <Button type="button" primary={!currentStyle.has('ITALIC')} compact onClick={() => this._toggleInlineStyle('ITALIC')}>Italic</Button>
            <Button type="button" primary={!currentStyle.has('UNDERLINE')} compact onClick={() => this._toggleInlineStyle('UNDERLINE')}>Underline</Button>
            <Button type="button" primary={!currentStyle.has('CODE')} compact onClick={() => this._toggleInlineStyle('CODE')}>Monospace</Button>
          </Button.Group>
        </div>
        <Editor
          editorState={editorState} 
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.handleEditorChange} 
        />
      </div>
    )
  }
}