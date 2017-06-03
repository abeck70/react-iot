import ReactFiberReconciler from 'react-dom/lib/ReactFiberReconciler';
import { injectInternals } from 'react-dom/lib/ReactFiberDevToolsHook';
import { createElement, setInitialProperties, updateProperties } from './ReactIoTComponent';
import { setPayloadForPin } from './ReactIoTStore';
import { Platforms } from '../config/Platforms';


const LOG_STEPS = false;
const log = (a, b, c) => {
  if (LOG_STEPS) {
    console.log(a, b, c);
  }
};

const toJSON = (node) => {
  const props = node.props;
  if (typeof props.toJSON === 'function') {
    return props.toJSON(props);
  }

  let children = null;
  if (props.children) {
    if (Array.isArray(props.children)) {
      children = props.children.map(toJSON);
    } else if (props.children) {
      children = toJSON(props.children);
    }
    return Object.assign({}, props, {children});
  } else {
    const clone = Object.assign({}, props);
    delete clone.children;
    return clone;
  }
};

const ReactIoTReconciler = ReactFiberReconciler({

  // the tree creation and updating methods. If you’re familiar with the DOM API
  // this will look familiar

createInstance(
  type,
  props,
  rootContainerInstance,
  hostContext,
  internalInstanceHandle
) {
  console.log("Create instance", type, props, rootContainerInstance, hostContext, internalInstanceHandle)
  if (props.toJSON) {
    return props.toJSON(props);
  } else {
    return toJSON({props});
  }
},

  // this is called instead of `appendChild` when the parentInstance is first
  // being created and mounted
  // added in https://github.com/facebook/react/pull/8400/
  appendInitialChild(
    parentInstance,
    child
  ) {
    log('appendInitialChild', child);
  },


  appendChild(
    parentInstance,
    child
  ){
    log('appendChild', child);
  },

  removeChild(
    parentInstance,
    child
  ) {
    log('removeChild', child);
  },

  insertBefore(
    parentInstance,
    child,
    beforeChild
  ) {
    log('insertBefore');
    // parentInstance.insertBefore(child, beforeChild);
  },

  // finalizeInitialChildren is the final HostConfig method called before
  // flushing the root component to the host environment

  finalizeInitialChildren(
    instance,
    type,
    props,
    rootContainerInstance
  ) {
    log('finalizeInitialChildren');
    // setInitialProperties(instance, type, props, rootContainerInstance);
    return false;
  },

  // prepare update is where you compute the diff for an instance. This is done
  // here to separate computation of the diff to the applying of the diff. Fiber
  // can reuse this work even if it pauses or aborts rendering a subset of the
  // tree.

  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext
  ){
    log('TODO: prepareUpdate');
    return null;
    // return diffProperties(instance, type, oldProps, newProps, rootContainerInstance, hostContext);
  },

  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    internalInstanceHandle,
  ) {
    // Apply the diff to the DOM node.
    // updateProperties(instance, updatePayload, type, oldProps, newProps);
    log('TODO: updateProperties');
  },

  // commitMount is called after initializeFinalChildren *if*
  // `initializeFinalChildren` returns true.

  commitMount(
    instance,
    type,
    newProps,
    internalInstanceHandle
  ) {
    log('commitMount');
    // noop
  },

  // HostContext is an internal object or reference for any bookkeeping your
  // renderer may need to do based on current location in the tree. In DOM this
  // is necessary for calling the correct `document.createElement` calls based
  // upon being in an `html`, `svg`, `mathml`, or other context of the tree.

  getRootHostContext(rootContainerInstance) {
    log('getRootHostContext');
    return emptyObject;
  },

  getChildHostContext(parentHostContext, type) {
    log('getChildHostContext');
    return emptyObject;
  },

  // getPublicInstance should be the identity function in 99% of all scenarios.
  // It was added to support the `getNodeMock` functionality for the
  // TestRenderers.

  getPublicInstance(instance) {
    log('getPublicInstance');
    if (instance == null) {
      return null;
    }
    console.log(instance)
    return instance != null && instance.props.toJSON(instance);
  },

  // the prepareForCommit and resetAfterCommit methods are necessary for any
  // global side-effects you need to trigger in the host environment. In
  // ReactDOM this does things like disable the ReactDOM events to ensure no
  // callbacks are fired during DOM manipulations

  prepareForCommit() {
    log('prepareForCommit');
    // noop
  },

  resetAfterCommit() {
    log('resetAfterCommit');
    // noop
  },

  // the following four methods are regarding TextInstances. In our example
  // renderer we don’t have specific text nodes like the DOM does so we’ll just
  // noop all of them.

  shouldSetTextContent(props) {
    log('shouldSetTextContent');
    return false
  },

  resetTextContent(instance) {
    log('resetTextContent');
    // noop
  },

  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    log('createTextInstance');
    return null;
  },

  commitTextUpdate(
    textInstance,
    oldText,
    newText
  ) {
    log('commitTextUpdate');
    // noop
    throw new Error('commitTextUpdate should not be called');
  },

  scheduleAnimationCallback() {
    log('scheduleAnimationCallback');
  },

  scheduleDeferredCallback() {
    log('scheduleDeferredCallback');
  },

   shouldDeprioritizeSubtree() {
     return false;
   },

  useSyncScheduling: true,
});



const emptyObject = {};
const Containers = new Map();
const defaultContainer = {};


export class ReactIoTRenderer {


  renderIntoContainer(
    element,
    container,
    callback
  ) {
    const containerKey = typeof container === 'undefined' ? defaultContainer : container;
    let root = Containers.get(containerKey)
    if (!root) {
      root = ReactIoTReconciler.createContainer(containerKey);
      Containers.set(container, root);
    }
    ReactIoTReconciler.updateContainer(element, root, null, callback);
    return ReactIoTReconciler.getPublicRootInstance(root);
  }

  unmountComponentAtNode(container) {
    const containerKey = typeof container === 'undefined' ? defaultContainer : container;
    const root = Containers.get(containerKey);
    if (root) {
      ReactIoTReconciler.updateContainer(null, root, null, () => {
        Containers.delete(container);
      });
    }
  }

  render(element, container, callback){
    return this.renderIntoContainer(element, container, callback);
  }
}
