import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { storeShape, subscriptionShape } from '../utils/PropTypes'
import warning from '../utils/warning'

let didWarnAboutReceivingStore = false
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return
  }
  didWarnAboutReceivingStore = true

  warning(
    '<Provider> does not support changing `store` on the fly. ' +
    'It is most likely that you see this error because you updated to ' +
    'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
    'automatically. See https://github.com/reactjs/react-redux/releases/' +
    'tag/v2.0.0 for the migration instructions.'
  )
}

export function createProvider(storeKey = 'store', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`

    class Provider extends Component {
        getChildContext() {
          let childContext = {
              [storeKey]: this[storeKey],
              [subscriptionKey]: null
          }

          if(this.global){
              childContext["global"] = this["global"];
          }

          return childContext;
        }

        constructor(props, context) {
          super(props, context)
          this[storeKey] = props.store;
          //Adds a global data store when a optional global data store is passed
          if(props.global){
            this["global"] = props.global;
          }
        }

        render() {
          return Children.only(this.props.children)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore()
        }
      }
    }

    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
        global: PropTypes.object
    }
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        ["global"]: PropTypes.object,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}

export default createProvider()
