import React from 'react';
import PropTypes from 'prop-types'
import {PrecomputedVolume} from "../precomputed/volume.js"
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'
var ElementQueries = require('css-element-queries/src/ElementQueries');
ElementQueries.listen();
var THREE = require('three');

function nullFunction(event) {

}

const VOLUME = {}
const LEVEL = {}

export class VolumeViewer extends React.Component {
  render() {
    return(
      <div
        id="canvas-div" class-name="canvas-div"
        style={{ height:window.innerHeight - 10 }}
        ref={ref => (this.mount = ref)}
      />)
  }
  componentDidMount() {
    new ResizeSensor(this.mount, this.onResize);
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    var h = 512; // frustum height
    var aspect = width / height;
    this.camera = new THREE.OrthographicCamera(
       - h * aspect / 2,
       h * aspect / 2,
       h / 2,
       - h / 2, 1, 10000 );
    this.camera.position.set(
      this.props.cameraState.position.x,
      this.props.cameraState.position.y,
      this.props.cameraState.position.z)
    this.camera.up.set(
      this.props.cameraState.up.x,
      this.props.cameraState.up.y,
      this.props.cameraState.up.z
    )
    this.camera.rotation.set(
      this.props.cameraState.rotation.x,
      this.props.cameraState.rotation.y,
      this.props.cameraState.rotation.z
    )
    this.camera.zoom = this.props.cameraState.zoom
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('webgl2', {alpha:true})
    this.renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      context: context
    });
    this.mount.appendChild( this.renderer.domElement );
    this.renderer.setSize(width, height);

    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement );
    this.controls.rotateSpeed = 1.5;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.target.set(
      this.props.cameraState.target.x,
      this.props.cameraState.target.y,
      this.props.cameraState.target.z
    )
    this.controls.addEventListener(
      'change', event => this.onCameraChange(event))

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xC0C0C0 );
    this.light = new THREE.AmbientLight( 0xFFFFFF );
    var light = new THREE.DirectionalLight(0xFFFFFF, 2)
    light.position.set(1, 1, 1)
    this.scene.add(light);
    this.scene.add(this.camera);

    this.fixed_group = new THREE.Group();
    this.fixed_group.name = "FixedCoordinates";
    this.loadVolume(this.props.fixedURL,
                    this.props.fixed_colormap_file,
                    this.props.fixedClimMin,
                    this.props.fixedClimMax,
                    this.props.fixedAlphaTest,
                    this.fixed_group)
    if (true) {
      this.moving_frame_group = new THREE.Group();
      this.moving_rotate_group = new THREE.Group();
      this.moving_group = new THREE.Group();
      this.loadVolume(this.props.movingURL,
                      this.props.moving_colormap_file,
                      this.props.movingClimMin,
                      this.props.movingClimMax,
                      this.props.movingAlphaTest,
                      this.moving_group)
      this.moving_group.name = "MovingCoordinates";
      this.moving_rotate_group.add(this.moving_group)
      this.moving_frame_group.add(this.moving_rotate_group)
      this.axis_helper = new THREE.AxisHelper(2000)
      this.axis_helper.position.set(
        this.props.movingState.center.x,
        this.props.movingState.center.y,
        this.props.movingState.center.z
      )
      this.moving_group.add(this.axis_helper)
      this.applyTransformMatrix()
      this.scene.add(this.moving_frame_group)
    }
    this.scene.add(this.fixed_group)
    this.animate()
  }
  componentWillUnmount(){
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }
  onCameraChange(event) {
    this.props.onCameraChange(
      {
        position: {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z
        },
        rotation: {
          x: this.camera.rotation.x,
          y: this.camera.rotation.y,
          z: this.camera.rotation.z
        },
        up: {
          x: this.camera.up.x,
          y: this.camera.up.y,
          z: this.camera.up.z
        },
        zoom: this.camera.zoom,
        target: {
          x: this.controls.target.x,
          y: this.controls.target.y,
          z: this.controls.target.z
        }
      }
    )
  }

  onResize = (e) => {
    const width = this.mount.clientWidth - 10;
    const height = this.mount.clientHeight - 10;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    console.log("Width: " + width + " Height: " + height);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }
  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    this.controls.update();
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  loadVolume(url, colormap_file, climMin, climMax, alphaTest, group) {
    new THREE.TextureLoader().load(colormap_file,
    (cm) => {
      const key = [url, this.props.level]
      if (typeof VOLUME[key] === "undefined") {
        const pcvolume = new PrecomputedVolume(url)
        pcvolume.waitForInit( () => {
          var tentativeLevel
          var scale
          for (tentativeLevel=1;
               tentativeLevel <=pcvolume.scales.length;
               tentativeLevel++) {
              scale = pcvolume.scales[tentativeLevel-1]
            if (scale.xs() * scale.ys() * scale.zs() < 10000000) {
              break
            }
          }
          if (tentativeLevel > pcvolume.scales.length) {
            tentativeLevel = pcvolume.scales.length
            scale = pcvolume.scales[tentativeLevel-1]
          }
          const level = tentativeLevel
          pcvolume.readVolume(scale.x0(), scale.x1(),
            scale.y0(), scale.y1(), scale.z0(), scale.z1(),
            level,
            (volume)=> {
              VOLUME[key] = volume
              LEVEL[key] = level
              group.add(this.makeMesh(volume, cm, climMin, climMax, alphaTest,
                        level))
            })
        })
      } else {
        group.add(this.makeMesh(VOLUME[key], cm, climMin, climMax, alphaTest,
                  LEVEL[key]))
      }
    })
  }
  makeMesh(volume, cm, climMin, climMax, alphaTest, level) {
    var texture = new THREE.DataTexture3D(
      volume.data, volume.xLength, volume.yLength, volume.zLength)
    texture.format = THREE.RedFormat
    texture.type = THREE.FloatType
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    var shader = VolumeRenderShader1;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    uniforms[ "u_data" ].value = texture;
    uniforms[ "u_size" ].value.set( volume.xLength, volume.yLength, volume.zLength );
    uniforms[ "u_clim" ].value.set( climMin, climMax );
    uniforms[ "u_renderstyle" ].value = 0
    uniforms[ "u_cmdata"].value = cm
    var material = new THREE.ShaderMaterial( {
      alphaTest: alphaTest,
      uniforms: uniforms,
      transparent: true,
      blending: THREE.NormalBlending,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      opacity: alphaTest,
      side: THREE.BackSide // The volume shader uses the backface as its "reference point"
    } );
    // THREE.Mesh
    var geometry = new THREE.BoxBufferGeometry( volume.xLength, volume.yLength, volume.zLength );
    geometry.translate( volume.xLength/2 - 0.5,
                        volume.yLength/2 - 0.5,
                        volume.zLength / 2  - 0.5);
    var mesh = new THREE.Mesh( geometry, material );
    var group = new THREE.Group()
    group.add(mesh)
    const scale = Math.pow(2, level-1)
    group.scale.set(scale, scale, scale)
    return group
  }
  applyTransformMatrix() {
    const ms = this.props.movingState
    this.moving_group.position.set(
      -ms.center.x, -ms.center.y, -ms.center.z)
    this.moving_rotate_group.rotation.set(
      ms.rotation.x, ms.rotation.y, ms.rotation.z)
    this.moving_group.scale.set(
      ms.scale.x,
      ms.scale.y,
      ms.scale.z
    )
    this.moving_frame_group.position.set(
      ms.center.x + ms.offset.x,
      ms.center.y + ms.offset.y,
      ms.center.z + ms.offset.z)
  }
}
VolumeViewer.propTypes = {
  fixedURL:PropTypes.string,
  movingURL:PropTypes.string,
  fixed_colormap_file:PropTypes.string,
  moving_colormap:PropTypes.string,
  fixedClimMin:PropTypes.number,
  fixedClimMax:PropTypes.number,
  fixedAlphaTest:PropTypes.number,
  movingClimMin:PropTypes.number,
  movingClimMax:PropTypes.number,
  movingAlphaTest:PropTypes.number,
  level:PropTypes.number,
  movingState:PropTypes.object,
  cameraState:PropTypes.object,
  onCameraChange:PropTypes.func
}
VolumeViewer.defaultProps = {
    fixedURL:"https://leviathan-chunglab.mit.edu/precomputed/2019-10-28-syto16-round3",
    movingURL:"https://leviathan-chunglab.mit.edu/precomputed/2019-10-28-syto16-round4",
    fixed_colormap_file:"textures/cm_red.png",
    moving_colormap_file:"textures/cm_green.png",
    level: 3,
    fixedClimMin: 0,
    fixedClimMax: 4000,
    fixedAlphaTest: .5,
    movingClimMin: 0,
    movingClimMax: 4000,
    movingAlphaTest: .5,
    movingState:{
      offset: {
        x: 0,
        y: 0,
        z: 0
      },
      center: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      }
    },
    cameraState:{
      position: {
        x:1000,
        y:1000,
        z:1000
      },
      rotation: {
        x:0,
        y:0,
        z:0
      },
      zoom: 1,
      up: {
        x:0,
        y:1,
        z:0
      },
      target: {
        x:1000,
        y:1000,
        z:0
      }
    },
    onCameraChange:nullFunction
}
