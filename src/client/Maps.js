import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Dropdown, Input, Loader, Dimmer, Divider, Message, Rating } from 'semantic-ui-react';

export default class Maps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maps: null,
      error: null,
      sortOptions: [
        {
          text: 'Name',
          key: 'name',
          value: 'name',
        },
        {
          text: 'Date uploaded',
          key: 'date',
          value: 'date',
        },
        {
          text: 'Rating',
          key: 'rating',
          value: 'rating',
        }
      ],
      sortSelected: '',
      searchTerm: '',
    }

    this.handleSortDropdownChange = this.handleSortDropdownChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    fetch('/api/maps')
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

  handleSortDropdownChange(event, data) {
    let newMapsArray = JSON.parse(JSON.stringify(this.state.maps))

    if(data.value === 'name') {
      newMapsArray.sort(function(a, b) {
        let x = a.name.toLowerCase()
        let y = b.name.toLowerCase()
        if(x < y) { return -1 }
        if(x > y) { return 1 }
        return 0
      })
    } else if(data.value === 'date') {
      newMapsArray.sort(function(a, b) {
        let x = a.created_at
        let y = b.created_at
        if(x < y) { return -1 }
        if(x > y) { return 1 }
        return 0
      })
    } else if(data.value === 'rating') {
      newMapsArray.sort(function(a, b) {
        let x = a.average_rating
        let y = b.average_rating
        if(x > y) { return -1 }
        if(x < y) { return 1 }
        return 0
      })
    }

    this.setState({
      sortSelected: data.value,
      maps: newMapsArray,
    })
  }
  
  handleSearch(event) {
    this.setState({
      searchTerm: event.target.value,
    })
  }
  
  render() {
    const { maps, error, sortOptions, sortSelected, searchTerm } = this.state;
    return(
      <Segment>
        {error && <Message negative>{error}</Message>}
        <Input
          placeholder='Search'
          onInput={this.handleSearch}
          value={searchTerm}
        />
        <Dropdown
          value={sortSelected} 
          onChange={this.handleSortDropdownChange} 
          placeholder='Sort by' 
          selection 
          options={sortOptions}
        />
        <h3>
          <Link to='/map/new'>New map</Link>
        </h3>
        <Divider section />
        {maps ?
        maps.map((map) => {
          if(map.name.includes(searchTerm)) {
            return <h3 key={map.id}>
              <Link to={`/map/${map.id}`}>{map.name}</Link>
              <Rating 
                icon='star'
                defaultRating={map.average_rating}
                maxRating={10}
                disabled
              /> 
              <Divider section />
            </h3>
          }
        })
        : <Loader>Loading maps</Loader>}
      </Segment>
    )
  }
}