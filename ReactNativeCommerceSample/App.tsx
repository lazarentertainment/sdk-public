import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { Component, useState } from 'react';
import { Button, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StageTenPlayer, stageTenOrigin } from './StageTenPlayer';

// Replace this with your Stage TEN channel id
const channelId = 'YOUR_CHANNEL_ID_HERE'
const playerUri = `${stageTenOrigin}/sdk/${channelId}`

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  chatInputRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  logList: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  logItem: {
    backgroundColor: '#EEE',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    aspectRatio: 1,
  },
})

function prettyPrint(obj: any) {
  return JSON.stringify(obj, null, 2)
}

function LogItem({ text }) {
  return <Text style={styles.logItem}>{text}</Text>
}

function ChatScreen({
  logMessages,
  messages,
  userHasJoinedChat,
  onSendChatClick,
  onJoinChatClick,
}) {
  const [chatInputValue, setChatInputValue] = useState('')
  const [chatUsernameValue, setChatUsernameValue] = useState('')

  let chatInputs
  if (userHasJoinedChat) {
    chatInputs = (
      <View style={styles.chatInputRow}>
        <TextInput
          placeholder='Chat here...'
          value={chatInputValue}
          onChangeText={setChatInputValue}
        />
        <Button
          title='Send Chat'
          onPress={() => {
            onSendChatClick(chatInputValue)
            setChatInputValue('')
          }}
          disabled={chatInputValue.trim() == ''}
        />
      </View>
    )
  } else {
    chatInputs = (
      <View style={styles.chatInputRow}>
        <TextInput
          placeholder='Enter your name...'
          value={chatUsernameValue}
          onChangeText={setChatUsernameValue}
        />
        <Button
          title='Join Chat'
          onPress={() => {
            onJoinChatClick(chatUsernameValue)
          }}
          disabled={chatUsernameValue.trim() == ''}
        />
      </View>
    )
  }
  return (
    <>
      {chatInputs}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function CommerceScreen({
  logMessages,
  saleActive,
  saleProducts,
}) {
  let productsView = null
  if (saleProducts) {
    productsView = <FlatList
      data={saleProducts}
      renderItem={({item}) => {
        return (
          <Image
            style={styles.image}
            source={{
              uri: item.images?.edges[0]?.node.originalSrc,
            }}
          />
        )
      }}
      extraData={saleProducts}
      horizontal={true}
    />
  }
  return (
    <>
      {productsView}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function VotingScreen({
  logMessages,
  activeQuestion,
  onVote
}) {
  let answerButtons;
  if (activeQuestion != null) {
    answerButtons = (
      <View style={{ padding: 10 }}>
        {
          activeQuestion.answers.map((answer: any, index: number) => {
            return (
              <View
                style={index ? { marginTop: 10 } : {}}
                key={answer.id}
              >
                <Button
                  title={answer.text}
                  onPress={() => onVote(answer)}
                />
              </View>
            )
          })
        }
      </View>
    )
  }

  return (
    <>
      {answerButtons}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function InvertedFlatList({
  style,
  data,
  renderItem,
}) {
  return (
    <FlatList
      style={style}
      data={[...data].reverse()}
      renderItem={renderItem}
      extraData={data}
      inverted={true}
    />
  )
}

const Tab = createBottomTabNavigator()

export default class App extends Component {
  playerRef: StageTenPlayer

  state = {
    aspectRatio: '',
    voting: {
      activeQuestion: null,
      log: [],
    },
    chat: {
      messages: [],
      log: []
    },
    userHasJoinedChat: false,
    commerce: {
      saleActive: false,
      saleProducts: null,
      log: [],
    },
  };

  get activeQuestion(): any {
    return this.state.voting.activeQuestion
  }

  sendAction = (action: object) => {
    console.log(`sending action ${prettyPrint(action)}`)
    this.playerRef?.sendAction(action)
  };

  onMessage = (data: any) => {
    console.log(`Received event=${prettyPrint(data)}`)

    if (data.name === 'stageten_init') {
      this.sendAction({
        action: 'getstate'
      });
    }

    if (data.name === 'stageten_init' || data.name === 'aspect_ratio_change') {
      this.setState({
        aspectRatio: data.payload.aspectRatio,
      })
    }

    if (data.name === 'state') {
      this.setState((state: any) => {
        return {
          voting: {
            ...state.voting,
            ...(data.payload.voting || {})
          }
        }
      });
    }

    if (data.name === 'voting_activequestionchange') {
      this.setState((state: any) => {
        return {
          voting: {
            ...state.voting,
            activeQuestion: data.payload.activeQuestion,
            log: [...state.voting.log, `received message: ${prettyPrint(data)}`],
          },
        };
      });
    }

    if (data.name === 'chat_messages') {
      this.setState((state: any) => {
        return {
          chat: {
            ...state.chat,
            messages: data.payload.messages,
            log: [...state.chat.log, `received message: ${prettyPrint(data)}`],
          },
        };
      });
    }

    if (data.name === 'commerce_saleproducts') {
      this.setState((state: any) => {
        return {
          commerce: {
            ...state.commerce,
            saleProducts: data.payload.saleProducts,
            log: [...state.commerce.log, `received message: ${prettyPrint(data)}`],
          },
        }
      })
    }

    if (data.name === 'commerce_saleactivestate') {
      this.setState((state: any) => {
        return {
          commerce: {
            ...state.commerce,
            saleActive: data.payload.saleActive,
            log: [...state.commerce.log, `received message: ${prettyPrint(data)}`],
          },
        }
      })
    }
  };

  onSetUsername = (username: string) => {
    console.log(`Setting username: ${username}`)
    const action = {
      action: 'chat_setusername',
      payload: { username }
    }
    this.sendAction(action)
    this.setState((state: any) => {
      return {
        chat: {
          ...state.chat,
          log: [...state.chat.log, `sent message: ${prettyPrint(action)}`],
        },
        userHasJoinedChat: true,
      }
    })
  }

  onSendChat = (message: string) => {
    console.log(`Sending chat message: ${message}`)
    const action = {
      action: 'chat_sendmessage',
      payload: { message },
    }
    this.sendAction(action)
    this.setState((state: any) => {
      return {
        chat: {
          ...state.chat,
          log: [...state.chat.log, `sent message: ${prettyPrint(action)}`],
        },
      }
    })
  }

  onVote = (answer: any) => {
    console.log(`State in onVoteClick = ${prettyPrint(this.state)}`)
    const action = {
      action: 'vote',
      payload: {
        answerId: answer.id,
      },
    }
    this.sendAction(action)
    this.setState((state: any) => {
      return {
        voting: {
          ...state.voting,
          log: [...state.voting.log, `sent message: ${prettyPrint(action)}`],
        },
      }
    })
  }

  render() {
    const ChatComponent = () => {
      return (
        <ChatScreen
          logMessages={this.state.chat.log}
          messages={this.state.chat.messages}
          userHasJoinedChat={this.state.userHasJoinedChat}
          onSendChatClick={this.onSendChat}
          onJoinChatClick={this.onSetUsername}
        />
      )
    }

    const CommerceComponent = () => {
      return (
        <CommerceScreen
          logMessages={this.state.commerce.log}
          saleActive={this.state.commerce.saleActive}
          saleProducts={this.state.commerce.saleProducts}
        />
      )
    }

    const VoteComponent = () => {
      return (
        <VotingScreen
          logMessages={this.state.voting.log}
          activeQuestion={this.state.voting.activeQuestion}
          onVote={this.onVote}
        />
      )
    }

    let votingTabBadge = null;
    if (this.state.voting.activeQuestion != null) {
      votingTabBadge = ''
    }

    let commerceBadge = null;
    if (this.state.commerce.saleActive) {
      commerceBadge = ''
    }

    return (
      <SafeAreaView style={styles.container}>
        <StageTenPlayer
          uri={playerUri}
          onMessage={this.onMessage}
          ref={(ref) => { this.playerRef = ref }}
        />

        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarLabelPosition: 'beside-icon',
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                let iconName

                if (route.name === 'Chat') {
                  iconName = 'chat'
                } else if (route.name === 'Commerce') {
                  iconName = 'local-offer'
                } else if (route.name === 'Voting') {
                  iconName = 'poll'
                }

                return <MaterialIcons name={iconName} color={color} size={size} />
              }
            })}
          >
            <Tab.Screen name='Chat' component={ChatComponent} />
            <Tab.Screen
              name='Commerce'
              component={CommerceComponent}
              options={{ tabBarBadge: commerceBadge }}
            />
            <Tab.Screen
              name='Voting'
              component={VoteComponent}
              options={{ tabBarBadge: votingTabBadge }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    );
  }
}
