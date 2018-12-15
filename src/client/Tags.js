import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Message, Divider, Loader, Input, Dropdown } from 'semantic-ui-react';

export default class Tags extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: null,
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
    }

    this.handleSortDropdownChange = this.handleSortDropdownChange.bind(this);
    this.handleOrderDropdownChange = this.handleOrderDropdownChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
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
    const { tags, error, sortOptions, orderOptions, sortSelected, orderSelected, searchTerm } = this.state;
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
          <Link to='/tag/new'>New tag</Link>
        </h3>
        <Divider section />
        {tags ?
        tags.map((tag) => {
          if(tag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return <h3 key={tag.id}>
              <Link to={`/maps?tag=${tag.name}`}>{tag.name}</Link>
              <Divider section />
            </h3>
          }
        }) 
        : <Loader>Loading maps</Loader>}
      </Segment>
    )
  }
}