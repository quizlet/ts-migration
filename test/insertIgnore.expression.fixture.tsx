import * as React from "react";

const Quizlet = {
  doesExist: true
};

function SingleLine() {
  return <div>{Quizlet.doesNotExist && <div className="test" />}</div>;
}

SingleLine();

function MultiLine() {
  return (
    <div
      style={{}}
      className="long class name so the expression is on the next line"
    >
      {Quizlet.doesNotExist && <div className="test" />}
    </div>
  );
}

MultiLine();
