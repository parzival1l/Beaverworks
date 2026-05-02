import { Conversation } from '@botpress/runtime'
import Charities from '../knowledge/charities'
import searchCharitiesWorkflow from '../workflows/searchCharities'

/**
 * Webchat conversation. Mirrors the Botpress `webchat-rag` example:
 * grounded answers from the charity KB only. The `searchCharities` workflow
 * is exposed as a tool so the model can run the structured donor-match flow
 * directly from a chat message when the user shares enough context.
 */
export default new Conversation({
  channel: 'webchat.channel',
  events: ['webchat:conversationStarted'],
  handler: async (props) => {
    if (
      props.type === 'event' &&
      props.event.type === 'webchat:conversationStarted'
    ) {
      await props.conversation.send({
        type: 'text',
        payload: {
          text:
            'Hi! Tell me what kind of cause matters most to you and I can ' +
            'suggest Canadian charities that match.',
        },
      })
      return
    }

    if (props.type !== 'message') return

    await props.execute({
      instructions:
        'You help donors discover Canadian charities. Always ground answers ' +
        'in the charity knowledge base. If the user describes a donor profile ' +
        '(causes, beneficiaries, geography, giving style) plus a free-form ' +
        'prompt, call the searchCharities tool for a ranked match. Cite the ' +
        'charity name in your reply.',
      knowledge: [Charities],
      tools: [searchCharitiesWorkflow.asTool()],
    })
  },
})
