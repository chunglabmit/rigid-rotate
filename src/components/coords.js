import React from 'react'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'

var defaultOnCoords = (data) => {}

export class Coords extends React.Component {
  render() {
    return (
      <button>
      <Dropzone onDrop={acceptedFiles=> this.onDrop(acceptedFiles)}>
      {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              Drop {this.props.name} coordinates file here or click to pick
              files
            </div>
          </section>
        )}
      </Dropzone>
      </button>
  )
  }
  onDrop(acceptedFiles) {
    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      const data = JSON.parse(reader.result)
      this.props.onCoords(data)
    }
    reader.readAsText(acceptedFiles[0]);
  }
}
Coords.propTypes = {
  onCoords: PropTypes.func,
  name: PropTypes.string.isRequired
}
Coords.defaultProps = {
onCoords: defaultOnCoords
}
