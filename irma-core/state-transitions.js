/**
 * This file defines the states for the state machine, plus the different valid
 * transitions to other states from each state.
 *
 * The transition 'fail' is a special one, and will (also) be triggered if we
 * try to apply an invalid transition from that state.
 */

module.exports = {

  startState:       'Uninitialized',

  Uninitialized: {
    initialize:     'Loading',
    browserError:   'BrowserNotSupported',
    fail:           'Error'
  },

  Loading: {
    loaded:         'MediumContemplation',
    cancel:         'Cancelled', // To allow plugins to cancel this state
    fail:           'Error'
  },

  MediumContemplation: {
    showQRCode:     'ShowingQRCode',
    showIrmaButton: 'ShowingIrmaButton',
    cancel:         'Cancelled', // To allow plugins to cancel this state
    fail:           'Error'
  },

  ShowingQRCode: {
    appConnected:   'ContinueOn2ndDevice',
    cancel:         'Cancelled', // To allow plugins to cancel this state
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ContinueOn2ndDevice: {
    succeed:        'Success',
    cancel:         'Cancelled',
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ShowingIrmaButton: {
    chooseQR:       'ShowingQRCodeInstead',
    appConnected:   'ContinueInIrmaApp',
    fail:           'Error',

    succeed:        'Success',   // We sometimes miss the appConnected transition
    cancel:         'Cancelled', // on iOS, that's why these transitions are here
    timeout:        'TimedOut'   // too. So we don't 'fail' to the Error state.
  },

  ShowingQRCodeInstead: {
    appConnected:   'ContinueOn2ndDevice',
    cancel:         'Cancelled', // To allow plugins to cancel this state
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ContinueInIrmaApp: {
    succeed:        'Success',
    cancel:         'Cancelled',
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  Cancelled: {
    restart:        'Loading'
  },

  TimedOut: {
    cancel:         'Cancelled', // To allow plugins to cancel this state
    restart:        'Loading'
  },

  Error: {
    cancel:         'Cancelled', // To allow plugins to cancel this state
    restart:        'Loading'
  },

  // End states
  BrowserNotSupported: {},
  Success: {}

}
