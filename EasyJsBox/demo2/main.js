let AppInstance

switch ($app.env) {
  case $env.app:
  case $env.action:
    AppInstance = require("./scripts/app-main")
    break
  case $env.today:
  case $env.notification:
  case $env.keyboard:
  case $env.siri:
    AppInstance = require("./scripts/app-lite")
    break
  case $env.widget:
    AppInstance = require("./scripts/widget")
    break

  default:
    $intents.finish($l10n("UNSUPPORTED_ENV"))
    $ui.render({
      views: [
        {
          type: "label",
          props: {
            text: $l10n("UNSUPPORTED_ENV"),
            align: $align.center
          },
          layout: $layout.fill
        }
      ]
    })
    break
}

if (AppInstance) {
  AppInstance.run()
}
