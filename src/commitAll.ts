import simplegit from "simple-git/promise";

const filePaths = {
  rootDir: "../quizlet/",
  include: ["app/j", "stories"],
  exclude: ["/vendor/", "i18n/findMessageAndLocale"],
  extensions: [".js", ".jsx"]
};
const git = simplegit(filePaths.rootDir);

export default async function commit(message: string) {
  console.log(`Committing: "${message}"`);
  try {
    await git.add(".");
  } catch (e) {
    console.log("error adding");
    throw new Error(e);
  }

  try {
    await git.commit(message, undefined, { "-n": true });
  } catch (e) {
    console.log("error committing");
    throw new Error(e);
  }
}
