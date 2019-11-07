import React from 'react';
import {Tabs, Tab} from 'react-bootstrap-tabs'
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Coords} from './components/coords'
import {PointCloudViewer} from './components/pointcloud_viewer'
import {VolumeViewer} from './components/volumeviewer'
import {Transform} from './components/transform'
import {UrlButton} from './components/url'
import {CLim} from './components/clim'

export default class App extends React.Component {
  constructor() {
    super();
    this.pcv = React.createRef()
    this.state = {
      moving_coords:[[20.0, 20.0, 20.0]],
      fixed_coords:[[20.0, 20.0, 20.0]],
      idx:1,
      pcCameraState: PointCloudViewer.defaultProps.cameraState,
      volCameraState: VolumeViewer.defaultProps.cameraState,
      movingState: PointCloudViewer.defaultProps.movingState,
      selectedTab: 0,
      movingURL: VolumeViewer.defaultProps.movingURL,
      fixedURL: VolumeViewer.defaultProps.fixedURL,
      climFixedMin: VolumeViewer.defaultProps.climFixedMin,
      climFixedMax: VolumeViewer.defaultProps.climFixedMax,
      fixedAlphaTest: VolumeViewer.defaultProps.fixedAlphaTest,
      climMovingMin: VolumeViewer.defaultProps.climMovingMin,
      climMovingMax: VolumeViewer.defaultProps.climMovingMax,
      movingAlphaTest: VolumeViewer.defaultProps.movingAlphaTest
    }
  }

  changeState(key, value) {
    var state = {
      moving_coords:this.state.moving_coords,
      fixed_coords:this.state.fixed_coords,
      idx:this.state.idx,
      cameraState:this.state.cameraState,
      movingState:this.state.movingState,
      selectedTab:this.state.selectedTab,
      movingURL:this.state.movingURL,
      fixedURL:this.state.fixedURL,
      climFixedMin: this.state.climFixedMin,
      climFixedMax: this.state.climFixedMax,
      fixedAlphaTest: this.state.fixedAlphaTest,
      climMovingMin: this.state.climMovingMin,
      climMovingMax: this.state.climMovingMax,
      movingAlphaTest: this.state.movingAlphaTest
    }
    state[key] = value
    this.setState(state)
  }
  onTabChange(tab) {
    this.changeState("selectedTab", tab)
  }
  onPCCameraChange(state) {
    this.changeState("pcCameraState", state)
  }
  onVolCameraChange(state) {
    this.changeState("volCameraState", state)
  }

  onMovingChange(state) {
    this.changeState("movingState", state)
  }
  onMovingURLChange(state) {
    this.changeState("movingURL", state)
  }
  onFixedURLChange(state) {
    this.changeState("fixedURL", state)
  }

  render() {
    return (
      <div className="App">
        <div>
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="https://github.com/chunglabmit/rigid-rotate">
              Rigid Rotate
            </a>
            <button
               class="navbar-toggler"
               type="button"
               data-toggle="collapse"
               data-target="#navbarSupportedContent"
               aria-controls="navbarSupportedContent"
               aria-expanded="true"
               aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="nav nav-tabs">
                <li class="nav-item active">
                  <a class="nav-link" href="#">Home</a>
                </li>
                <li>
                  <div class="mx-3">
                  <Coords
                    name="fixed"
                    onCoords={ data=>this.onFixedCoords(data) }
                    />
                  </div>
                  </li>
                  <li>
                    <div class="mx-3">
                    <Coords
                      name="moving"
                      onCoords={ data=>this.onMovingCoords(data) }
                      />
                    </div>
                  </li>
                  <li>
                    <div class="mx-3">
                    <UrlButton
                      url={ this.state.fixedURL}
                      name="fixed"
                      onURLChange={ (url)=>this.onFixedURLChange(url)} />
                    </div>
                  </li>
                  <li>
                    <div class="mx-3">
                    <UrlButton
                      url={ this.state.movingURL}
                      name="moving"
                      onURLChange={ (url)=>this.onMovingURLChange(url)} />
                    </div>
                  </li>
              </ul>
            </div>
          </nav>
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-5 col-md-4 col-lg-3">
                <div class="container-fluid">
                  <div class="row no-gutters">
                    <Transform
                      transform={ this.state.movingState }
                      onChange={ state=>this.onMovingChange(state)} />
                  </div>
                  <div class="row no-gutters">
                    <CLim
                      name="fixed"
                      min={this.state.climFixedMin}
                      max={this.state.climFixedMax}
                      alphaTest={this.state.fixedAlphaTest}
                      onMinChange={
                        value=>this.changeState("climFixedMin", value)
                      }
                      onMaxChange={
                        value=>this.changeState("climFixedMax", value)
                      }
                      onAlphaTestChange={
                        value=>this.changeState("fixedAlphaTest", value)
                      }
                      />
                  </div>
                  <div class="row no-gutters">
                    <CLim
                      name="moving"
                      min={this.state.climMovingMin}
                      max={this.state.climMovingMax}
                      alphaTest={this.state.movingAlphaTest}
                      onMinChange={
                        value=>this.changeState("climMovingMin", value)
                      }
                      onMaxChange={
                        value=>this.changeState("climMovingMax", value)
                      }
                      onAlphaTestChange={
                        value=>this.changeState("movingAlphaTest", value)
                      }
                      />
                  </div>
                </div>
              </div>
              <div class="col col-sm-7 col-md-8 col-lg-9">
                <Tabs
                  onSelect={ (tab) => this.onTabChange(tab)}
                  selected={ this.state.selectedTab}>
                  <Tab label="Volume">
                    <VolumeViewer
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
                        this.state.movingState.scale.z,
                        this.state.movingURL,
                        this.state.fixedURL,
                        this.state.climFixedMin,
                        this.state.climFixedMax,
                        this.state.climMovingMin,
                        this.state.climMovingMax,
                        this.state.fixedAlphaTest,
                        this.state.movingAlphaTest
                      ]}
                      fixedClimMin={this.state.climFixedMin}
                      fixedClimMax={this.state.climFixedMax}
                      fixedAlphaTest={this.state.fixedAlphaTest}
                      movingClimMin={this.state.climMovingMin}
                      movingClimMax={this.state.climMovingMax}
                      movingAlphaTest={this.state.movingAlphaTest}
                      fixedURL={this.state.fixedURL}
                      movingURL={this.state.movingURL}
                      cameraState={this.state.volCameraState}
                      movingState={this.state.movingState}
                      onCameraChange={ state=>this.onVolCameraChange(state) }/>
                  </Tab>
                  <Tab label="Point Cloud">
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
                      cameraState={this.state.pcCameraState}
                      movingState={this.state.movingState}
                      onCameraChange={ state=>this.onPCCameraChange(state) }
                      ref={ this.pcv } />
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
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
