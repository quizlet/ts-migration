import pluginTester from "babel-plugin-tester";
import { buildPlugin } from "../../src/babel-plugin/plugin";
import { TypeCastExpression } from "../../src/babel-plugin/visitors/type_cast_expression";

pluginTester({
  plugin: buildPlugin([TypeCastExpression]),
  tests: [
    {
      title: "type case expression",
      code: `(a: A);`,
      output: `(a as A);`
    }
  ]
});
