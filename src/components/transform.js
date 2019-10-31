import React from 'react'
import PropTypes from 'prop-types'
import Form from 'react-bootstrap/Form'

class Triple extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      x: props.x,
      xtext: props.x * this.props.multiplier,
      y: props.y,
      ytext: props.y * this.props.multiplier,
      z: props.z,
      ztext: props.z * this.props.multiplier
    }
  }
  handleChange(event, field) {
    var state = {
      x: this.state.x,
      xtext: this.state.xtext,
      y: this.state.y,
      ytext: this.state.ytext,
      z: this.state.z,
      ztext: this.state.ztext
    }
    state[field+"text"] = event.target.value
    var value = parseFloat(event.target.value) / this.props.multiplier
    if ((! isNaN(value)) && value != this.state[field]) {
      state[field] = value
      this.props.onChange(state)
    }
    this.setState(state)
  }
  render() {
    return(
      <div class="row">
        <div class="col-sm-12 col-md-12 col-lg-12">
          <div class="card">
            <div class="card-body">
              <div class="card-title"> {this.props.name} </div>
                <div class="container-fluid">
                  <form>
                    <div class="form-group form-inline">
                      <label
                       htmlFor={ this.props.name + "X"}
                       >X:</label>&nbsp;
                      <input
                        class="form-control"
                        type="text"
                        size="2"
                        name={ this.props.name + "X"}
                        value={this.state.xtext }
                        onChange={ event=>this.handleChange(event, "x")}/>
                    </div>
                    <div class="form-group form-inline">
                      <label
                       htmlFor={ this.props.name + "Y"}
                       >Y:</label>&nbsp;
                      <input
                        class="form-control"
                        type="text"
                        size="2"
                        name={ this.props.name + "Y"}
                        value={this.state.ytext }
                        onChange={ event=>this.handleChange(event, "y")}/>
                    </div>
                    <div class="form-group form-inline">
                      <label
                       htmlFor={ this.props.name + "Z"}
                       >Z:</label>&nbsp;
                      <input
                        class="form-control"
                        type="text"
                        size="2"
                        name={ this.props.name + "Z"}
                        value={this.state.ztext }
                        onChange={ event=>this.handleChange(event, "z")}/>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        </div>
      </div>
    )
  }
}

function nullFunction(event, field) {

}

Triple.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number,
  multiplier: PropTypes.number,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func
}

Triple.defaultProps = {
  x: 0,
  y: 0,
  z: 0,
  multiplier: 1,
  onChange: nullFunction
}

export class Transform extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      offset: {
        x: props.transform.offset.x,
        y: props.transform.offset.y,
        z: props.transform.offset.z
      },
      center: {
        x: props.transform.center.x,
        y: props.transform.center.y,
        z: props.transform.center.z
      },
      rotation: {
        x: props.transform.rotation.x,
        y: props.transform.rotation.y,
        z: props.transform.rotation.z
      },
      scale: {
        x: props.transform.scale.x,
        y: props.transform.scale.y,
        z: props.transform.scale.z
      }
    }
  }
  render() {
    return(
      <div class="container-fluid small">
        <Triple
         name="offset"
         x = { this.props.transform.offset.x }
         y = { this.props.transform.offset.y }
         z = { this.props.transform.offset.z }
         onChange = { state => this.handleChange(state, "offset") }
         />
        <Triple
          name="center"
          x = { this.props.transform.center.x }
          y = { this.props.transform.center.y }
          z = { this.props.transform.center.z }
          onChange = { state => this.handleChange(state, "center")}
        />
        <Triple
          name="rotation"
          x = { this.props.transform.rotation.x }
          y = { this.props.transform.rotation.y }
          z = { this.props.transform.rotation.z }
          multiplier = { 180 / 3.1415926 }
          onChange = { state=>this.handleChange(state, "rotation")}
        />
        <Triple
          name="scale"
          x = { this.props.transform.scale.x }
          y = { this.props.transform.scale.y }
          z = { this.props.transform.scale.z }
          onChange = { state=>this.handleChange(state, "scale")}
        />

      </div>
    )
  }
  handleChange(state, object_name) {
    if ((this.state[object_name].x != state.x) ||
        (this.state[object_name].y != state.y) ||
        (this.state[object_name].z != state.z)) {
      var newState = {
        offset: {
          x: this.state.offset.x,
          y: this.state.offset.y,
          z: this.state.offset.z
        },
        center: {
          x: this.state.center.x,
          y: this.state.center.y,
          z: this.state.center.z
        },
        rotation: {
          x: this.state.rotation.x,
          y: this.state.rotation.y,
          z: this.state.rotation.z
        },
        scale: {
          x: this.state.scale.x,
          y: this.state.scale.y,
          z: this.state.scale.z
        }
      }
      newState[object_name] = state
      this.setState(newState)
      this.props.onChange(newState)
    }
  }
}
