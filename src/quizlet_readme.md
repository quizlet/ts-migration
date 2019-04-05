# Instructions

Install babel globally `yarn global add babel`
Also ts-node

Run `ts-node ./typescript/conversion/convert.ts`

# Automated conversion TODO's

- Remove `// @flow` etc
- Remove `// $FlowFixMe` etc

- replace invariant

# Runbook

`qdev stop` -- otherwise the syncer goes into overdrive
Run `ts-node ./typescript/conversion/convert.ts`

find/replace in .tsx

- `React.Node` -> `React.ReactNode`
- `React.Element` -> `JSX.Element`
- `extends PureComponent {` -> `extends PureComponent<any> {`
- `extends Component {` -> `extends Component<any> {`
- `extends React.Component {` -> `extends React.Component<any> {`
- `from 'set/types.js';` -> `from 'set/types.tsx';` (two files)

QuizletAddQWaitPlugin-test.tsx

- Update the path to the svg mapper in `jest.config.js`.
- js extension in `app/j/__tests__/QuizletWebpackChunkHashPlugin-test.tsx`
- js extension in `app/j/__tests__/QuizletAddQWaitPlugin-test.tsx`

(many of these are fixed in 5e203ea186)

Enable `"javascript.validate.enable"` in `.vscode/settings.json`

# Files with conversion errors

```
[ '/opt/projects/quizlet/app/j/ads/QAdManager.js',
  '/opt/projects/quizlet/app/j/cloze/classes/AnsweredCloze.js',
  '/opt/projects/quizlet/app/j/cloze/classes/Cloze.js',
  '/opt/projects/quizlet/app/j/components/AutoSizer.js',
  '/opt/projects/quizlet/app/j/components/ErrorBoundaryDefault.js',
  '/opt/projects/quizlet/app/j/components/UICheckbox.js',
  '/opt/projects/quizlet/app/j/components/UIFileChooser.js',
  '/opt/projects/quizlet/app/j/create_set/actions/SetActionCreators.js',
  '/opt/projects/quizlet/app/j/hocs/breakpointDecorator.js',
  '/opt/projects/quizlet/app/j/utils/MemoizedCache.js',
  '/opt/projects/quizlet/app/j/utils/WorkerPromiseHelper.js',
  '/opt/projects/quizlet/app/j/utils/log-calls-and-gets.js' ]
```

# Big things to fix:

import svg app/j/assistant/utils/getCheckpointInfo.tsx
yarn add --dev @types/backbone
import graphql files app/j/queries/index.tsx

app/j/checkout/QStripe.tsx(340,26): error TS2304: Cannot find name 'jQuery'.
app/j/combine/components/CombinePage.tsx(99,32): error TS2304: Cannot find name 'SyntheticEvent'.

module for config/languages
module for config/ads

window.branch
window.recurly app/j/components/UpsellModal.tsx
app/j/tracking/AnalyticsTrackingFunctions.tsx(22,14): error TS2339: Property 'fbq' does not exist on type '{ window: Window; document: Document; }'.
app/j/tracking/AnalyticsTrackingFunctions.tsx(34,16): error TS2339: Property 'ga' does not exist on type '{ window: Window; document: Document; }'.
app/j/tracking/AnalyticsTrackingHelper.tsx(79,12): error TS2339: Property 'dataLayer' does not exist on type '{ window: Window; document: Document; }'.
app/j/tracking/loadFacebookTrackingPixel.tsx(12,12): error TS2339: Property '\_fbq' does not exist on type 'Window'.

SyntheticMouseEvent, SyntheticEvent
app/j/components/UITextarea.tsx(18,18): error TS2304: Cannot find name 'SyntheticInputEvent'.

# Good resources

https://github.com/sw-yx/react-typescript-cheatsheet
