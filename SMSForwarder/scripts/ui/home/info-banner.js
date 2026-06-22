const CONFIG_FEATURES = [
  { key: "enable_api_sms_send", titleKey: "FEATURE_SMS_SEND" },
  { key: "enable_api_sms_query", titleKey: "FEATURE_SMS_QUERY" },
  { key: "enable_api_call_query", titleKey: "FEATURE_CALL_QUERY" },
  { key: "enable_api_contact_query", titleKey: "FEATURE_CONTACT_QUERY" },
  { key: "enable_api_battery_query", titleKey: "FEATURE_BATTERY" },
  { key: "enable_api_wol", titleKey: "FEATURE_WOL" }
]

const BANNER_ID = "homeConfigBanner"
const TEXT_ID = "homeConfigText"

function hasServerUrl(kernel) {
  return Boolean((kernel.setting.get("server.baseUrl", "") || "").trim())
}

function formatConfigSummary(config) {
  const lines = []

  if (config.extra_device_mark) {
    lines.push(config.extra_device_mark)
  }
  if (config.extra_sim1) {
    lines.push(`SIM1  ${config.extra_sim1}`)
  }
  if (config.extra_sim2) {
    lines.push(`SIM2  ${config.extra_sim2}`)
  }

  const enabled = CONFIG_FEATURES.filter(item => config[item.key]).map(item => $l10n(item.titleKey))
  if (enabled.length > 0) {
    lines.push(enabled.join(" · "))
  }

  return lines.length > 0 ? lines.join("\n") : $l10n("HOME_CONFIG_EMPTY")
}

function setBannerText(text, color = "primaryText") {
  const label = $(TEXT_ID)
  if (label) {
    label.text = text
    label.textColor = $color(color)
  }
  $(BANNER_ID)?.relayout?.()
}

async function refreshInfoBanner(kernel, { force = false } = {}) {
  if (!hasServerUrl(kernel)) {
    setBannerText($l10n("HOME_CONFIG_PLACEHOLDER_NO_SERVER"), "secondaryLabel")
    return
  }

  setBannerText($l10n("LOADING"), "secondaryLabel")

  try {
    const config = await kernel.serverConfig.fetch({ force })
    setBannerText(formatConfigSummary(config), "primaryText")
  } catch (error) {
    const message = error?.message || String(error)
    setBannerText(`${$l10n("HOME_CONFIG_FETCH_FAILED")}\n${message}`, "systemRed")
  }
}

function getInfoBannerView(kernel) {
  const placeholder = hasServerUrl(kernel) ? $l10n("LOADING") : $l10n("HOME_CONFIG_PLACEHOLDER_NO_SERVER")

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
          text: $l10n("HOME_CONFIG_TITLE"),
          font: $font("bold", 14),
          textColor: $color("primaryText")
        },
        layout: (make, view) => {
          make.top.left.right.inset(14)
        }
      },
      {
        type: "label",
        props: {
          id: TEXT_ID,
          lines: 0,
          text: placeholder,
          font: $font(13),
          textColor: $color("secondaryLabel")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(6)
          make.left.right.bottom.inset(14)
        }
      }
    ],
    layout: (make, view) => {
      make.top.equalTo(view.super).offset(10)
      make.left.right.equalTo(view.super).inset(16)
    },
    events: {
      tapped: () => refreshInfoBanner(kernel, { force: true })
    }
  }
}

module.exports = {
  getInfoBannerView,
  refreshInfoBanner
}
