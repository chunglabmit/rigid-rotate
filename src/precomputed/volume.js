var THREE = require('three');
THREE.Volume = require('three/examples/jsm/misc/Volume').Volume

class Scale {
  constructor(jsonData) {
    this.chunk_sizes = jsonData["chunk_sizes"][0]
    this.encoding = jsonData["encoding"]
    this.key = jsonData["key"]
    this.resolution = jsonData["resolution"]
    this.size = jsonData["size"]
    this.voxel_offset = jsonData["voxel_offset"]
  }
  xs() {
    return this.size[0]
  }
  ys() {
    return this.size[1]
  }
  zs() {
    return this.size[2]
  }
  xcs() {
    return this.chunk_sizes[0]
  }
  ycs() {
    return this.chunk_sizes[1]
  }
  zcs() {
    return this.chunk_sizes[2]
  }
  xr() {
    return this.resolution[0]
  }
  yr() {
    return this.resolution[1]
  }
  zr() {
    return this.resolution[2]
  }
  x0() {
    return this.voxel_offset[0]
  }
  y0() {
    return this.voxel_offset[1]
  }
  z0() {
    return this.voxel_offset[2]
  }
  x1() {
    return this.x0() + this.xs()
  }
  y1() {
    return this.y0() + this.ys()
  }
  z1() {
    return this.z0() + this.zs()
  }
}

class VolumeAcquisition {
  constructor(volume, x0, x1, y0, y1, z0, z1, level, callback, errorCallback) {
    this.volume = volume
    this.x0 = x0
    this.x1 = x1
    this.y0 = y0
    this.y1 = y1
    this.z0 = z0
    this.z1 = z1
    this.memory = new Float32Array((x1-x0) * (y1-y0) * (z1-z0))
    this.callback = callback
    this.errorCallback = errorCallback
    if (typeof errorCallback === 'undefined') {
      this.errorCallback = (err) => { console.error(err) }
    }
    this.volume.waitForInit(()=> {
      this.outstanding_subvolumes = 0
      const scale = this.volume.getScale(level)
      this.scale = scale
      const x0a = Math.floor(x0 / scale.xcs()) * scale.xcs()
      const y0a = Math.floor(y0 / scale.ycs()) * scale.ycs()
      const z0a = Math.floor(z0 / scale.zcs()) * scale.zcs()
      for (var x0b=x0a; x0b < x1; x0b += scale.xcs()) {
        const x0bb = x0b
        const x1b = Math.min(x0b + scale.xcs(), scale.x1())
        for (var y0b=y0a; y0b < y1; y0b += scale.ycs()) {
          const y0bb = y0b
          const y1b = Math.min(y0b + scale.ycs(), scale.y1())
          for (var z0b=z0a; z0b < z1; z0b += scale.zcs()) {
            const z0bb = z0b
            const z1b = Math.min(z0b + scale.zcs(), scale.z1())
            this.outstanding_subvolumes += 1
            this.volume.readBlock(x0b, x1b, y0b, y1b, z0b, z1b, level,
              (subvolume) => {
                this.saveSubvolume(subvolume, x0bb, x1b, y0bb, y1b, z0bb, z1b)
              }, this.errorCallback)
          }
        }
      }
    }, errorCallback)
  }
  xs() {
    return this.x1 - this.x0
  }
  ys() {
    return this.y1 - this.y0
  }
  zs() {
    return this.z1 - this.z0
  }
  idx(x, y, z) {
    return ((z - this.z0) * this.ys() + (y - this.y0)) * this.xs() + x - this.x0
  }
  saveSubvolume(subvolume, x0b, x1b, y0b, y1b, z0b, z1b) {
    const x0 = Math.max(this.scale.x0(), x0b)
    const x1 = Math.min(this.scale.x1(), x1b)
    const y0 = Math.max(this.scale.y0(), y0b)
    const y1 = Math.min(this.scale.y1(), y1b)
    const z0 = Math.max(this.scale.z0(), z0b)
    const z1 = Math.min(this.scale.z1(), z1b)
    for (var z=z0; z<z1; z+=1) {
      for (var y=y0; y<y1; y+=1) {
        var idx = this.idx(x0, y, z)
        for (var x=x0; x<x1; x+=1 ) {
          this.memory[idx++] = subvolume.getData(x-x0b, y-y0b, z-z0b)
        }
      }
    }
    if (--this.outstanding_subvolumes == 0) {
      this.callback(
        new THREE.Volume(this.xs(), this.ys(), this.zs(), "float", this.memory))
    }
  }
}

