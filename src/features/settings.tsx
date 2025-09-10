import { useState, useEffect } from "react"

interface Settings {
  autoScan: boolean
  notifications: boolean
  scanInterval: number
  showWarnings: boolean
}

export const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    autoScan: false,
    notifications: true,
    scanInterval: 30,
    showWarnings: true
  })

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['extensionSettings'], (result) => {
      if (result.extensionSettings) {
        setSettings(result.extensionSettings)
      }
    })
  }, [])

  const updateSetting = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    await chrome.storage.local.set({ extensionSettings: newSettings })
  }

  return (
    <div className="plasmo-relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="plasmo-p-2 plasmo-rounded-xl plasmo-bg-white/20 hover:plasmo-bg-white/30 plasmo-transition-colors"
        title="Settings"
      >
        <svg className="plasmo-w-5 plasmo-h-5 plasmo-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="plasmo-absolute plasmo-right-0 plasmo-top-12 plasmo-w-80 plasmo-bg-white plasmo-rounded-xl plasmo-shadow-lg plasmo-border plasmo-border-gray-200 plasmo-p-4 plasmo-z-50">
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-4">
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-800">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="plasmo-p-1 plasmo-rounded-lg hover:plasmo-bg-gray-100"
            >
              <svg className="plasmo-w-4 plasmo-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="plasmo-space-y-4">
            {/* Auto Scan Toggle */}
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
              <div>
                <label className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700">Auto Scan</label>
                <p className="plasmo-text-xs plasmo-text-gray-500">Automatically scan products on page load</p>
              </div>
              <button
                onClick={() => updateSetting('autoScan', !settings.autoScan)}
                className={`plasmo-relative plasmo-inline-flex plasmo-h-6 plasmo-w-11 plasmo-flex-shrink-0 plasmo-cursor-pointer plasmo-rounded-full plasmo-border-2 plasmo-border-transparent plasmo-transition-colors plasmo-duration-200 plasmo-ease-in-out focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-ring-offset-2 ${
                  settings.autoScan ? 'plasmo-bg-blue-600' : 'plasmo-bg-gray-200'
                }`}
              >
                <span
                  className={`plasmo-pointer-events-none plasmo-inline-block plasmo-h-5 plasmo-w-5 plasmo-transform plasmo-rounded-full plasmo-bg-white plasmo-shadow plasmo-ring-0 plasmo-transition plasmo-duration-200 plasmo-ease-in-out ${
                    settings.autoScan ? 'plasmo-translate-x-5' : 'plasmo-translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
              <div>
                <label className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700">Notifications</label>
                <p className="plasmo-text-xs plasmo-text-gray-500">Show notifications for scan results</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', !settings.notifications)}
                className={`plasmo-relative plasmo-inline-flex plasmo-h-6 plasmo-w-11 plasmo-flex-shrink-0 plasmo-cursor-pointer plasmo-rounded-full plasmo-border-2 plasmo-border-transparent plasmo-transition-colors plasmo-duration-200 plasmo-ease-in-out focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-ring-offset-2 ${
                  settings.notifications ? 'plasmo-bg-blue-600' : 'plasmo-bg-gray-200'
                }`}
              >
                <span
                  className={`plasmo-pointer-events-none plasmo-inline-block plasmo-h-5 plasmo-w-5 plasmo-transform plasmo-rounded-full plasmo-bg-white plasmo-shadow plasmo-ring-0 plasmo-transition plasmo-duration-200 plasmo-ease-in-out ${
                    settings.notifications ? 'plasmo-translate-x-5' : 'plasmo-translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Scan Interval */}
            <div>
              <label className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700">Scan Interval (seconds)</label>
              <div className="plasmo-mt-2 plasmo-flex plasmo-items-center plasmo-space-x-2">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={settings.scanInterval}
                  onChange={(e) => updateSetting('scanInterval', parseInt(e.target.value))}
                  className="plasmo-flex-1 plasmo-h-2 plasmo-bg-gray-200 plasmo-rounded-lg plasmo-appearance-none plasmo-cursor-pointer"
                />
                <span className="plasmo-text-sm plasmo-text-gray-600 plasmo-w-12">{settings.scanInterval}s</span>
              </div>
            </div>

            {/* Show Warnings Toggle */}
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
              <div>
                <label className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700">Show Warnings</label>
                <p className="plasmo-text-xs plasmo-text-gray-500">Display warning messages for flagged content</p>
              </div>
              <button
                onClick={() => updateSetting('showWarnings', !settings.showWarnings)}
                className={`plasmo-relative plasmo-inline-flex plasmo-h-6 plasmo-w-11 plasmo-flex-shrink-0 plasmo-cursor-pointer plasmo-rounded-full plasmo-border-2 plasmo-border-transparent plasmo-transition-colors plasmo-duration-200 plasmo-ease-in-out focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-ring-offset-2 ${
                  settings.showWarnings ? 'plasmo-bg-blue-600' : 'plasmo-bg-gray-200'
                }`}
              >
                <span
                  className={`plasmo-pointer-events-none plasmo-inline-block plasmo-h-5 plasmo-w-5 plasmo-transform plasmo-rounded-full plasmo-bg-white plasmo-shadow plasmo-ring-0 plasmo-transition plasmo-duration-200 plasmo-ease-in-out ${
                    settings.showWarnings ? 'plasmo-translate-x-5' : 'plasmo-translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="plasmo-mt-6 plasmo-pt-4 plasmo-border-t plasmo-border-gray-200">
            <button
              onClick={() => {
                const defaultSettings = {
                  autoScan: false,
                  notifications: true,
                  scanInterval: 30,
                  showWarnings: true
                }
                setSettings(defaultSettings)
                chrome.storage.local.set({ extensionSettings: defaultSettings })
              }}
              className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-text-sm plasmo-text-gray-600 plasmo-bg-gray-100 hover:plasmo-bg-gray-200 plasmo-rounded-lg plasmo-transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
