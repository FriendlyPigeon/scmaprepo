import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Dropdown, Input, Loader, Image, Divider, Message, Rating } from 'semantic-ui-react';

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
      orderOptions: [
        {
          text: 'Ascending',
          key: 'ascending',
          value: 'ascending',
        },
        {
          text: 'Descending',
          key: 'descending',
          value: 'descending',
        }
      ],
      sortSelected: 'date',
      orderSelected: 'descending',
      searchTerm: '',
      tagSelected: props.match.params.tag || ''
    }

    this.handleSortDropdownChange = this.handleSortDropdownChange.bind(this);
    this.handleOrderDropdownChange = this.handleOrderDropdownChange.bind(this);
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
    let orderSelected = this.state.orderSelected

    if(data.value === 'name') {
      if(orderSelected === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
      
    } else if(data.value === 'date') {
      if(orderSelected === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }

    } else if(data.value === 'rating') {
      if(orderSelected === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.average_rating
          let y = b.average_rating
          return x - y
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.average_rating
          let y = b.average_rating
          return y - x
        })
      }
    }

    this.setState({
      sortSelected: data.value,
      maps: newMapsArray,
    })
  }

  handleOrderDropdownChange(event, data) {
    let newMapsArray = JSON.parse(JSON.stringify(this.state.maps))
    let sortSelected = this.state.sortSelected

    if(sortSelected === 'name') {
      if(data.value === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
      
    } else if(sortSelected === 'date') {
      if(data.value === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }

    } else if(sortSelected === 'rating') {
      if(data.value === 'ascending') {
        newMapsArray.sort(function(a, b) {
          let x = a.average_rating
          let y = b.average_rating
          return x - y
        })
      } else {
        newMapsArray.sort(function(a, b) {
          let x = a.average_rating
          let y = b.average_rating
          return y - x
        })
      }
    }

    this.setState({
      orderSelected: data.value,
      maps: newMapsArray,
    })
  }
  
  handleSearch(event) {
    this.setState({
      searchTerm: event.target.value,
    })
  }
  
  render() {
    const { maps, error, sortOptions, orderOptions, sortSelected, orderSelected, searchTerm } = this.state;
    const { location, match } = this.props;
    return(
      <Segment inverted>
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
        <Dropdown
          value={orderSelected}
          onChange={this.handleOrderDropdownChange}
          placeholder='Ascending'
          selection
          options={orderOptions}
        />
        <h3>
          <Link to='/map/new'>New map</Link>
        </h3>
        <Divider section />
        {maps ?
        maps.map((map) => {
          if(map.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            if(!match.params.tag || map.tag_names.includes(match.params.tag)) {
              return <h3 key={map.id}>
              <Link to={`/map/${map.id}`}>{map.name}</Link>
              <Rating 
                icon='star'
                defaultRating={map.average_rating}
                maxRating={10}
                disabled
              /> 
              <Image src={map.thumbnail_url} size='small' />
              <Divider section />
              </h3>
            }
          }
        })
        : <Loader>Loading maps</Loader>}
      </Segment>
    )
  }
}