export class PrecomputedVolume {
  STATE_LOADING = "loading"
  STATE_ERROR = "error"
  STATE_INITIALIZED = "initialized"
  constructor(url) {
    this.url = url
    this.state = this.STATE_LOADING
    this.initCallbacks = []
    this.errCallbacks = []
    this.init()
  }

  init() {
    const info_path = this.url + "/info"
    fetch(info_path)
      .then(response => response.json(),
            (err) => this.onInitError(err))
      .then((jsonData) => this.onInfo(jsonData),
            (err) => this.onInitError(err) )
  }
  onInfo(jsonData) {
    this.data_type = jsonData["data_type"]
    this.num_channels = jsonData["num_channels"]
    this.type = jsonData["type"]
    this.scales = []
    for (var jsonScale of jsonData["scales"]) {
        this.scales.push(new Scale(jsonScale))
    }
    this.state = this.STATE_INITIALIZED
    for (var callback of this.initCallbacks) {
      callback()
    }
    this.initCallbacks = []
    this.errCallbacks = []
  }
  onInitError(err) {
    this.err = err
    for (var callback of this.errCallbacks) {
      callback(err)
    }
    this.initCallbacks = []
    this.errCallbacks = []
    this.state = this.STATE_ERROR
  }
  waitForInit(callback, errcallback) {
    if (this.state === this.STATE_LOADING) {
      this.initCallbacks.push(callback)
      if (typeof errrcallback !== 'undefined') {
        this.errCallbacks.push(errcallback)
      }
    } else if (this.state === this.STATE_INITIALIZED){
      callback()
    } else if (typeof errcallback === "function") {
      errcallback(this.err)
    }
  }
  levelToResolution(level) {
    return Math.pow(2, level-1)
  }
  getScale(level) {
    const resolution = this.levelToResolution(level)
    for (var scale of this.scales) {
      if (scale.xr() == resolution) {
        return scale
      }
    }
  }
  getLevels() {
    var levels = []
    for (var scale of this.scales) {
      levels.push(1+Math.log(scale.xr()) / Math.log(2))
    }
    levels.sort()
    return levels
  }
  readBlock(x0, x1, y0, y1, z0, z1, level, callback, errCallback) {
    var ecbk = errCallback
    if (typeof errCallback === 'undefined') {
      ecbk = (err) => { console.error(err)}
    }
    if (this.state === this.STATE_LOADING) {
      const doRead = () => {
        this.readBlock(x0, x1, y0, y1, z0, z1, level, callback, ecbk)
      }
      this.initCallbacks.push(doRead)
      this.errCallbacks.push(ecbk)
      return
    }
    const scale = this.getScale(level)
    if ((typeof scale === 'undefined') || (scale === null)) {
      ecbk("No such scale: " + level.toString())
      return
    }
    const url = this.url + "/" + scale.key + "/" +
      x0.toString() + "-" + x1.toString() + "_" +
      y0.toString() + "-" + y1.toString() + "_" +
      z0.toString() + "-" + z1.toString();
    fetch(url)
      .then((response) => response.arrayBuffer()
        .then(buffer =>
              this.onReadBlock(buffer, x1-x0, y1-y0, z1-z0, callback, ecbk),
              ecbk), ecbk)
  }
  onReadBlock(buffer, xs, ys, zs, callback, errcallback) {
    callback(new THREE.Volume(xs, ys, zs, this.data_type, buffer))
  }
  readVolume(x0, x1, y0, y1, z0, z1, level, callback, ecbk) {
    new VolumeAcquisition(this, x0, x1, y0, y1, z0, z1, level, callback, ecbk)
  }
}
