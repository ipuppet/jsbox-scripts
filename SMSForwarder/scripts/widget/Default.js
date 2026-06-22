class Widget {
  constructor(kernel) {
    this.kernel = kernel
  }

  render() {
    $widget.setTimeline({
      render: () => ({
        type: "text",
        props: {
          text: "SMSForwarder"
        }
      })
    })
  }
}

module.exports = { Widget }
