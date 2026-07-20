class Widget {
  constructor(kernel) {
    this.kernel = kernel
  }

  render() {
    $widget.setTimeline({
      render: () => ({
        type: "text",
        props: {
          text: "{{APP_NAME}}"
        }
      })
    })
  }
}

module.exports = { Widget }
