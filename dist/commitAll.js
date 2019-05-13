"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("simple-git/promise"));
function commit(message, filePaths) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = promise_1.default(filePaths.rootDir);
        console.log(`Committing: "${message}"`);
        try {
            yield git.add(".");
        }
        catch (e) {
            console.log("error adding");
            throw new Error(e);
        }
        try {
            yield git.commit(message, undefined, { "-n": true });
        }
        catch (e) {
            console.log("error committing");
            throw new Error(e);
        }
    });
}
exports.default = commit;
//# sourceMappingURL=commitAll.js.map