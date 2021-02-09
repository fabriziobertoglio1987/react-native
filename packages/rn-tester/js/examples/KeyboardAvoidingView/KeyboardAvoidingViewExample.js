/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const React = require('react');
const {
  Keyboard,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Pressable,
  TouchableOpacity,
  View,
} = require('react-native');

const {useState} = require('react');

const onButtonPress = () => {
  Alert.alert('Successfully Registered!');
};

function readableKeyboard(keyboardFrame) {
  if (!keyboardFrame) {
    return '';
  }
  return `H: ${Math.round(keyboardFrame.height)}, Y: ${Math.round(
    keyboardFrame.screenY,
  )}`;
}

function readableView(viewFrame) {
  if (!viewFrame) {
    return '';
  }
  return `H: ${Math.round(viewFrame.height)}, Y: ${Math.round(viewFrame.y)}`;
}

class DebugKeyboardAvoidingView extends React.Component {
  state = {padding: 0};

  _subscriptions = [];
  viewRefGet = React.createRef();
  viewFrame = undefined;
  endKeyboardFrame = undefined;

  onViewLayout = () => {
    if (!this.viewRefGet.current) {
      return;
    }
    this.viewRefGet.current.measureInWindow(this.onViewMeasure);
  };

  onViewMeasure = (x, y, width, height) => {
    if (height > 0) {
      this.viewFrame = {x, y, width, height};
      this.updatePadding();
    }
  };

  updatePadding() {
    this.setState({padding: this.calculatePadding()});
  }

  calculatePadding() {
    if (!this.viewFrame || !this.endKeyboardFrame) {
      return 0;
    }
    return this.endKeyboardFrame.height;
  }

  handleKeyboardEvent(ev) {
    console.log(`ev`, ev)
    this.endKeyboardFrame = ev.endCoordinates;
    this.startKeyboardFrame = ev.startCoordinates;
    if (ev.duration) {
      LayoutAnimation.animateUpdate(ev.duration);
    }
    this.updatePadding();
  }

  handleKeyboardWillChangeFrameAndroid = (ev) => {
    if (!ev) {
      this.endKeyboardFrame = undefined;
      this.updatePadding();
      return;
    }

    this.handleKeyboardEvent(ev);
  };

  handleKeyboardWillChangeFrameIOS = (ev) => {
    this.handleKeyboardEvent(ev);
  };

  componentDidMount() {
    this._subscriptions = [
      Keyboard.addListener(
        'keyboardDidShow',
        this.handleKeyboardWillChangeFrameAndroid,
      ),
      Keyboard.addListener(
        'keyboardDidHide',
        this.handleKeyboardWillChangeFrameAndroid,
      ),
    ];
    this.updatePadding();
  }

  componentWillUnmount() {
    this._subscriptions.forEach((subscription) => {
      subscription.remove();
    });
  }

  renderDebug() {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'red',
            top: 0,
            right: 0,
            width: 40,
            height: this.state.padding,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 40,
            backgroundColor: 'green',
            maxWidth: 200,
          }}>
          <Text style={{color: 'white'}}>
            <Text>SAFE AREA KEYBOARD{'\n'}</Text>
            <Text>
              PADDING: {Math.round(this.state.padding)}
              {'\n'}
            </Text>
            <Text>
              KEYBOARD END: {readableKeyboard(this.endKeyboardFrame)}
              {'\n'}
            </Text>
            <Text>
              VIEW: {readableView(this.viewFrame)}
              {'\n'}
            </Text>
          </Text>
        </View>
      </>
    );
  }

  render() {
    const {children, ...props} = this.props;
    return (
      <View
        {...props}
        ref={this.viewRefGet}
        style={[
          this.props.style,
          {paddingBottom: this.state.padding, flexGrow: 1},
        ]}
        onLayout={this.onViewLayout}>
        {children}
        {this.renderDebug()}
      </View>
    );
  }
}

const TextInputForm = () => {
  return (
    <View>
      <TextInput placeholder="Email" style={styles.textInput} />
      <TextInput placeholder="Username" style={styles.textInput} />
      <TextInput placeholder="Password" style={styles.textInput} />
      <TextInput placeholder="Confirm Password" style={styles.textInput} />
      <Button title="Register" onPress={onButtonPress} />
    </View>
  );
};

const CloseButton = props => {
  return (
    <View
      style={[
        styles.closeView,
        {marginHorizontal: props.behavior === 'position' ? 0 : 25},
      ]}>
      <Pressable
        onPress={() => props.setModalOpen(false)}
        style={styles.closeButton}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
};

const KeyboardAvoidingViewBehaviour = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [behavior, setBehavior] = useState('padding');
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        <DebugKeyboardAvoidingView>
          <TextInput autoFocus />
          <View style={{flex: 1}} />
          <View style={{height: 40, backgroundColor: 'black', width: '100%'}} />
        </DebugKeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const KeyboardAvoidingDisabled = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <View style={styles.outerContainer}>
      <Modal animationType="fade" visible={modalOpen}>
        <KeyboardAvoidingView
          enabled={false}
          behavior={'height'}
          style={styles.container}>
          <CloseButton behavior={'height'} setModalOpen={setModalOpen} />
          <TextInputForm />
        </KeyboardAvoidingView>
      </Modal>
      <View>
        <Pressable onPress={() => setModalOpen(true)}>
          <Text>Open Example</Text>
        </Pressable>
      </View>
    </View>
  );
};

const KeyboardAvoidingVerticalOffset = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <View style={styles.outerContainer}>
      <Modal animationType="fade" visible={modalOpen}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={20}
          behavior={'padding'}
          style={styles.container}>
          <CloseButton behavior={'height'} setModalOpen={setModalOpen} />
          <TextInputForm />
        </KeyboardAvoidingView>
      </Modal>
      <View>
        <Pressable onPress={() => setModalOpen(true)}>
          <Text>Open Example</Text>
        </Pressable>
      </View>
    </View>
  );
};

const KeyboardAvoidingContentContainerStyle = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <View>
      <Modal animationType="fade" visible={modalOpen}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={20}
          behavior={'position'}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <CloseButton behavior={'height'} setModalOpen={setModalOpen} />
          <TextInputForm />
        </KeyboardAvoidingView>
      </Modal>
      <View>
        <Pressable onPress={() => setModalOpen(true)}>
          <Text>Open Example</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  contentContainer: {
    paddingTop: 20,
    backgroundColor: '#abdebf',
  },
  textInput: {
    borderRadius: 5,
    borderWidth: 1,
    height: 44,
    width: 300,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeView: {
    alignSelf: 'stretch',
  },
  pillStyle: {
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'blue',
  },
  closeButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
    padding: 10,
  },
});

exports.title = 'KeyboardAvoidingView';
exports.description =
  'Base component for views that automatically adjust their height or position to move out of the way of the keyboard.';
exports.examples = [
  {
    title: 'Keyboard Avoiding View with different behaviors',
    description: ('Specify how to react to the presence of the keyboard. Android and iOS both interact' +
      'with this prop differently. On both iOS and Android, setting behavior is recommended.': string),
    render(): React.Node {
      return <KeyboardAvoidingViewBehaviour />;
    },
  },
];
