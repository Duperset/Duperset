import React, {Component} from 'react'
import {FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap'
import {connect} from 'react-redux'

class AddCardToDashForm extends Component{
  constructor(props){
    super(props)
    this.state = {
      selectedDashboard: props.currentDashboard.title
    }
    this.handleSelectChange = this.handleSelectChange.bind(this)
  }

  handleSelectChange(e){
    this.setState({selectedDashboard:e.target.value})
  }

  render(){
    return (
      <form onSubmit={e=>this.props.handleSubmit(e,this.state.selectedDashboard)}>
        <FormGroup>
          <FormControl componentClass="select" placeholder="select" onChange={this.handleSelectChange}>
            <option key='0' value={this.props.currentDashboard.title} >{this.props.currentDashboard.title}</option>
            {this.props.availableDashboards.map((dashboard,index)=>{
              if(dashboard!==this.props.currentDashboard)return(
                <option key={''+(index+1)}value={dashboard.title}>{dashboard.title}</option>
              )
            })}
          </FormControl>
          <Button type='submit'>
            Add Card to Dashboard
          </Button>
        </FormGroup>
      </form>
    )
  }
}

let mapStateToProps = (state)=>(
  {
    availableDashboards: state.dashboards.dashboards,
    currentDashboard: state.dashboards.currentDashboard
  }
)

let mapDispatchToProps = (dispatch)=>(
  {

  }
)

export default connect(mapStateToProps,mapDispatchToProps)(AddCardToDashForm)