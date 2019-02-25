import * as diff from 'diff'
import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { Theme, withTheme } from '@material-ui/core/styles'
import CodeDiff from '../CodeDiff';

const sha1 = require('sha1')

interface Props {
  node?: q.TreeNode<any>,
  compareWith?: q.Message
  theme: Theme
}

interface State {
  width: number
  node?: q.TreeNode<any>
  currentMessage?: q.Message
}

class ValueRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { width: 0, node: props.node }
  }

  public render() {
    if (!this.props.node) {
      return null
    }

    return (
      <div style={{ padding: '8px 0px 8px 8px' }}>
        <ReactResizeDetector handleWidth={true} onResize={this.updateWidth} />
        {this.renderValue()}
      </div>
    )
  }

  public renderValue() {
    const { node } = this.props
    if (!node || !node.message) {
      return <span key="empty" />
    }

    const message = node.message
    const previousMessages = node.messageHistory.toArray()
    const previousMessage = previousMessages[previousMessages.length - 2]
    const compareMessage = this.props.compareWith || previousMessage || message

    let json
    try {
      json = JSON.parse(message.value)
    } catch (error) {
      return this.renderRawValue(message.value, compareMessage.value)
    }

    if (typeof json === 'string') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else if (typeof json === 'number') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else if (typeof json === 'boolean') {
      return this.renderRawValue(message.value, compareMessage.value)
    } else {
      const current = this.messageToPrettyJson(message) || message.value
      const compare = this.messageToPrettyJson(compareMessage) || compareMessage.value
      const language = current && compare ? 'json' : undefined

      return this.renderDiff(current, compare, language)
    }
  }

  public static getDerivedStateFromProps(props: Props, state: State) {
    const discardEdit = props.node !== state.node || (props.node && props.node.message !== state.currentMessage)
    return {
      ...state,
      node: props.node,
      currentMessage: props.node && props.node.message,
    }
  }

  private renderDiff(current: string = '', previous: string = '') {
    return (
      <CodeDiff
        key={sha1(current + previous)}
        previous={previous}
        current={current}
      />
    )
  }

  private messageToPrettyJson(message?: q.Message): string | undefined {
    if (!message || !message.value) {
      return undefined
    }

    try {
      const json = JSON.parse(message.value)
      return JSON.stringify(json, undefined, '  ')
    } catch {
      return undefined
    }
  }

  private updateWidth = (width: number) => {
    if (width !== this.state.width) {
      this.setState({ width })
    }
  }

  private renderRawValue(value: string, compare: string) {
    return this.renderDiff(value, compare)
  }
}

export default withTheme()(ValueRenderer)
