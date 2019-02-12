import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Loader, Divider, Message, Input, Dropdown } from 'semantic-ui-react';

export default class Mappers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mappers: null,
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
    fetch('/api/mappers')
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(mappers => {
        this.setState({
          mappers: mappers
        })
      })
      .catch(error => {
        this.setState({
          error: error.error
        })
      })
  }

  handleSortDropdownChange(event, data) {
    let newMappersArray = JSON.parse(JSON.stringify(this.state.mappers))
    let orderSelected = this.state.orderSelected

    if(data.value === 'name') {
      if(orderSelected === 'ascending') {
        newMappersArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMappersArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
      
    } else if(data.value === 'date') {
      if(orderSelected === 'ascending') {
        newMappersArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMappersArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
    }

    this.setState({
      sortSelected: data.value,
      mappers: newMappersArray,
    })
  }

  handleOrderDropdownChange(event, data) {
    let newMappersArray = JSON.parse(JSON.stringify(this.state.mappers))
    let sortSelected = this.state.sortSelected

    if(sortSelected === 'name') {
      if(data.value === 'ascending') {
        newMappersArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMappersArray.sort(function(a, b) {
          let x = a.name.toLowerCase()
          let y = b.name.toLowerCase()
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
      
    } else if(sortSelected === 'date') {
      if(data.value === 'ascending') {
        newMappersArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x < y) { return -1 }
          if(x > y) { return 1 }
          return 0
        })
      } else {
        newMappersArray.sort(function(a, b) {
          let x = a.created_at
          let y = b.created_at
          if(x > y) { return -1 }
          if(x < y) { return 1 }
          return 0
        })
      }
    }

    this.setState({
      orderSelected: data.value,
      mappers: newMappersArray,
    })
  }
  
  handleSearch(event) {
    this.setState({
      searchTerm: event.target.value,
    })
  }

  render() {
    const { mappers, error, sortOptions, orderOptions, sortSelected, orderSelected, searchTerm } = this.state;
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
          <Link to='/mapper/new'>New mapper</Link>
        </h3>
        <Divider section />
        {mappers ?
        mappers.map((mapper) => {
          if(mapper.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return <h3 key={mapper.id}>
              <Link to={`/mapper/${mapper.id}`}>{mapper.name}</Link>
              <Divider section />
            </h3>
          }
        }) 
        : <Loader>Loading mappers</Loader>}
      </Segment>
    )
  }
}