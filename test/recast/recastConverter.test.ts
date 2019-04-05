import { babelOptions } from '../../src/converter';
import * as babel from '@babel/core';

type TestCase = {
  title: string;
  code: string;
  output: string;
};

const runner = function(testCases: TestCase[]) {
  testCases.forEach(c => {
    it(c.title, () => {
      expect(babel.transform(c.code, babelOptions)!.code).toBe(c.output);
    });
  });
};

describe('recast converter', () => {
  runner([
    {
      title: 'preserves comments above imports',
      code: `// @flow\nimport * as React from \'react\';`,
      output: `// @flow
import * as React from \'react\';
`,
    },
    {
      title: 'preserves comments above imports',
      code: `type Props = {
  children?: React.Node,
  // The vertical alignment of the content before it starts to scroll
  verticalAlignWithoutScroll?: 'top' | 'center',
};`,
      output: `type Props = {
  children?: React.Node;
  // The vertical alignment of the content before it starts to scroll
  verticalAlignWithoutScroll?: 'top' | 'center';
};
`,
    },
  ]);
});
