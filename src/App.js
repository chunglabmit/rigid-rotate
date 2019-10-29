import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Coords} from './components/coords'
import {PointCloudViewer} from './components/pointcloud_viewer'
import {Transform} from './components/transform'

export default class App extends React.Component {
  constructor() {
    super();
    this.pcv = React.createRef()
    this.state = {
      moving_coords:[[20.0, 20.0, 20.0]],
      fixed_coords:[[20.0, 20.0, 20.0]],
      idx:1,
      cameraState: PointCloudViewer.defaultProps.cameraState,
      movingState: PointCloudViewer.defaultProps.movingState
    }
  }

  onCameraChange(state) {
    this.setState({
      moving_coords:this.state.moving_coords,
      fixed_coords:this.state.fixed_coords,
      idx:this.state.idx,
      cameraState:state,
      movingState:this.state.movingState
    })
  }

  onMovingChange(state) {
    this.setState({
      moving_coords:this.state.moving_coords,
      fixed_coords:this.state.fixed_coords,
      idx:this.state.idx,
      cameraState:this.state.cameraState,
      movingState:state
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <a
            className="App-link"
            href="https://github.com/chunglabmit/rigid-rotate"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rigid-rotate on Github
          </a>
          <div>
            xr={(this.state.cameraState.rotation.x * 180 / 3.14159).toFixed(0)},
            yr={(this.state.cameraState.rotation.y * 180 / 3.14159).toFixed(0)},
            zr={(this.state.cameraState.rotation.z * 180 / 3.14159).toFixed(0)}
          </div>
        </header>
        <div>
          <Coords
            name="fixed"
            onCoords={ data=>this.onFixedCoords(data) }
            />
          <Coords
            name="moving"
            onCoords={ data=>this.onMovingCoords(data) }
            />
          <PointCloudViewer
            key={[this.state.idx,
                  this.state.movingState.offset.x,
                  this.state.movingState.offset.y,
                  this.state.movingState.offset.z,
                  this.state.movingState.rotation.x,
                  this.state.movingState.rotation.y,
                  this.state.movingState.rotation.z,
                  this.state.movingState.center.x,
                  this.state.movingState.center.y,
                  this.state.movingState.center.z,
                  this.state.movingState.scale.x,
                  this.state.movingState.scale.y,
                  this.state.movingState.scale.z
                 ]}
            moving_coords = {this.state.moving_coords}
            fixed_coords = {this.state.fixed_coords}
            radius={ 5 }
            cameraState={this.state.cameraState}
            movingState={this.state.movingState}
            onCameraChange={ state=>this.onCameraChange(state) }
            ref={ this.pcv } />
        </div>
        <Transform
          transform={ this.state.movingState }
          onChange={ state=>this.onMovingChange(state)} />
      </div>
    );
  }
  onFixedCoords(data) {
    console.log("Received fixed coords")
    this.setState({
      fixed_coords:data,
       moving_coords:this.state.moving_coords,
       idx:this.state.idx+1,
       cameraState:this.state.cameraState
     })
  }
  onMovingCoords(data) {
    console.log("Received moving coords")
    this.setState({
      fixed_coords:this.state.fixed_coords,
       moving_coords:data,
       idx:this.state.idx+1,
       cameraState:this.state.cameraState
     })
  }
}
