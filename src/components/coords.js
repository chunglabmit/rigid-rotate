import React from 'react'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'

var defaultOnCoords = (data) => {}

export class Coords extends React.Component {
  render() {
    return (
      <Button variant="primary">
      <Dropzone onDrop={acceptedFiles=> this.onDrop(acceptedFiles)}>
      {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              Set {this.props.name} coordinates
            </div>
          </section>
        )}
      </Dropzone>
    </Button>
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
