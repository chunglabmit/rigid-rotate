import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

export class UrlButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      url: this.props.url
    }
  }
  render() {
    return (
      <div>
        <Button
         variant="primary"
         onClick={ (event) => this.handleShow(event)}>
        Set {this.props.name} URL
        </Button>
        <Modal
        show={this.state.show}
        onHide = { (event)=>this.handleClose(event)}>
          <Modal.Header closeButton>
            <Modal.Title>Set {this.props.name} URL</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>URL: </label>
            <input
             type="text"
             size="50"
             value={this.state.url}
             onChange={(event)=>{
               this.setState({
                 show: this.state.show,
                 url: event.target.value
               })
             }}/>
          </Modal.Body>
          <Modal.Footer>
            <Button
             variant="secondary"
             onClick={ (event)=>this.handleClose(event)}>
             Close
            </Button>
            <Button
             variant="primary"
             onClick={ (event)=>{
                  if (this.state.url != this.props.url) {
                    this.props.onURLChange(this.state.url)
                  }
                  this.handleClose(event)
                }
             }>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
  handleShow(event) {
    this.setState({
      show: true,
      url: this.state.url
    })
  }
  handleClose(event) {
    this.setState({
      show: false,
      url: this.state.url
    })
  }
}

UrlButton.propTypes = {
  onURLChange: PropTypes.func,
  url: PropTypes.string,
  name: PropTypes.string
}

UrlButton.defaultProps = {
  onURLChange: (url) => {},
  url: "https://leviathan-chunglab.mit.edu/precomputed",
  name: ""
}
