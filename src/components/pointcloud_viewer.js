import React from 'react';
import PropTypes from 'prop-types'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'
var ElementQueries = require('css-element-queries/src/ElementQueries');
ElementQueries.listen();
var THREE = require('three');
var TrackballControls = require('three-trackballcontrols');

var sphereTexture = new THREE.TextureLoader().load("textures/ball.png");

function nullFunction(event) {

}

export class PointCloudViewer extends React.Component {
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
    this.camera = new THREE.PerspectiveCamera(
      75,
       width / height ,
      .1,
      10000
    );
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
    this.renderer = new THREE.WebGLRenderer();
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
    this.fixed_coords_group = new THREE.Group();
    this.fixed_coords_group.name = "FixedCoordinates";
    var texture = sphereTexture;
    var fixed_material = new THREE.PointsMaterial({
       size:this.props.radius*2,
       color: this.props.fixed_color,
       map: texture,
       alphaTest: .1,
       transparent: true,
    });
    this.addCoords(this.fixed_coords_group,
                   this.props.fixed_coords,
                   fixed_material)
    this.moving_frame_group = new THREE.Group();
    this.moving_rotate_group = new THREE.Group();
    this.moving_coords_group = new THREE.Group();
    this.moving_coords_group.name = "MovingCoordinates";
    var moving_material = new THREE.PointsMaterial({
       size:this.props.radius*2,
       color: this.props.moving_color,
       map: texture,
       alphaTest: .1,
       transparent: true,
    });
    this.addCoords(this.moving_coords_group,
                   this.props.moving_coords,
                   moving_material)
    this.moving_rotate_group.add(this.moving_coords_group)
    this.moving_frame_group.add(this.moving_rotate_group)
    this.axis_helper = new THREE.AxisHelper(2000)
    this.axis_helper.position.set(
      this.props.movingState.center.x,
      this.props.movingState.center.y,
      this.props.movingState.center.z
    )
    this.moving_coords_group.add(this.axis_helper)
    this.applyTransformMatrix()
    this.scene.add(this.fixed_coords_group)
    this.scene.add(this.moving_frame_group)
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

  addCoords(group, coords, material) {
    var geometry = new THREE.BufferGeometry();
    var positions = []
    for (var i = 0; i < coords.length; i++) {
      positions.push(coords[i][0])
      positions.push(coords[i][1])
      positions.push(coords[i][2])
    }
    geometry.addAttribute(
      'position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.computeBoundingSphere();
    var mesh = new THREE.Points(geometry, material);
    group.add(mesh);
  }
  applyTransformMatrix() {
    const ms = this.props.movingState
    this.moving_coords_group.position.set(
      -ms.center.x, -ms.center.y, -ms.center.z)
    this.moving_rotate_group.rotation.set(
      ms.rotation.x, ms.rotation.y, ms.rotation.z)
    this.moving_coords_group.scale.set(
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
PointCloudViewer.propTypes = {
  fixed_coords:PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  moving_coords:PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  radius:PropTypes.number,
  fixed_color:PropTypes.number,
  moving_color:PropTypes.number,
  movingState:PropTypes.object,
  cameraState:PropTypes.object,
  onCameraChange:PropTypes.func
}
PointCloudViewer.defaultProps = {
    fixed_coords:[[20.0, 20.0, 20.0]],
    moving_coords:[[20.0, 20.0, 20.0]],
    radius:1.0,
    fixed_color:0xFF0000,
    moving_color:0x00FF00,
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
