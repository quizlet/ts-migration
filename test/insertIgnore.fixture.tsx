import * as React from "react";

const Quizlet = {
  doesExist: true
};

const foo = Quizlet.doesNotExist();

function MultiLine() {
  return (
    <div
      style={{}}
      className="long class name so the expression is on the next line"
    >
      {Quizlet.doesNotExist && <div bar={foo} className="test" />}
    </div>
  );
}

MultiLine();
