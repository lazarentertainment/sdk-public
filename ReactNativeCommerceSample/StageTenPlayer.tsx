import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { View } from 'react-native';

export const stageTenOrigin = 'https://sandbox-player.stageten.tv'

export interface PlayerProps {
  uri: string
  onMessage: (message: object) => void
}

export class StageTenPlayer extends Component<PlayerProps> {

  state = {
    aspectRatio: 0,
    uri: ''
  }
  
  webviewRef: WebView | null = null
  onMessage: (message: object) => void

  constructor(props: any) {
    super(props)
    this.onMessage = (message: any) => {
      if (message.name === 'stageten_init' || message.name === 'aspect_ratio_change') {
        this.setAspectRatio(message.payload.aspectRatio)
      }
      props.onMessage(message)
    }
    this.state.aspectRatio = props.aspectRatio
    this.state.uri = props.uri
  }

  setAspectRatio(aspectRatio: string) {
    this.setState({ aspectRatio: parseAspectRatio(aspectRatio) })
  }

  sendAction(message: object) {
    const json = JSON.stringify(message)
    console.log(`sending message ${json}`)

    this.webviewRef?.injectJavaScript(`
      window.postMessage(${json}, '*')
      true
    `)
  }

  render() {
    return <View
      style ={this.state.aspectRatio ? {
        aspectRatio: this.state.aspectRatio,
        width: '100%',
        maxHeight: '50%',
        alignSelf: 'center'
      } : null}
    >
      <WebView
        ref={(ref) => (this.webviewRef = ref)}
        source={{ uri: this.state.uri }}
        onMessage={(event) => this.onMessage(JSON.parse(event.nativeEvent.data))}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        injectedJavaScriptBeforeContentLoaded={`
          window.addEventListener('message', (event) => {
            if (event.origin !== '${stageTenOrigin}') {
              return
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(event.data))
          })
        `}
      />
    </View>
  }
}

function parseAspectRatio(aspectRatio: string): number {
  try {
    const [horizontal, vertical] = aspectRatio.split(':')
    return parseInt(horizontal) / parseInt(vertical)
  } catch (e) {
    console.error('parseAspectRatio failed', e)
    throw e
  }
}