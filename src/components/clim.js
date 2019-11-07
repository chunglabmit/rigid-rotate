import React from 'react'
import PropTypes from 'prop-types'
export class CLim extends React.Component {
  render() {
    return (
      <div class="card small">
        <div class="card-body">
          <div class="card-title"> {this.props.name} brightness</div>
          <div class="container-fluid">
            <form>
              <div class="form-group form-inline">
                <label htmlFor={this.props.name + "_min"}>Min</label>
                <input
                 id={this.props.name + "_min"}
                 type="range"
                 class="custom-range form-control"
                 min="0"
                 max="16384"
                 value={this.props.min}
                 onChange={ (event)=>this.props.onMinChange(event.target.value)}
                 />
              </div>
              <div class="form-group form-inline">
                <label htmlFor={this.props.name + "_max"}>Max</label>
                <input
                 id={this.props.name + "_max"}
                 type="range"
                 class="custom-range form-control"
                 min="0"
                 max="16384"
                 value={this.props.max}
                 onChange={(event)=>this.props.onMaxChange(event.target.value)}
                 />
              </div>
              <div class="form-group form-inline">
                <label htmlFor={this.props.name + "_alpha"}>Alpha</label>
                <input
                 id={this.props.name + "_alpha"}
                 type="range"
                 class="custom-range form-control"
                 min="0"
                 max="1"
                 step=".05"
                 value={this.props.alphaTest}
                 onChange={(event)=>this.props.onAlphaTestChange(event.target.value)}
                 />
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
CLim.propTypes={
  name:PropTypes.string,
  min:PropTypes.number,
  max:PropTypes.number,
  alphaTest:PropTypes.number,
  onMinChange:PropTypes.func,
  onMaxChange:PropTypes.func,
  onAlphaTestChange:PropTypes.func
}
CLim.defaultProps={
  name:"",
  min:0,
  max:4095,
  alphaTest:.5,
  onMinChange:(minValue)=>{},
  onMaxChange:(maxValue)=>{},
  onAlphaTestChange:(alpha)=>{}
}
