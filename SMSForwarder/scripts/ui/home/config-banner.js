const API_FEATURE_KEYS = [
  ["enable_api_sms_send", "FEATURE_SMS_SEND"],
  ["enable_api_sms_query", "FEATURE_SMS_QUERY"],
  ["enable_api_call_query", "FEATURE_CALL_QUERY"],
  ["enable_api_contact_query", "FEATURE_CONTACT_QUERY"],
  ["enable_api_battery_query", "FEATURE_BATTERY"],
  ["enable_api_wol", "FEATURE_WOL"]
]

const BANNER_ID = "homeConfigBanner"
const LABEL_ID = "homeConfigInfo"

function formatEnabledApis(config) {
  const names = API_FEATURE_KEYS.filter(([key]) => config[key]).map(([, titleKey]) => $l10n(titleKey))

  if (names.length === 0) {
    return $l10n("CONFIG_BANNER_NONE_ENABLED")
  }

  return `${$l10n("CONFIG_BANNER_ENABLED")}: ${names.join($l10n("LIST_SEPARATOR"))}`
}

function formatConfigSummary(config) {
  const lines = []

  if (config.extra_device_mark) {
    lines.push(`${$l10n("CONFIG_BANNER_DEVICE")}: ${config.extra_device_mark}`)
  }
  if (config.extra_sim1) {
    lines.push(`SIM1: ${config.extra_sim1}`)
  }
  if (config.extra_sim2) {
    lines.push(`SIM2: ${config.extra_sim2}`)
  }

  lines.push(formatEnabledApis(config))

  return lines.join("\n")
}

async function refreshConfigBanner(kernel) {
  const label = $(LABEL_ID)
  if (!label) {
    return
  }

  const baseUrl = (kernel.setting.get("server.baseUrl", "") || "").trim()
  if (!baseUrl) {
    label.text = $l10n("CONFIG_BANNER_NO_SERVER")
    label.textColor = $color("secondaryLabel")
    $(BANNER_ID)?.relayout()
    return
  }

  label.text = $l10n("LOADING")
  label.textColor = $color("secondaryLabel")

  try {
    const config = await kernel.serverConfig.fetch({ force: false })
    label.text = formatConfigSummary(config)
    label.textColor = $color("primaryText")
  } catch (error) {
    kernel.logger?.error(error)
    label.text = `${$l10n("CONFIG_BANNER_FETCH_FAILED")}\n${error.message || ""}`.trim()
    label.textColor = $color("systemRed")
  }

  $(BANNER_ID)?.relayout()
}

function getConfigBannerView() {
  return {
    type: "view",
    props: {
      id: BANNER_ID,
      bgcolor: $color("secondarySurface"),
      cornerRadius: 14,
      smoothCorners: true,
      borderWidth: 0.5,
      borderColor: $color("separator")
    },
    views: [
      {
        type: "label",
        props: {
          id: LABEL_ID,
          lines: 0,
          font: $font(14),
          text: $l10n("CONFIG_BANNER_NO_SERVER"),
          textColor: $color("secondaryLabel")
        },
        layout: (make, view) => {
          make.top.left.right.equalTo(view.super).inset(12)
          make.bottom.equalTo(view.super).inset(12)
        }
      }
    ],
    layout: (make, view) => {
      make.top.equalTo(view.super).offset(10)
      make.left.right.equalTo(view.super).inset(16)
    }
  }
}

module.exports = {
  getConfigBannerView,
  refreshConfigBanner
}
