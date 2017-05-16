import React, { Component } from 'react'
import {Form, FormGroup, Button, ControlLabel, FormControl} from 'react-bootstrap'
import { connect } from 'react-redux'
import SQLForm from './SQLForm'
import PageHeader from './PageHeader'
import styles from '../../assets/css/TalkToDatabase.css'
import BarChart from './BarChart'
import Table from './Table'
import SaveSliceModal from './SaveSliceModal'
import history from '../main'

const pg = require('pg')

class TalkToDatabase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDatabaseName: 'video-shopper',
      databases: [],
      currentTablesArray: [],
      currentSQLQuery: "SELECT name, description, price FROM product JOIN review ON product.id = review.product_id WHERE review.stars = '5'",
      currentData: null,
      showModal: false,
      currentSliceName: '',
      client: new pg.Client(`postgres://localhost/video-shopper`)
    }
    this.handleDatabaseChange = this.handleDatabaseChange.bind(this)
    this.handleFindAllTables = this.handleFindAllTables.bind(this)
    this.findAllColumns = this.findAllColumns.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleQuery = this.handleQuery.bind(this)
    this.handleShowModal = this.handleShowModal.bind(this)
    this.handleSaveSlice = this.handleSaveSlice.bind(this)
    this.handleSliceNameChange = this.handleSliceNameChange.bind(this)
    this. handleFindAllDatabases = this. handleFindAllDatabases.bind(this)
  }

  handleChange(event) {
    this.setState({
      currentSQLQuery: event.target.value
    })
  }

  handleSliceNameChange(event) {
    this.setState({
      currentSliceName: event.target.value
    })
  }

  handleDatabaseChange(event) {
    this.setState({
      currentDatabaseName: event.target.value,
      client: new pg.Client(`postgres://localhost/${event.target.value}`)
    })
  }

  handleQuery(event) {
    this.state.client.query(this.state.currentSQLQuery, (err, data) => {
      if (err) console.error(err)
      else {
        this.setState({
          currentData: data.rows
        })
      }
    })
    event.preventDefault()
  }

  handleFindAllDatabases(event) {
    let array = []
    // let columnNames
    event.preventDefault()
    const client = new pg.Client(`postgres://localhost/`)
    console.log("client is ", client);
    client.connect()
    client.query("SELECT datname FROM pg_database WHERE datistemplate = false")
    .then(data => { console.log(data);
      data.rows.forEach(x=> {
        array.push(x.datname); 
      })
      this.setState({
            databases: array
          })
      console.log(this.state.databases)
    })
    .catch(err => console.log(err))
    // this.setState({client})
  };

  handleFindAllTables(event) {
    let array = []
    let columnNames
    event.preventDefault()
    const client = new pg.Client(`postgres://localhost/${this.state.currentDatabaseName}`)
    console.log("client is ", client);

    client.connect()
    client.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'public'")
    .then(data => {
      data.rows.forEach(x => {
        this.findAllColumns(x.table_name)
        .then(columnArray => {
          array.push({
            tableName: x.table_name,
            columnNames: columnArray
          })
          this.setState({
            currentTablesArray: array
          })
        })
      })
    })
    .catch(err => console.log(err))
    this.setState({client})
  }

  findAllColumns(tableName) {
    let columnArray = []
    const client = new pg.Client(`postgres://localhost/${this.state.currentDatabaseName}`)
    client.connect()
    let query = "SELECT column_name FROM information_schema.columns WHERE table_name = '" + tableName + "'"
    return client.query(query)
    .then(data => {
      data.rows.forEach(x => {
        columnArray.push(x.column_name)
      })
      return columnArray
    })
    .catch(err => console.log(err))
  }

  handleShowModal() {
    this.setState({
      showModal: true
    })
  }

  handleSaveSlice(event) {
    // this.setState({
    //   showModal: false
    // })
    event.preventDefault()
    this.props.addSlice({
      title: event.target.sliceName.value,
      dateCreated: new Date(),
      SQLQuery: this.state.currentSQLQuery,
      data: this.state.currentData
    })
    history.push('/explorer')
  }

  render() {
    return (
      <div>
        <div className="container">
          <Button bsStyle="primary" onClick = {this.handleFindAllDatabases}>Connect to PostGres</Button>
          <form>
              <FormGroup controlId="formControlsSelect">
              <ControlLabel>Name of Database</ControlLabel>
              <FormControl componentClass="select" placeholder="select" onChange={this.handleDatabaseChange}>
              {this.state.databases && this.state.databases.map((databaseName,i)=>{
                return <option key = {i} value={databaseName}>{databaseName}</option>
              })
              }</FormControl>
            </FormGroup>
          </form>
          <Form onSubmit={ event => this.handleFindAllTables(event) } >
            <Button bsStyle="primary" type='submit'>
              Connect to Database
            </Button>
          </Form>
          <p />
            { this.state.currentTablesArray.length > 0 &&
            this.state.currentTablesArray.map(x =>
              <li key={x.tableName}> { x.tableName }: { x.columnNames.join(', ') }
              </li>)
            }

            {
            this.state.currentTablesArray.length > 0 &&
            <SQLForm {...this.state} handleChange = { this.handleChange } handleQuery = { this.handleQuery } />
            }
            <p />
            {/*<BarChart />*/}

            {
            this.state.currentData &&
            <Table columns = { Object.keys(this.state.currentData[0]) } rows = {(this.state.currentData) } tableName = { this.state.currentSQLQuery } />
            }

            {
            this.state.currentData &&
            <Button bsStyle="primary" type='submit' onClick={ (event) => {
              this.props.setCurrentData(this.state.currentData)
              this.handleShowModal()
              }
            }>
              Save Slice
            </Button>
            }

            {
              this.state.showModal &&
              <SaveSliceModal handleSaveSlice={ this.handleSaveSlice } handleSliceNameChange={ this.handleSliceNameChange } />
            }

        </div>
      </div>
    )
  }
}

// ----------------------- Container -----------------------
import { setCurrentData, addSlice } from '../reducers/dataReducer.jsx'

const mapStateToProps = (state, ownProps) => (
  {
    currentData: state.data.currentData
  }
)
// should we use the object formatting here? KH
const mapDispatchToProps = dispatch => ({
  setCurrentData: data => dispatch(setCurrentData(data)),
  addSlice: sliceObj => dispatch(addSlice(sliceObj))
})

export default connect(mapStateToProps, mapDispatchToProps)(TalkToDatabase)
