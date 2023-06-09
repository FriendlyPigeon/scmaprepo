import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';

import { Segment, Loader, Divider, Input, Message, List, Dropdown, Button } from 'semantic-ui-react';

import DraftEditor from './DraftEditor';
import { EditorState, convertToRaw } from 'draft-js';

export default class MapEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successfulSubmit: false,
      descriptionState: EditorState.createEmpty(),
      map: null,
      allMappers: null,
      allTags: null,
      error: null,
    }

    this.handleMapperDropdownChange = this.handleMapperDropdownChange.bind(this);
    this.handleTagDropdownChange = this.handleTagDropdownChange.bind(this);
    this.handleMapNameChange = this.handleMapNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleMapSubmit = this.handleMapSubmit.bind(this);
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
        console.log('reached map')
        this.setState({
          map: map
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
    
    fetch('/api/mappers/dropdown')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(mappers => {
        console.log('reached mappers')
        this.setState({
          allMappers: mappers,
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })

    fetch('/api/tags/dropdown')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(tags => {
        this.setState({
          allTags: tags,
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
  }

  handleMapperDropdownChange(event, data) {
    let mapWithNewMappers = Object.assign({}, this.state.map);
    mapWithNewMappers.mapper_ids = data.value;
    
    this.setState({
      map: mapWithNewMappers,
    })
  }

  handleTagDropdownChange(event, data) {
    let mapWithNewTags = Object.assign({}, this.state.map);
    mapWithNewTags.tag_ids = data.value;

    this.setState({
      map: mapWithNewTags,
    })
  }

  handleMapNameChange(event) {
    let mapWithNewName = Object.assign({}, this.state.map);
    mapWithNewName.name = event.target.value;

    this.setState({
      map: mapWithNewName,
    })
  }

  handleDescriptionChange(editorState) {
    this.setState({
      descriptionState: editorState,
    })
  }

  handleMapSubmit() {
    const { id } = this.props.match.params;
    const { map, newMappers, descriptionState } = this.state;

    const rawDescription = convertToRaw(descriptionState.getCurrentContent());

    fetch(`/api/map/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: map.name,
        description: rawDescription,
        authors: map.mapper_ids || [],
        tags: map.tag_ids || [],
      })
    })
    .then(response => response.json())
    .then((response) => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response =>
      this.setState({
        successfulSubmit: true,
      })
    )
    .catch(error =>
      this.setState({
        error: error.error,
      })  
    )

  }

  render() {
    const { successfulSubmit, map, error, allMappers, allTags, newMappers, descriptionState } = this.state;
    return(
      <Segment inverted>
        {error && <Message negative>{error}</Message>}
        {successfulSubmit && <Redirect to={`/map/${this.props.match.params.id}`} />}
        {map && allMappers ?
          <div>
            <Input
              onChange={this.handleMapNameChange} 
              placeholder='Map name' 
              value={map.name} 
            />
            <Divider />
            <h3>Authors</h3>
              <Dropdown
                multiple
                value={map.mapper_ids} 
                onChange={this.handleMapperDropdownChange} 
                placeholder='Mapper' 
                search 
                selection 
                options={allMappers} 
              />
            <h3>Tags</h3>
              <Dropdown
                multiple
                value={map.tag_ids}
                onChange={this.handleTagDropdownChange}
                placeholder='Tag'
                search
                selection
                options={allTags}
              />
            <h3>Description</h3>
            <DraftEditor editorState={descriptionState} update={this.handleDescriptionChange} />
            <Button primary onClick={this.handleMapSubmit}>Submit</Button>
          </div>
        : <Loader>Loading map information</Loader>}
      </Segment>
    )
  }
}